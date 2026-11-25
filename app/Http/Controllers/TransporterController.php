<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Manager;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransporterController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->hasRole('manager'), 403);

        $manager = Manager::query()->find($user->getKey());
        abort_if($manager === null, 403);

        $transporters = Driver::query()
            ->withTrashed()
            ->where('zone_id', $manager->zone_id)
            ->with([
                'zone:id,department,district',
                'manager' => fn ($query) => $query->withTrashed()->select('id', 'first_name', 'last_name'),
                'vehicle:id,plate',
            ])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->orderBy('id')
            ->get()
            ->map(fn (Driver $driver) => [
                'id' => $driver->id,
                'first_name' => $driver->first_name,
                'last_name' => $driver->last_name,
                'national_id' => $driver->national_id,
                'license_number' => $driver->license_number,
                'phone' => $driver->phone,
                'zone' => $driver->zone ? $driver->zone->district.', '.$driver->zone->department : null,
                'manager' => $driver->manager ? $driver->manager->first_name.' '.$driver->manager->last_name : null,
                'vehicle' => $driver->vehicle?->plate,
                'deleted_at' => $driver->deleted_at?->toISOString(),
            ]);

        return Inertia::render('transporters/index', ['transporters' => $transporters]);
    }
}
