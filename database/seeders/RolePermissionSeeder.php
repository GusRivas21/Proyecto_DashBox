<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [

            // Dashboard
            'dashboard.view',

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
            'unassignedShipments.view',
            'shipments.view',
            'shipments.create',
            'shipments.edit',
            'shipments.assign',
            'shipments.update_status',
            'shipments.return',

            // Deliveries
            'deliveries.view',
            'deliveries.create',

            // Reports and History
            'reports.view',
            'reports.generate',

            // Emergency
            'emergency.view',
            'emergency.edit',

            // Audit
            'audit.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // ADMINISTRATOR
        $administrator = Role::firstOrCreate([
            'name' => 'administrator',
            'guard_name' => 'web',
        ]);

        $administrator->syncPermissions([
            'dashboard.view',
            'companies.view',
            'companies.create',
            'managers.view',
            'reports.view',
            'emergency.view',
            'audit.view',
        ]);

        // MANAGER
        $manager = Role::firstOrCreate([
            'name' => 'manager',
            'guard_name' => 'web',
        ]);

        $manager->syncPermissions([
            'dashboard.view',

            'transporters.view',

            'vehicles.view',

            'unassignedShipments.view',
            'shipments.edit',
            'shipments.assign',
            'shipments.update_status',
            'shipments.return',

            'reports.view',
            'reports.generate',
        ]);

        // COMPANY
        $company = Role::firstOrCreate([
            'name' => 'company',
            'guard_name' => 'web',
        ]);

        $company->syncPermissions([
            'dashboard.view',

            'recipients.view',
            'recipients.create',
            'recipients.edit',
            'recipients.delete',

            'shipments.view',
            'shipments.create',
        ]);

        // TRANSPORTER
        $transporter = Role::firstOrCreate([
            'name' => 'transporter',
            'guard_name' => 'web',
        ]);

        $transporter->syncPermissions([
            'dashboard.view',
            'shipments.view',
            'shipments.update_status',
            'deliveries.view',
            'deliveries.create'
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
