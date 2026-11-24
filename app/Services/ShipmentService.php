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

class ShipmentService
{
    public function paginate(int $companyId, array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? '';
        $status = $filters['status'] ?? 'all';

        return Shipment::query()
            ->with('recipient:id,name')
            ->where('company_id', $companyId)
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('cargo_type', 'like', "%{$search}%")
                    ->orWhere('size', 'like', "%{$search}%")
                    ->orWhereHas('recipient', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate(10);
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

        // El gerente se asigna según la zona de la empresa
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