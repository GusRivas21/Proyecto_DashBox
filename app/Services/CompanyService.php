<?php

namespace App\Services;

use App\Events\CompanyRegistered;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Pagination\LengthAwarePaginator;

class CompanyService
{
    public function register(array $data): Company
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => $data['password'], // el cast 'hashed' del modelo la encripta
            ]);
            $user->assignRole('company');

            return $user->company()->create(
                Arr::only($data, ['zone_id', 'administrator_id', 'legal_name', 'name', 'tax_id', 'phone'])
            );
        });
    }


    public function paginate(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $search = $filters['search'] ?? '';
        $status = $filters['status'] ?? 'all';

        return Company::withTrashed()
            ->with('zone:id,district')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('legal_name', 'ilike', "%{$search}%")
                ->orWhere('tax_id', 'ilike', "%{$search}%")))
            ->when($status === 'active', fn ($q) => $q->whereNull('deleted_at'))
            ->when($status === 'inactive', fn ($q) => $q->whereNotNull('deleted_at'))
            ->orderBy('name')
            ->paginate($perPage);
    }
}