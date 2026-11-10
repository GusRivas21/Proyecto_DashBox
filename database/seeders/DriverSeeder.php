<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Manager;
use App\Models\Zone;
use App\Models\Driver;

class DriverSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'transporter@gmail.com')->firstOrFail();
        $manager = Manager::firstOrFail();
        $zone = Zone::firstOrFail();

        Driver::firstOrCreate(
            ['id' => $user->id],
            [
                'vehicle_id' => null,
                'zone_id' => $zone->id,
                'manager_id' => $manager->id,
                'first_name' => 'Transporter',
                'last_name' => 'DashBox',
                'national_id' => '1234567891',
                'license_number' => 'LIC-0001',
                'phone' => '70000003',
            ]
        );
    }
}
