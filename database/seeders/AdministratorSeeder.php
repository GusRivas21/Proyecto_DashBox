<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Administrator;

class AdministratorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'admin@gmail.com')->firstOrFail();

        Administrator::firstOrCreate(
            ['id' => $user->id],
            [
                'first_name' => 'Admin',
                'last_name' => 'DashBox',
            ]
        );
    }
}
