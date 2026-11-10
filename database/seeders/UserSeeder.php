<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Manager;
use App\Models\Administrator;
use App\Models\Zone;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $administrator = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('12345'),
                'email_verified_at' => now(),
            ]
        );

        $administrator->assignRole('administrator');

        // Manager
        $manager = User::firstOrCreate(
            ['email' => 'manager@gmail.com'],
            [
                'name' => 'Manager',
                'password' => Hash::make('12345'),
                'email_verified_at' => now(),
            ]
        );

        $manager->syncRoles(['manager']);

        // Company
        $company = User::firstOrCreate(
            ['email' => 'company@gmail.com'],
            [
                'name' => 'Company',
                'password' => Hash::make('12345'),
                'email_verified_at' => now(),
            ]
        );

        $company->syncRoles(['company']);

        // Transporter
        $transporter = User::firstOrCreate(
            ['email' => 'transporter@gmail.com'],
            [
                'name' => 'Transporter',
                'password' => Hash::make('12345'),
                'email_verified_at' => now(),
            ]
        );

        $transporter->syncRoles(['transporter']);
    }
}
