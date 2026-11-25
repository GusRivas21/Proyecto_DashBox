<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\TransporterController;

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

    Route::get('transporters', [TransporterController::class, 'index'])
        ->middleware('can:transporters.view')->name('transporters.index');

    // Vista previa del registro de HU-6.
    Route::get('transporters/create', function () {
        return Inertia::render('transporters/create', [
            'options' => ['zones' => [], 'managers' => [], 'vehicles' => []],
        ]);
    })->middleware('can:transporters.view')->name('transporters.create');

    Route::get('transporters/{driver}/edit', [TransporterController::class, 'edit'])
        ->middleware('can:transporters.view')->name('transporters.edit');
    Route::put('transporters/{driver}', [TransporterController::class, 'update'])
        ->middleware('can:transporters.view')->name('transporters.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
