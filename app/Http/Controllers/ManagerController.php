<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreManagerRequest;
use App\Http\Requests\UpdateManagerRequest;
use App\Models\Manager;
use App\Models\Zone;
use App\Services\ManagerService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ManagerController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:managers.view', only: ['index', 'show']),
            new Middleware('can:managers.create', only: ['create', 'store']),
            new Middleware('can:managers.edit', only: ['edit', 'update']),
            new Middleware('can:managers.delete', only: ['destroy']),
        ];
    }

    public function index(ManagerService $service)
    {
        $managers = $service->paginate()
            ->through(fn (Manager $manager) => [
                'id' => $manager->id,
                'first_name' => $manager->first_name,
                'last_name' => $manager->last_name,
                'national_id' => $manager->national_id,
                'phone' => $manager->phone,
                'email' => $manager->user?->email,
                'zone' => $manager->zone ? implode(', ', [
                    $manager->zone->district,
                    $manager->zone->department,
                ]) : null,
                'active' => $manager->deleted_at === null,
            ]);

        return Inertia::render('managers/index', [
            'managers' => $managers,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function create()
    {
        return Inertia::render('managers/create', [
            'zones' => Zone::query()
                ->orderBy('department')
                ->orderBy('district')
                ->get(['id', 'department', 'district']),
        ]);
    }

    public function store(StoreManagerRequest $request, ManagerService $service)
    {
        $service->register([
            ...$request->validated(),
            'administrator_id' => $request->user()->id,
        ]);

        return redirect()->route('managers.index')->with('success', 'Gerente registrado correctamente.');
    }

    public function show(int $manager, ManagerService $service)
    {
        return Inertia::render('managers/show', [
            'manager' => $service->find($manager),
        ]);
    }

    public function edit(int $manager, ManagerService $service)
    {
        return Inertia::render('managers/edit', [
            'manager' => $service->find($manager),
            'zones' => Zone::query()->orderBy('department')->orderBy('district')->get(['id', 'department', 'district']),
        ]);
    }

    public function update(UpdateManagerRequest $request, int $manager, ManagerService $service)
    {
        $service->update($manager, $request->validated());

        return redirect()->route('managers.index')->with('success', 'Gerente actualizado correctamente.');
    }

    public function destroy(int $manager, ManagerService $service)
    {
        $service->deactivate($manager);

        return redirect()->route('managers.index')->with('success', 'Gerente dado de baja correctamente.');
    }
}
