<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Manager;
use App\Models\Zone;
use App\Models\User;
use App\Models\Administrator;

class ManagerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'manager@gmail.com')->firstOrFail();
        $administrator = Administrator::firstOrFail();
        $zone = Zone::firstOrFail();

        Manager::firstOrCreate(
            ['id' => $user->id],
            [
                'administrator_id' => $administrator->id,
                'zone_id' => $zone->id,
                'first_name' => 'Manager',
                'last_name' => 'DashBox',
                'national_id' => '1234567890',
                'phone' => '70000001',
            ]
        );
    }
}
