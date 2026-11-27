<?php

use App\Models\Company;
use App\Models\Manager;
use App\Models\Recipient;
use App\Models\Shipment;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(DatabaseSeeder::class);
    $this->company = Company::query()->firstOrFail();
    $this->manager = Manager::query()->firstOrFail();
});

function hu14Recipient(Company $company, string $name): Recipient
{
    return $company->recipients()->create(['name' => $name, 'address' => 'Dirección de prueba']);
}

function hu14Shipment(Company $company, Manager $manager, Recipient $recipient, string $status, string $date): Shipment
{
    $shipment = $company->shipments()->create([
        'manager_id' => $manager->id,
        'recipient_id' => $recipient->id,
        'size' => 'small',
        'cargo_type' => 'fragile',
        'status' => $status,
    ]);
    $shipment->forceFill(['created_at' => $date])->save();

    return $shipment;
}

test('a company sees only its shipments and never a recipient from another company', function () {
    $otherUser = User::create([
        'name' => 'Otra empresa',
        'email' => 'empresa-hu14@dashbox.test',
        'password' => Str::random(32),
    ]);
    $otherCompany = Company::forceCreate([
        'id' => $otherUser->id,
        'zone_id' => $this->company->zone_id,
        'administrator_id' => $this->company->administrator_id,
        'legal_name' => 'Otra empresa S.A.',
        'name' => 'Otra empresa',
        'tax_id' => '0614-999999-101-1',
    ]);
    $ownRecipient = hu14Recipient($this->company, 'Nombre de mi empresa');
    $foreignRecipient = hu14Recipient($otherCompany, 'Destinatario ajeno');
    $own = hu14Shipment($this->company, $this->manager, $ownRecipient, 'in_transit', '2026-11-10 09:00:00');
    $inconsistent = hu14Shipment($this->company, $this->manager, $foreignRecipient, 'registered', '2026-11-10 08:00:00');
    hu14Shipment($otherCompany, $this->manager, $foreignRecipient, 'delivered', '2026-11-10 10:00:00');

    $this->actingAs($this->company->user)
        ->get(route('shipments.index', ['company_id' => $otherCompany->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('shipments/index')
            ->has('shipments.data', 2)
            ->where('shipments.data.0.id', $own->id)
            ->where('shipments.data.0.recipient', $ownRecipient->name)
            ->where('shipments.data.0.status', 'in_transit')
            ->where('shipments.data.1.id', $inconsistent->id)
            ->where('shipments.data.1.recipient', null)
        );

    $this->get(route('shipments.index', ['search' => 'Destinatario ajeno']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('shipments.data', 0));
});

test('the date range is inclusive and combines with status and recipient filters', function () {
    $rosa = hu14Recipient($this->company, 'Rosa Rivera');
    $otro = hu14Recipient($this->company, 'Otro destinatario');
    $first = hu14Shipment($this->company, $this->manager, $rosa, 'delivered', '2026-11-10 00:00:00');
    $last = hu14Shipment($this->company, $this->manager, $rosa, 'delivered', '2026-11-11 23:59:59');
    hu14Shipment($this->company, $this->manager, $rosa, 'delivered', '2026-11-09 23:59:59');
    hu14Shipment($this->company, $this->manager, $rosa, 'delivered', '2026-11-12 00:00:00');
    hu14Shipment($this->company, $this->manager, $rosa, 'returned', '2026-11-10 10:00:00');
    hu14Shipment($this->company, $this->manager, $otro, 'delivered', '2026-11-11 10:00:00');

    $this->actingAs($this->company->user)->get(route('shipments.index', [
        'date_from' => '2026-11-10',
        'date_to' => '2026-11-11',
        'status' => 'delivered',
        'search' => 'rOsA',
    ]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('shipments.data', 2)
        ->where('shipments.data.0.id', $last->id)
        ->where('shipments.data.1.id', $first->id)
        ->where('filters.date_from', '2026-11-10')
        ->where('filters.date_to', '2026-11-11')
    );

    $this->get(route('shipments.index', ['date_to' => '2026-11-09']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('shipments.data', 1));
});

test('pagination keeps the selected dates status and search', function () {
    $recipient = hu14Recipient($this->company, 'Allison');
    foreach (range(1, 11) as $row) {
        hu14Shipment($this->company, $this->manager, $recipient, 'assigned', '2026-11-10 09:00:00');
    }

    $this->actingAs($this->company->user)->get(route('shipments.index', [
        'date_from' => '2026-11-10',
        'date_to' => '2026-11-10',
        'status' => 'assigned',
        'search' => 'all',
    ]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('shipments.total', 11)
        ->has('shipments.data', 10)
        ->where('shipments.next_page_url', fn (string $url) => str_contains($url, 'date_from=2026-11-10')
            && str_contains($url, 'date_to=2026-11-10')
            && str_contains($url, 'status=assigned')
            && str_contains($url, 'search=all'))
    );
});

test('the shipment list rejects invalid dates', function (array $filters, string $field) {
    $this->actingAs($this->company->user)
        ->getJson(route('shipments.index', $filters))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'impossible date' => [['date_from' => '2026-11-31'], 'date_from'],
    'inverted range' => [['date_from' => '2026-11-12', 'date_to' => '2026-11-10'], 'date_to'],
]);

test('the company shipment list denies users without an active company profile', function () {
    $transporter = User::role('transporter')->firstOrFail();
    $this->actingAs($transporter)->get(route('shipments.index'))->assertForbidden();

    $companyUser = $this->company->user;
    $this->company->delete();
    $this->actingAs($companyUser)->get(route('shipments.index'))->assertForbidden();
});
