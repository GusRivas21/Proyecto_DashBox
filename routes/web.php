<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\RecipientController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\PendingShipmentController;

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
    Route::resource('recipients', RecipientController::class);
    Route::resource('shipments', ShipmentController::class);
    Route::get('unassigned-shipments', [PendingShipmentController::class, 'index'])
        ->name('unassigned-shipments.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
