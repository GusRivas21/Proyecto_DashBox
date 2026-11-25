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
});

test('a manager only receives transporters from the authenticated zone', function () {
    $manager = Manager::query()->firstOrFail();
    $seededDriver = Driver::query()->firstOrFail();
    $vehicle = Vehicle::create([
        'manager_id' => $manager->id,
        'plate' => 'TEST-001',
        'brand' => 'Prueba',
        'model' => 'Camion',
        'year' => 2024,
        'capacity' => 100,
        'status' => 'assigned',
    ]);
    $seededDriver->update(['vehicle_id' => $vehicle->id]);

    $createUser = fn (string $document): User => User::create([
        'name' => 'Usuario de prueba',
        'email' => $document.'@dashbox.test',
        'password' => Str::random(32),
    ]);
    $createManager = function (Zone $zone, string $document) use ($manager, $createUser): Manager {
        return Manager::create([
            'id' => $createUser($document)->id,
            'administrator_id' => $manager->administrator_id,
            'zone_id' => $zone->id,
            'first_name' => 'Otro',
            'last_name' => 'Gerente',
            'national_id' => $document,
        ]);
    };
    $createDriver = function (Manager $supervisor, string $name, string $document) use ($createUser): Driver {
        return Driver::forceCreate([
            'id' => $createUser($document)->id,
            'zone_id' => $supervisor->zone_id,
            'manager_id' => $supervisor->id,
            'first_name' => $name,
            'last_name' => 'Prueba',
            'national_id' => $document,
            'license_number' => 'LIC-'.$document,
        ]);
    };

    $sameZone = $createManager($manager->zone, '44444444-4');
    $inactive = $createDriver($sameZone, 'Ana', '44444445-4');
    $inactive->delete();

    $otherZone = Zone::create(['department' => 'Prueba', 'district' => 'Otra zona']);
    $outside = $createDriver($createManager($otherZone, '55555555-5'), 'Fuera de zona', '55555556-5');

    $this->actingAs($manager->user)
        ->get(route('transporters.index', ['zone_id' => $outside->zone_id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transporters/index')
            ->has('transporters', 2)
            ->where('transporters.0.id', $inactive->id)
            ->where('transporters.0.manager', 'Otro Gerente')
            ->whereType('transporters.0.deleted_at', 'string')
            ->where('transporters.1.id', $seededDriver->id)
            ->where('transporters.1.vehicle', 'TEST-001')
            ->where('transporters.1.deleted_at', null)
        );
});

test('a manager without an active profile cannot view the transporters directory', function () {
    $manager = Manager::query()->firstOrFail();
    $manager->delete();

    $this->actingAs($manager->user)->get(route('transporters.index'))->assertForbidden();
});

test('only a manager can view the transporters directory', function (string $role) {
    $user = User::role($role)->firstOrFail();

    $this->actingAs($user)->get(route('transporters.index'))->assertForbidden();
})->with(['administrator', 'transporter']);
