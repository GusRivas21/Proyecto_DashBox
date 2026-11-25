<?php

use App\Models\Driver;
use App\Models\Manager;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Zone;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->manager = Manager::query()->firstOrFail();
    $this->driver = Driver::query()->firstOrFail();
});

function transporterEditData(Driver $driver, array $overrides = []): array
{
    return array_replace($driver->only([
        'first_name', 'last_name', 'national_id', 'license_number', 'phone', 'zone_id', 'manager_id', 'vehicle_id',
    ]), $overrides);
}

function transporterEditVehicle(Manager $manager, string $plate, string $status = 'available'): Vehicle
{
    return Vehicle::create([
        'manager_id' => $manager->id,
        'plate' => $plate,
        'brand' => 'Prueba',
        'model' => 'Camión',
        'year' => 2025,
        'capacity' => 100,
        'status' => $status,
    ]);
}

test('a manager loads and saves the actual driver data in their zone', function () {
    $linked = transporterEditVehicle($this->manager, 'HU6-OLD', 'assigned');
    $available = transporterEditVehicle($this->manager, 'HU6-NEW');
    transporterEditVehicle($this->manager, 'HU6-MAINT', 'under_maintenance');
    $this->driver->update(['vehicle_id' => $linked->id]);

    $this->actingAs($this->manager->user)->get(route('transporters.edit', $this->driver))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transporters/edit')
            ->where('transporter.first_name', $this->driver->first_name)
            ->where('transporter.vehicle_id', $linked->id)
            ->where('managerZone.id', $this->manager->zone_id)
            ->has('options.vehicles', 2)
            ->where('options.vehicles.0.id', $available->id)
            ->where('options.vehicles.1.id', $linked->id)
        );

    $data = transporterEditData($this->driver, ['first_name' => 'Nombre actualizado']);
    $this->put(route('transporters.update', $this->driver), $data)
        ->assertRedirect(route('transporters.index'))
        ->assertSessionHas('success');

    expect($this->driver->fresh()->first_name)->toBe('Nombre actualizado')
        ->and($this->driver->fresh()->national_id)->toBe($this->driver->national_id)
        ->and($this->driver->fresh()->vehicle_id)->toBe($linked->id)
        ->and($this->driver->user()->firstOrFail()->name)->toBe('Nombre actualizado DashBox')
        ->and($linked->fresh()->status)->toBe('assigned');
});

test('a manager cannot load or update a driver in another zone', function () {
    $zone = Zone::create(['department' => 'Prueba', 'district' => 'Otra zona']);
    $this->driver->update(['zone_id' => $zone->id]);

    $this->actingAs($this->manager->user)->get(route('transporters.edit', $this->driver))->assertForbidden();
    $this->put(route('transporters.update', $this->driver), transporterEditData($this->driver, ['first_name' => 'No permitido']))
        ->assertForbidden();

    expect($this->driver->fresh()->first_name)->toBe('Transporter');
});

test('an edit rejects duplicate documents licenses and phones across legacy formats', function () {
    $other = User::create([
        'name' => 'Otra cuenta',
        'email' => 'otra-hu6@dashbox.test',
        'password' => Str::random(32),
    ]);
    Driver::forceCreate([
        'id' => $other->id,
        'manager_id' => $this->manager->id,
        'zone_id' => $this->manager->zone_id,
        'first_name' => 'Otro',
        'last_name' => 'Transportista',
        'national_id' => '555555555',
        'license_number' => 'LIC-HU6-OTRA',
        'phone' => '7000-1234',
    ])->delete();

    $this->actingAs($this->manager->user)->from(route('transporters.edit', $this->driver))
        ->put(route('transporters.update', $this->driver), transporterEditData($this->driver, [
            'national_id' => '55555555-5',
            'license_number' => 'lic-hu6-otra',
            'phone' => '70001234',
        ]))
        ->assertRedirect(route('transporters.edit', $this->driver))
        ->assertSessionHasErrors(['national_id', 'license_number', 'phone']);

    expect($this->driver->fresh()->license_number)->toBe('LIC-0001');
});

