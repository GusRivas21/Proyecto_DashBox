<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Zone;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = [
            [
                'department' => 'San Salvador',
                'district' => 'San Salvador'
            ],
            [
                'department' => 'La Libertad',
                'district' => 'Santa Tecla'
            ],
            [
                'department' => 'Santa Ana',
                'district' => 'Santa Ana',
                'is_active' => true,
            ],
            [
                'department' => 'San Miguel',
                'district' => 'San Miguel'
            ],
        ];

        foreach ($zones as $zone) {
            Zone::firstOrCreate(
                [
                    'department' => $zone['department'],
                    'district' => $zone['district'],
                ]
            );
        }
    }
}
