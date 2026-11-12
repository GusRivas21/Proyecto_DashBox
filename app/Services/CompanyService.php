<?php

namespace App\Services;

use App\Events\CompanyRegistered;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CompanyService
{
    public function register(array $data): Company
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Str::random(32), 
            ]);
            $user->assignRole('company');

            $company = $user->company()->create(
                Arr::only($data, ['zone_id', 'administrator_id', 'legal_name', 'name', 'tax_id', 'phone'])
            );

            event(new CompanyRegistered($company, $user));

            return $company;
        });
    }
}