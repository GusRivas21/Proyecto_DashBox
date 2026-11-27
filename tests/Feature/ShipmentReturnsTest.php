<?php

use App\Models\Company;
use App\Models\Manager;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(DatabaseSeeder::class);
    $this->manager = Manager::firstOrFail();
    $this->company = Company::firstOrFail();
});

function hu17Shipment(Company $company, Manager $manager, string $status, string $name = 'Destinatario de prueba'): Shipment
{
    $recipient = $company->recipients()->create(['name' => $name, 'address' => 'Dirección de prueba']);

    return $company->shipments()->create([
        'manager_id' => $manager->id,
        'recipient_id' => $recipient->id,
        'size' => 'small',
        'cargo_type' => 'fragile',
        'status' => $status,
    ]);
}

function hu17Manager(Manager $reference, int $zoneId): Manager
{
    $user = User::create([
        'name' => 'Gerente de prueba',
        'email' => 'gerente-hu17@dashbox.test',
        'password' => Str::random(32),
    ])->assignRole('manager');

    return Manager::create([
        'id' => $user->id,
        'administrator_id' => $reference->administrator_id,
        'zone_id' => $zoneId,
        'first_name' => 'Gerente',
        'last_name' => 'Prueba',
        'national_id' => '1234567899',
    ]);
}

test('the page only shows returnable and returned shipments from the operational zone', function () {
    $otherZone = Zone::whereKeyNot($this->manager->zone_id)->firstOrFail();
    $foreignManager = hu17Manager($this->manager, $otherZone->id);
    hu17Shipment($this->company, $foreignManager, 'in_transit', 'Destinatario fuera de zona');
    hu17Shipment($this->company, $this->manager, 'delivered');
    $inTransit = hu17Shipment($this->company, $this->manager, 'in_transit');
    $returned = hu17Shipment($this->company, $this->manager, 'returned');
    $returned->shipmentReturns()->create(['reason' => 'Rechazado', 'return_date' => now()->toDateString(), 'status' => 'completed']);
    $returned->shipmentReturns()->create(['reason' => 'Pendiente anterior', 'return_date' => now()->toDateString(), 'status' => 'pending']);

    $this->actingAs($this->manager->user)->get(route('returns.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('returns/index')
            ->where('zone', $this->manager->zone->district)
            ->has('shipments.data', 2)
            ->where('shipments.data.0.id', $inTransit->id)
            ->where('shipments.data.0.can_return', true)
            ->where('shipments.data.1.id', $returned->id)
            ->where('shipments.data.1.can_return', false)
            ->where('shipments.data.1.reason', 'Rechazado')
        );
});

test('a manager can return a shipment from another manager in the same zone and a retry creates no second return', function () {
    $peer = hu17Manager($this->manager, $this->manager->zone_id);
    $shipment = hu17Shipment($this->company, $peer, 'in_transit');
    $data = ['shipment_id' => $shipment->id, 'reason' => '  El destinatario rechazó el envío.  ', 'status' => 'pending', 'return_date' => '2001-01-01'];

    $this->actingAs($this->manager->user)->post(route('returns.store'), $data)
        ->assertRedirect(route('returns.index'))
        ->assertSessionHas('success');

    expect($shipment->refresh()->status)->toBe('returned');
    $this->assertDatabaseHas('shipment_returns', [
        'shipment_id' => $shipment->id,
        'reason' => 'El destinatario rechazó el envío.',
        'status' => 'completed',
        'return_date' => now()->toDateString(),
    ]);

    $this->postJson(route('returns.store'), $data)->assertUnprocessable()->assertJsonValidationErrors('shipment_id');
    $this->assertDatabaseCount('shipment_returns', 1);
});

test('the return rejects a shipment in a different zone without changing it', function () {
    $foreignManager = hu17Manager($this->manager, Zone::whereKeyNot($this->manager->zone_id)->firstOrFail()->id);
    $shipment = hu17Shipment($this->company, $foreignManager, 'in_transit');

    $this->actingAs($this->manager->user)->postJson(route('returns.store'), ['shipment_id' => $shipment->id, 'reason' => 'Prueba'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.shipment_id.0', 'El envío no está disponible en tu zona.');

    expect($shipment->refresh()->status)->toBe('in_transit');
    $this->assertDatabaseCount('shipment_returns', 0);
});

test('the return rejects a blank or oversized reason and preserves the shipment', function (string $reason) {
    $shipment = hu17Shipment($this->company, $this->manager, 'in_transit');

    $this->actingAs($this->manager->user)->postJson(route('returns.store'), ['shipment_id' => $shipment->id, 'reason' => $reason])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('reason');

    expect($shipment->refresh()->status)->toBe('in_transit');
    $this->assertDatabaseCount('shipment_returns', 0);
})->with(['blank' => [" \t "], 'too long' => [str_repeat('a', 256)]]);

test('the return rejects shipments in ineligible states', function (string $status) {
    $shipment = hu17Shipment($this->company, $this->manager, $status);

    $this->actingAs($this->manager->user)->postJson(route('returns.store'), ['shipment_id' => $shipment->id, 'reason' => 'Prueba'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('shipment_id');

    expect($shipment->refresh()->status)->toBe($status);
    $this->assertDatabaseCount('shipment_returns', 0);
})->with(['registered', 'assigned', 'delivered', 'cancelled']);

test('a session with the manager role, permission and active profile is required', function () {
    $shipment = hu17Shipment($this->company, $this->manager, 'in_transit');
    $data = ['shipment_id' => $shipment->id, 'reason' => 'Prueba'];
    $this->get(route('returns.index'))->assertRedirect(route('login'));
    $this->postJson(route('returns.store'), $data)->assertUnauthorized();

    $companyUser = $this->company->user->givePermissionTo('shipments.return');
    $this->actingAs($companyUser)->get(route('returns.index'))->assertForbidden();
    $this->postJson(route('returns.store'), $data)->assertForbidden();

    $managerUser = $this->manager->user;
    $this->manager->delete();
    $this->actingAs($managerUser)->get(route('returns.index'))->assertForbidden();
    $this->postJson(route('returns.store'), $data)->assertForbidden();

    expect($shipment->refresh()->status)->toBe('in_transit');
    $this->assertDatabaseCount('shipment_returns', 0);
});

test('a failure while saving the new shipment status rolls back the reason and shows no confirmation', function () {
    $shipment = hu17Shipment($this->company, $this->manager, 'in_transit');
    DB::statement("ALTER TABLE shipments ADD CHECK (status <> 'returned')");

    $this->actingAs($this->manager->user)->from(route('returns.index'))
        ->post(route('returns.store'), ['shipment_id' => $shipment->id, 'reason' => 'Prueba de rollback'])
        ->assertRedirect(route('returns.index'))
        ->assertSessionHasErrors('shipment_id')
        ->assertSessionMissing('success');

    expect($shipment->refresh()->status)->toBe('in_transit');
    $this->assertDatabaseCount('shipment_returns', 0);
});
