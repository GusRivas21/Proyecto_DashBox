<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\ContractController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::resource('companies', CompanyController::class);
    Route::resource('managers', ManagerController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
    Route::resource('contracts', ContractController::class);

    // Rutas de vista previa de HU-6.
    Route::get('transporters', function () {
        return Inertia::render('transporters/index', [
            'transporters' => [
                [
                    'id' => 1,
                    'first_name' => 'Ana',
                    'last_name' => 'Demo',
                    'national_id' => '00000000-0',
                    'license_number' => 'LIC-DEMO-001',
                    'phone' => '7000-0000',
                    'zone' => 'Distrito de demostración',
                    'manager' => 'Gerente de demostración',
                    'vehicle' => 'Vehículo de demostración',
                    'deleted_at' => null,
                ],
                [
                    'id' => 2,
                    'first_name' => 'Carlos',
                    'last_name' => 'Ejemplo',
                    'national_id' => '11111111-1',
                    'license_number' => 'LIC-DEMO-002',
                    'phone' => null,
                    'zone' => 'Zona de ejemplo',
                    'manager' => 'Gerente de ejemplo',
                    'vehicle' => null,
                    'deleted_at' => '2026-11-01T00:00:00Z',
                ],
            ],
        ]);
    })->middleware('can:transporters.view')->name('transporters.index');

    Route::get('transporters/create', function () {
        return Inertia::render('transporters/create', [
            'options' => ['zones' => [], 'managers' => [], 'vehicles' => []],
        ]);
    })->middleware('can:transporters.view')->name('transporters.create');

    Route::get('transporters/{driver}/edit', function (int $driver) {
        return Inertia::render('transporters/edit', [
            'transporter' => [
                'id' => $driver,
                'first_name' => 'Ana',
                'last_name' => 'Demo',
                'national_id' => '00000000-0',
                'license_number' => 'LIC-DEMO-001',
                'phone' => '7000-0000',
                'zone' => null,
                'manager' => null,
                'vehicle' => null,
            ],
            'options' => ['zones' => [], 'managers' => [], 'vehicles' => []],
        ]);
    })->middleware('can:transporters.view')->name('transporters.edit');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
