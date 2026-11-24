<?php

namespace App\Http\Controllers;

use App\Services\PendingShipmentService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class PendingShipmentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:unassignedShipments.view', only: ['index']),
        ];
    }

    public function index(Request $request, PendingShipmentService $service)
    {
        $managerId = $request->user()->id;
        $company   = (string) $request->query('company', '');

        $filters = [
            'search'  => trim((string) $request->query('search', '')),
            'company' => ctype_digit($company) ? $company : 'all',
        ];

        $context = $service->zoneContext($managerId);

        $shipments = $service->paginate($managerId, $filters)
            ->withQueryString()
            ->through(fn ($s) => [
                'id'        => $s->id,
                'code'      => 'DB-' . str_pad((string) $s->id, 4, '0', STR_PAD_LEFT),
                'company'   => $s->company?->name,
                'recipient' => $s->recipient?->name,
                'district'  => $s->company?->zone?->district,
            ]);

        return Inertia::render('unassigned-shipments/index', [
            'shipments' => $shipments,
            'filters'   => $filters,
            'zone'      => $context['zone'],
            'companies' => $context['companies'],
        ]);
    }
}