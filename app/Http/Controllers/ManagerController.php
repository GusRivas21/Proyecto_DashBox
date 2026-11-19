<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreManagerRequest;
use App\Models\Manager;
use App\Models\Zone;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ManagerController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:managers.view', only: ['index']),
            new Middleware('can:managers.create', only: ['create', 'store']),
        ];
    }

    public function index()
    {
        $managers = Manager::query()
            ->with(['user:id,name,email', 'zone:id,department,municipality,district'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate(10)
            ->through(fn (Manager $manager) => [
                'id' => $manager->id,
                'first_name' => $manager->first_name,
                'last_name' => $manager->last_name,
                'national_id' => $manager->national_id,
                'phone' => $manager->phone,
                'email' => $manager->user?->email,
                'zone' => $manager->zone ? implode(', ', [
                    $manager->zone->district,
                    $manager->zone->municipality,
                    $manager->zone->department,
                ]) : null,
            ]);

        return Inertia::render('managers/index', [
            'managers' => $managers,
            'canCreate' => auth()->user()->can('managers.create'),
            'flash' => ['success' => session('success')],
        ]);
    }

    public function create()
    {
        return Inertia::render('managers/create', [
            'zones' => Zone::query()
                ->orderBy('department')
                ->orderBy('municipality')
                ->orderBy('district')
                ->get(['id', 'department', 'municipality', 'district']),
        ]);
    }

    public function store(StoreManagerRequest $request)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request) {
            $user = User::create([
                'name' => $data['first_name'].' '.$data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
            $user->assignRole('manager');

            Manager::create([
                'id' => $user->id,
                'administrator_id' => $request->user()->id,
                'zone_id' => $data['zone_id'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'national_id' => $data['national_id'],
                'phone' => $data['phone'],
            ]);
        });

        return redirect()->route('managers.index')->with('success', 'Gerente registrado correctamente.');
    }
}
