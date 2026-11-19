<?php

namespace App\Services;

use App\Enums\ContractStatus;
use App\Models\Contract;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class ContractService
{
    public function paginate(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $search = $filters['search'] ?? '';
        $status = $filters['status'] ?? 'all';

        return Contract::with(['company' => fn ($q) => $q->withTrashed()->select('id', 'name', 'tax_id')])
            ->when($search !== '', fn ($q) => $q->whereHas('company', fn ($c) => $c
                ->withTrashed()
                ->where(fn ($w) => $w
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('legal_name', 'ilike', "%{$search}%")
                    ->orWhere('tax_id', 'ilike', "%{$search}%"))))
            ->when($status === 'active', fn ($q) => $q
                ->where('status', ContractStatus::Active->value)
                ->whereDate('end_date', '>=', today()))
            ->when($status === 'expired', fn ($q) => $q->where(fn ($w) => $w
                ->where('status', ContractStatus::Expired->value)
                ->orWhere(fn ($x) => $x
                    ->where('status', ContractStatus::Active->value)
                    ->whereDate('end_date', '<', today()))))
            ->when($status === 'cancelled', fn ($q) => $q
                ->where('status', ContractStatus::Cancelled->value))
            ->latest('start_date')
            ->paginate($perPage);
    }

    public function create(array $data): Contract
    {
        $overlaps = Contract::where('company_id', $data['company_id'])
            ->where('status', '!=', ContractStatus::Cancelled->value)
            ->whereDate('start_date', '<=', $data['end_date'])
            ->whereDate('end_date', '>=', $data['start_date'])
            ->exists();

        if ($overlaps) {
            throw ValidationException::withMessages([
                'start_date' => 'Esta empresa ya tiene un contrato en ese rango de fechas.',
            ]);
        }

        return Contract::create([
            ...$data,
            'status' => ContractStatus::Active,
        ]);
    }
}