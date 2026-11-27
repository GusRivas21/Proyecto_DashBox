<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Contract;
use App\Models\Manager;
use App\Models\Recipient;
use App\Models\Shipment;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ShipmentService
{
    /**
     * Etiquetas que ve el usuario (sin acentos y en minúsculas) por cada valor guardado.
     */
    private const SIZE_LABELS = [
        'small'  => 'pequeno',
        'medium' => 'mediano',
        'large'  => 'grande',
    ];

    private const CARGO_LABELS = [
        'fragile' => 'fragil',
        'neutral' => 'neutro',
        'heavy'   => 'pesado',
    ];

    public function paginate(int $companyId, array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? '';
        $status = $filters['status'] ?? 'all';

        $dateFrom = $filters['date_from'] ?? '';
        $dateTo = $filters['date_to'] ?? '';

        return Shipment::query()
            ->with(['recipient' => fn ($query) => $query->where('company_id', $companyId)->select('id', 'name')])
            ->where('company_id', $companyId)
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->when($dateFrom !== '', fn ($query) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($query) => $query->whereDate('created_at', '<=', $dateTo))
            ->when($search !== '', function ($query) use ($search, $companyId) {
                $sizes  = $this->matchingValues(self::SIZE_LABELS, $search);
                $cargos = $this->matchingValues(self::CARGO_LABELS, $search);

                $query->where(function ($query) use ($search, $sizes, $cargos, $companyId) {
                    $query->whereHas('recipient', fn ($recipient) => $recipient->where('company_id', $companyId)->where('name', 'ilike', "%{$search}%"))
                        ->orWhereIn('size', $sizes)
                        ->orWhereIn('cargo_type', $cargos);
                });
            })
            ->latest()
            ->orderByDesc('id')
            ->paginate(10);
    }

    /**
     * Devuelve los valores guardados cuya etiqueta contiene el texto buscado.
     */
    private function matchingValues(array $labels, string $search): array
    {
        $term = Str::lower(Str::ascii($search));

        return array_keys(array_filter($labels, fn ($label) => str_contains($label, $term)));
    }

    public function recipientsForCompany(int $companyId): Collection
    {
        return Recipient::where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'contact']);
    }

    public function hasActiveContract(int $companyId): bool
    {
        $today = now()->toDateString();

        return Contract::where('company_id', $companyId)
            ->where('status', 'active')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->exists();
    }

    public function ensureActiveContract(int $companyId): void
    {
        if (! $this->hasActiveContract($companyId)) {
            throw new DomainException('Tu empresa no tiene un contrato vigente. No es posible registrar envíos.');
        }
    }

    public function findForCompany(int $id, int $companyId): Shipment
    {
        return Shipment::where('company_id', $companyId)->findOrFail($id);
    }

    public function findEditable(int $id, int $companyId): Shipment
    {
        $shipment = $this->findForCompany($id, $companyId);

        if ($shipment->status !== 'registered') {
            throw new DomainException('Solo se pueden modificar envíos en estado pendiente.');
        }

        return $shipment;
    }

    public function register(int $companyId, array $data): Shipment
    {
        $this->ensureActiveContract($companyId);

        $company = Company::findOrFail($companyId);

        $managerId = Manager::where('zone_id', $company->zone_id)->value('id');

        if (! $managerId) {
            throw new DomainException('No hay un gerente asignado a la zona de tu empresa.');
        }

        return Shipment::create([
            ...$data,
            'company_id' => $companyId,
            'manager_id' => $managerId,
            'status'     => 'registered', // pendiente
        ]);
    }

    public function update(int $id, int $companyId, array $data): Shipment
    {
        $shipment = $this->findEditable($id, $companyId);
        $shipment->update($data);

        return $shipment;
    }

    public function cancel(int $id, int $companyId): void
    {
        $shipment = $this->findEditable($id, $companyId);
        $shipment->update(['status' => 'cancelled']);
    }
}