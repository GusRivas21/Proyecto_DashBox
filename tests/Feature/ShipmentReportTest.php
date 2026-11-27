<?php

use App\Models\Administrator;
use App\Models\Company;
use App\Models\Driver;
use App\Models\Manager;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use OpenSpout\Reader\XLSX\Reader;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(DatabaseSeeder::class);
    $this->manager = Manager::firstOrFail();
    $this->admin = Administrator::firstOrFail();
    $this->company = Company::firstOrFail();
});

function hu11Shipment(Company $company, Manager $manager, string $name, string $status, ?string $deliveredOn = null): Shipment
{
    $recipient = $company->recipients()->create(['name' => $name, 'address' => 'Dirección de prueba']);
    $shipment = $company->shipments()->create([
        'manager_id' => $manager->id,
        'recipient_id' => $recipient->id,
        'driver_id' => Driver::firstOrFail()->id,
        'size' => 'small',
        'cargo_type' => 'fragile',
        'status' => $status,
    ]);
    $shipment->forceFill(['created_at' => '2026-11-01 23:59:59'])->save();

    if ($deliveredOn !== null) {
        $shipment->deliveryProofs()->create(['proof_date' => $deliveredOn, 'type' => 'signature']);
    }

    return $shipment;
}

function hu11ForeignManager(Manager $reference): Manager
{
    $user = User::create([
        'name' => 'Gerente de otra zona',
        'email' => 'gerente-hu11@dashbox.test',
        'password' => Str::random(32),
    ])->assignRole('manager');

    return Manager::create([
        'id' => $user->id,
        'administrator_id' => $reference->administrator_id,
        'zone_id' => Zone::whereKeyNot($reference->zone_id)->firstOrFail()->id,
        'first_name' => 'Gerente',
        'last_name' => 'Prueba',
        'national_id' => '1234567899',
    ]);
}

function hu11Workbook(string $contents): array
{
    $path = tempnam(sys_get_temp_dir(), 'dashbox-hu11-');
    $reader = new Reader;

    try {
        file_put_contents($path, $contents);
        $reader->open($path);

        foreach ($reader->getSheetIterator() as $sheet) {
            return [
                'name' => $sheet->getName(),
                'rows' => iterator_to_array($sheet->getRowIterator(), false),
                'xml' => file_get_contents('zip://'.$path.'#xl/worksheets/sheet1.xml'),
            ];
        }

        throw new RuntimeException('The exported workbook has no sheets.');
    } finally {
        $reader->close();
        unlink($path);
    }
}

