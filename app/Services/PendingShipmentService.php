<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Manager;
use App\Models\Shipment;
use Illuminate\Pagination\LengthAwarePaginator;

class PendingShipmentService
{
    public function paginate(int $managerId, array $filters): LengthAwarePaginator
    {
        $search    = $filters['search'] ?? '';
        $companyId = $filters['company'] ?? 'all';
        $digits    = preg_replace('/\D/', '', $search);

        return Shipment::query()
            ->with([
                'company' => fn ($query) => $query->withTrashed()->with('zone'),
                'recipient',
            ])
            ->where('manager_id', $managerId)
            ->where('status', 'registered')
            ->whereNull('driver_id')
            ->when($companyId !== 'all', fn ($query) => $query->where('company_id', (int) $companyId))
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search, $digits) {
                $query->whereHas('recipient', fn ($q) => $q->where('name', 'ilike', "%{$search}%"));

                // El código DB-1043 equivale al id 1043
                if ($digits !== '' && strlen($digits) <= 9) {
                    $query->orWhere('id', (int) $digits);
                }
            }))
            ->oldest()
            ->paginate(10);
    }

    /**
     * Zona del gerente y empresas de esa zona (para el filtro).
     */
    public function zoneContext(int $managerId): array
    {
        $manager = Manager::with('zone')->findOrFail($managerId);

        return [
            'zone'      => $manager->zone?->district,
            'companies' => Company::where('zone_id', $manager->zone_id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ];
    }
}