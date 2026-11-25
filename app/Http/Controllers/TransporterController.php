<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateDriverRequest;
use App\Models\Driver;
use App\Models\Manager;
use App\Services\TransporterService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransporterController extends Controller
{
    public function index(Request $request): Response
    {
        $manager = $this->manager($request);

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

    public function edit(Request $request, Driver $driver, TransporterService $service): Response
    {
        abort_unless($driver->zone_id === $this->manager($request)->zone_id, 403);

        $driver->load(['zone', 'manager' => fn ($query) => $query->withTrashed(), 'vehicle']);
        $zone = [
            'id' => $driver->zone_id,
            'label' => $driver->zone->district.', '.$driver->zone->department,
        ];

        return Inertia::render('transporters/edit', [
            'transporter' => [
                ...$driver->only(['id', 'first_name', 'last_name', 'national_id', 'license_number', 'phone']),
                'manager_id' => $driver->manager_id,
                'vehicle_id' => $driver->vehicle_id,
            ],
            'managerZone' => $zone,
            'options' => $service->options($driver),
        ]);
    }

    public function update(UpdateDriverRequest $request, Driver $driver, TransporterService $service): RedirectResponse
    {
        $service->update($driver, $request->user()->getKey(), $request->validated());

        return to_route('transporters.index')->with('success', 'Transportista actualizado.');
    }

    private function manager(Request $request): Manager
    {
        $user = $request->user();
        abort_unless($user->hasRole('manager'), 403);

        $manager = Manager::query()->find($user->getKey());
        abort_if($manager === null, 403);

        return $manager;
    }
}
