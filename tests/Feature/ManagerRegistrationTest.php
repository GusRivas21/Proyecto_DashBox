<?php

use App\Models\Administrator;
use App\Models\Manager;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

function managerRegistrationAdmin(): User
{
    (new Database\Seeders\RolePermissionSeeder())->run();

    $admin = User::factory()->create();
    Administrator::create([
        'id' => $admin->id,
        'first_name' => 'Admin',
        'last_name' => 'General',
    ]);
    $admin->assignRole(Role::findByName('administrator'));

    return $admin;
}

function managerRegistrationPayload(Zone $zone, array $overrides = []): array
{
    return array_merge([
        'first_name' => 'María',
        'last_name' => 'López',
        'national_id' => '12345678-9',
        'phone' => '7000-1234',
        'email' => 'maria@example.com',
        'password' => 'Gerente123',
        'zone_id' => $zone->id,
    ], $overrides);
}

test('administrator can create a manager account assigned to a zone', function () {
    $admin = managerRegistrationAdmin();
    $zone = Zone::create(['department' => 'San Salvador', 'municipality' => 'Centro', 'district' => 'Mejicanos']);

    $response = $this->actingAs($admin)->post('/managers', managerRegistrationPayload($zone));

    $response->assertRedirect(route('managers.index'));
    $managerUser = User::where('email', 'maria@example.com')->firstOrFail();
    $manager = Manager::findOrFail($managerUser->id);

    expect($manager->first_name)->toBe('María')
        ->and($manager->zone_id)->toBe($zone->id)
        ->and($manager->administrator_id)->toBe($admin->id)
        ->and(Hash::check('Gerente123', $managerUser->password))->toBeTrue()
        ->and($managerUser->hasRole('manager'))->toBeTrue();
});

test('manager registration rejects duplicate email and identity document', function () {
    $admin = managerRegistrationAdmin();
    $zone = Zone::create(['department' => 'San Salvador', 'municipality' => 'Centro', 'district' => 'Mejicanos']);
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);
    Manager::create([
        'id' => $existingUser->id,
        'administrator_id' => $admin->id,
        'zone_id' => $zone->id,
        'first_name' => 'Otro',
        'last_name' => 'Gerente',
        'national_id' => '87654321-0',
        'phone' => '7000-4321',
    ]);

    $this->actingAs($admin)->from('/managers/create')->post('/managers', managerRegistrationPayload($zone, [
        'national_id' => '87654321-0',
        'email' => 'existing@example.com',
    ]))->assertSessionHasErrors(['email', 'national_id']);

    expect(User::where('email', 'maria@example.com')->exists())->toBeFalse();
});
