<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Administrator;
use App\Models\Zone;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'company@gmail.com')->firstOrFail();
        $administrator = Administrator::firstOrFail();
        $zone = Zone::firstOrFail();

        Company::firstOrCreate(
            ['id' => $user->id],
            [
                'zone_id' => $zone->id,
                'administrator_id' => $administrator->id,
                'legal_name' => 'Empresa de Prueba S.A. de C.V.',
                'name' => 'Empresa de Prueba',
                'tax_id' => '0614-123456-101-1',
                'phone' => '70000002',
            ]
        );
    }
}
