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
                'district' => 'San Salvador',
                'is_active' => true,
            ],
            [
                'department' => 'La Libertad',
                'district' => 'Santa Tecla',
                'is_active' => true,
            ],
            [
                'department' => 'Santa Ana',
                'district' => 'Santa Ana',
                'is_active' => true,
            ],
            [
                'department' => 'San Miguel',
                'district' => 'San Miguel',
                'is_active' => true,
            ],
        ];

        foreach ($zones as $zone) {
            Zone::firstOrCreate(
                [
                    'department' => $zone['department'],
                    'district' => $zone['district'],
                ],
                [
                    'is_active' => $zone['is_active'],
                ]
            );
        }
    }
}
