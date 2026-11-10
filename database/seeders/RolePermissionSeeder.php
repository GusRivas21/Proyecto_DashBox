<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Administrators
            'administrators.view',
            'administrators.create',
            'administrators.edit',
            'administrators.delete',

            // Managers
            'managers.view',
            'managers.create',
            'managers.edit',
            'managers.delete',

            // Companies
            'companies.view',
            'companies.create',
            'companies.edit',
            'companies.deactivate',

            // Transporters
            'transporters.view',
            'transporters.create',
            'transporters.edit',
            'transporters.delete',

            // Vehicles
            'vehicles.view',
            'vehicles.create',
            'vehicles.edit',
            'vehicles.delete',

            // Recipients
            'recipients.view',
            'recipients.create',
            'recipients.edit',
            'recipients.delete',

            // Shipments
            'shipments.view',
            'shipments.create',
            'shipments.edit',
            'shipments.assign',
            'shipments.update_status',

            // Reports
            'reports.view',
            'reports.generate',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Create roles

        $administrator = Role::firstOrCreate([
            'name' => 'administrator',
            'guard_name' => 'web',
        ]);

        $manager = Role::firstOrCreate([
            'name' => 'manager',
            'guard_name' => 'web',
        ]);

        $company = Role::firstOrCreate([
            'name' => 'company',
            'guard_name' => 'web',
        ]);

        $transporter = Role::firstOrCreate([
            'name' => 'transporter',
            'guard_name' => 'web',
        ]);

        // Assign permissions to roles
        $administrator->syncPermissions(Permission::all());

        $manager->syncPermissions([
            'transporters.view',
            'vehicles.view',
            'shipments.view',
            'shipments.edit',
            'shipments.assign',
            'shipments.update_status',
            'reports.view',
            'reports.generate',
        ]);

        $company->syncPermissions([
            'recipients.view',
            'recipients.create',
            'recipients.edit',
            'recipients.delete',
            'shipments.view',
            'shipments.create',
        ]);

        $transporter->syncPermissions([
            'shipments.view',
            'shipments.update_status',
        ]);
    }
}