test('a manager can replace and remove an available vehicle atomically', function () {
    $previous = transporterEditVehicle($this->manager, 'HU6-OLD', 'assigned');
    $replacement = transporterEditVehicle($this->manager, 'HU6-NEW');
    $this->driver->update(['vehicle_id' => $previous->id]);

    $this->actingAs($this->manager->user)
        ->put(route('transporters.update', $this->driver), transporterEditData($this->driver, [
            'vehicle_id' => $replacement->id,
        ]))->assertRedirect(route('transporters.index'))->assertSessionHasNoErrors();

    expect($previous->fresh()->status)->toBe('available')
        ->and($replacement->fresh()->status)->toBe('assigned')
        ->and($this->driver->fresh()->vehicle_id)->toBe($replacement->id);

    $this->put(route('transporters.update', $this->driver), transporterEditData($this->driver, ['vehicle_id' => null]))
        ->assertRedirect(route('transporters.index'))->assertSessionHasNoErrors();

    expect($replacement->fresh()->status)->toBe('available')
        ->and($this->driver->fresh()->vehicle_id)->toBeNull();
});

test('an edit rejects unavailable vehicles and keeps the previous assignment', function () {
    $current = transporterEditVehicle($this->manager, 'HU6-OLD', 'assigned');
    $maintenance = transporterEditVehicle($this->manager, 'HU6-MAINT', 'under_maintenance');
    $this->driver->update(['vehicle_id' => $current->id]);

    $this->actingAs($this->manager->user)->from(route('transporters.edit', $this->driver))
        ->put(route('transporters.update', $this->driver), transporterEditData($this->driver, ['vehicle_id' => $maintenance->id]))
        ->assertSessionHasErrors('vehicle_id');

    expect($current->fresh()->status)->toBe('assigned')
        ->and($this->driver->fresh()->vehicle_id)->toBe($current->id);
});

test('an edit requires a valid phone and preserves the original zone', function () {
    $foreign = Zone::create(['department' => 'Prueba', 'district' => 'Otra zona']);

    $this->actingAs($this->manager->user)
        ->put(route('transporters.update', $this->driver), transporterEditData($this->driver, [
            'zone_id' => $foreign->id,
            'phone' => '--------',
        ]))
        ->assertSessionHasErrors(['zone_id', 'phone']);

    expect($this->driver->fresh()->zone_id)->toBe($this->manager->zone_id);
});

test('a manager cannot edit a deactivated driver', function () {
    $this->driver->delete();

    $this->actingAs($this->manager->user)->get(route('transporters.edit', $this->driver))->assertNotFound();
    $this->put(route('transporters.update', $this->driver), transporterEditData($this->driver))->assertNotFound();
});

test('an edit rejects a manager and vehicle from another zone', function () {
    $outsideZone = Zone::create(['department' => 'Prueba', 'district' => 'Otra zona']);
    $outsideUser = User::create([
        'name' => 'Gerente externo',
        'email' => 'externo-hu6@dashbox.test',
        'password' => Str::random(32),
    ]);
    $outsideManager = $this->manager->replicate()->fill([
        'id' => $outsideUser->id,
        'zone_id' => $outsideZone->id,
        'national_id' => '44444444-4',
    ]);
    $outsideManager->save();
    $vehicle = transporterEditVehicle($outsideManager, 'HU6-OTRA');

    $this->actingAs($this->manager->user)->from(route('transporters.edit', $this->driver))
        ->put(route('transporters.update', $this->driver), transporterEditData($this->driver, ['manager_id' => $outsideManager->id]))
        ->assertSessionHasErrors('manager_id');
    $this->put(route('transporters.update', $this->driver), transporterEditData($this->driver, ['vehicle_id' => $vehicle->id]))
        ->assertSessionHasErrors('vehicle_id');

    expect($this->driver->fresh()->manager_id)->toBe($this->manager->id)
        ->and($this->driver->fresh()->vehicle_id)->toBeNull()
        ->and($vehicle->fresh()->status)->toBe('available');
});

test('the edit route denies accounts outside the manager role', function (string $role) {
    $this->actingAs(User::role($role)->firstOrFail())->get(route('transporters.edit', $this->driver))->assertForbidden();
    $this->put(route('transporters.update', $this->driver), transporterEditData($this->driver))->assertForbidden();
})->with(['administrator', 'transporter']);
