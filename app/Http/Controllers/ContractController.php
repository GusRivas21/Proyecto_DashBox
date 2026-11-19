<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Models\Company;
use App\Services\ContractService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ContractController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:contracts.view', only: ['index']),
            new Middleware('can:contracts.create', only: ['create', 'store']),
        ];
    }

    public function index(Request $request, ContractService $service)
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($request->query('status'), ['active', 'expired', 'cancelled'])
                ? $request->query('status')
                : 'all',
        ];

        $contracts = $service->paginate($filters)
            ->withQueryString()
            ->through(fn ($c) => [
                'id'         => $c->id,
                'company'    => $c->company?->name,
                'tax_id'     => $c->company?->tax_id,
                'start_date' => $c->start_date->format('Y-m-d'),
                'end_date'   => $c->end_date->format('Y-m-d'),
                'amount'     => $c->amount,
                'status'     => $c->effectiveStatus()->value,
            ]);

        return Inertia::render('contracts/index', [
            'contracts' => $contracts,
            'filters'   => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('contracts/create', [
            'companies' => Company::orderBy('name')->get(['id', 'name', 'tax_id']),
        ]);
    }

    public function store(StoreContractRequest $request, ContractService $service)
    {
        $service->create($request->validated());

        return redirect()->route('contracts.index')->with('success', 'Contrato registrado correctamente.');
    }
}