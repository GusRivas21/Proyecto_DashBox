<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyRequest;
use App\Models\Company;
use App\Models\Zone;
use App\Services\CompanyService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class CompanyController extends Controller implements HasMiddleware
{
    /**
     * Display a listing of the resource.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('can:companies.view', only: ['index']),
            new Middleware('can:companies.create', only: ['create', 'store']),
        ];
    }
    public function index()
    {
        $companies = Company::with(['zone:id,department,district', 'user:id,email'])
        ->latest()
        ->paginate(10)
        ->through(fn ($company) => [
            'id'         => $company->id,
            'name'       => $company->name,
            'legal_name' => $company->legal_name,
            'tax_id'     => $company->tax_id,
            'phone'      => $company->phone,
            'email'      => $company->user?->email,
            'zone'       => $company->zone
                ? "{$company->zone->district} ({$company->zone->department})"
                : null,
        ]);

        return Inertia::render('companies/index', [
            'companies' => $companies,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('companies/create', [
            'zones' => Zone::orderBy('department')->orderBy('district')
                ->get(['id', 'department', 'district']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request, CompanyService $service)
    {
        $service->register([
            ...$request->validated(),
            'administrator_id' => $request->user()->id,
        ]);

        return redirect()->route('companies.index')->with('success', 'Empresa registrada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