test('the manager history contains only delivered shipments in the zone and uses the recorded delivery date', function () {
    $own = hu11Shipment($this->company, $this->manager, 'Martina', 'delivered', '2026-11-03');
    $own->deliveryProofs()->create(['proof_date' => '2026-11-02', 'type' => 'photo']);
    hu11Shipment($this->company, $this->manager, 'Sin comprobante', 'delivered');
    hu11Shipment($this->company, $this->manager, 'En ruta', 'in_transit', '2026-11-05');
    hu11Shipment($this->company, hu11ForeignManager($this->manager), 'Otra zona', 'delivered', '2026-11-04');

    $this->actingAs($this->manager->user)->get(route('reports.index', ['zone_id' => 999]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('view', 'deliveries')
            ->where('zone', $this->manager->zone->district)
            ->where('canExport', true)
            ->has('shipments.data', 2)
            ->where('shipments.data.0.recipient', 'Martina')
            ->where('shipments.data.0.status_label', 'Entregado')
            ->where('shipments.data.0.registered_on', '2026-11-01')
            ->where('shipments.data.0.delivered_on', '2026-11-03')
            ->where('shipments.data.1.recipient', 'Sin comprobante')
            ->where('shipments.data.1.delivered_on', null)
        );
});

test('the shipment report shows each role the correct scope and retains historical names', function () {
    $foreignManager = hu11ForeignManager($this->manager);
    hu11Shipment($this->company, $this->manager, 'Pendiente de mi zona', 'registered');
    $foreignShipment = hu11Shipment($this->company, $foreignManager, 'Entregado en otra zona', 'delivered', '2026-11-02');
    $this->company->delete();
    $foreignShipment->driver->delete();
    $foreignManager->delete();

    $this->actingAs($this->manager->user)->get(route('reports.index', ['view' => 'shipments']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('view', 'shipments')
            ->has('shipments.data', 1)
            ->where('shipments.data.0.recipient', 'Pendiente de mi zona')
            ->where('shipments.data.0.delivered_on', null)
        );

    $this->actingAs($this->admin->user)->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('view', 'shipments')
            ->where('zone', null)
            ->where('canExport', false)
            ->has('shipments.data', 2)
            ->where('shipments.data.0.zone', $foreignManager->zone->district.', '.$foreignManager->zone->department)
            ->where('shipments.data.0.company', $this->company->name)
            ->where('shipments.data.0.driver', 'Transporter DashBox')
            ->where('shipments.data.0.recipient', 'Entregado en otra zona')
        );
});

test('the Excel export uses the same view and zone and provides columns, filters and actual dates', function () {
    hu11Shipment($this->company, $this->manager, '=2+2', 'delivered', '2026-11-03');
    hu11Shipment($this->company, $this->manager, 'Pendiente local', 'registered');
    hu11Shipment($this->company, hu11ForeignManager($this->manager), 'Fuera de zona', 'delivered', '2026-11-04');

    $this->actingAs($this->manager->user);
    $response = $this->get(route('reports.export', ['view' => 'deliveries', 'zone_id' => 999]));
    $response->assertOk()->assertDownload('historial-entregas.xlsx')
        ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    $history = hu11Workbook($response->streamedContent());
    expect($history['name'])->toBe('Historial de entregas');
    expect($history['xml'])->toContain('autoFilter ref="A1:H2"', 'ySplit="1"');
    expect($history['rows'])->toHaveCount(2);
    expect($history['rows'][0]->toArray())->toBe(['Envío', 'Empresa', 'Destinatario', 'Transportista', 'Zona', 'Estado', 'Fecha de registro', 'Fecha de entrega']);
    $worksheet = simplexml_load_string($history['xml']);
    $nameCell = $worksheet->xpath('//*[local-name()="c"][@r="C2"]')[0];
    expect((string) $nameCell['t'])->toBe('inlineStr');
    expect((string) $nameCell->is->t)->toBe('=2+2');
    expect(isset($nameCell->f))->toBeFalse();
    $cells = $history['rows'][1]->getCells();
    expect($cells[5]->getValue())->toBe('Entregado');
    expect($cells[6]->getValue()->format('Y-m-d'))->toBe('2026-11-01');
    expect($cells[7]->getValue()->format('Y-m-d'))->toBe('2026-11-03');

    $response = $this->get(route('reports.export', ['view' => 'shipments']));
    $response->assertOk()->assertDownload('reporte-envios.xlsx');
    $report = hu11Workbook($response->streamedContent());
    expect($report['name'])->toBe('Reporte de envíos');
    expect($report['rows'])->toHaveCount(3);
    expect($report['rows'][1]->toArray()[2])->toBe('Pendiente local');
    expect($report['rows'][1]->toArray()[7] ?? '')->toBe('');
});

test('report pagination keeps the selected view and the workbook includes rows beyond the first page', function () {
    foreach (range(1, 16) as $number) {
        hu11Shipment($this->company, $this->manager, "Fila número {$number}", 'registered');
    }

    $this->actingAs($this->manager->user)->get(route('reports.index', ['view' => 'shipments']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('shipments.total', 16)
            ->has('shipments.data', 15)
            ->where('shipments.next_page_url', fn (string $url) => str_contains($url, 'view=shipments') && str_contains($url, 'page=2'))
        );

    $workbook = hu11Workbook($this->get(route('reports.export', ['view' => 'shipments']))->assertOk()->streamedContent());
    expect($workbook['rows'])->toHaveCount(17);
    expect($workbook['rows'][1]->toArray()[2])->toBe('Fila número 16');
    expect($workbook['rows'][16]->toArray()[2])->toBe('Fila número 1');
});

test('an active authorized profile is required and export uses its separate permission', function () {
    $this->get(route('reports.index'))->assertRedirect(route('login'));
    $this->get(route('reports.export'))->assertRedirect(route('login'));

    $companyUser = $this->company->user->givePermissionTo('reports.view', 'reports.generate');
    $this->actingAs($companyUser)->get(route('reports.index'))->assertForbidden();
    $this->get(route('reports.export'))->assertForbidden();

    $this->actingAs($this->admin->user)->get(route('reports.export'))->assertForbidden();
    $adminUser = $this->admin->user;
    $this->admin->delete();
    $this->actingAs($adminUser)->get(route('reports.index'))->assertForbidden();

    $managerUser = $this->manager->user;
    $this->manager->delete();
    $this->actingAs($managerUser)->get(route('reports.index'))->assertForbidden();
    $this->get(route('reports.export'))->assertForbidden();
});
