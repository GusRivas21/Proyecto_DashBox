<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShipmentReturnRequest;
use App\Models\Shipment;
use App\Services\ShipmentReturnService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShipmentReturnController extends Controller
{
    public function index(Request $request, ShipmentReturnService $service): Response
    {
        $manager = $service->manager($request->user()->id);
        $shipments = $service->paginate($manager)->through(fn (Shipment $shipment) => [
            'id' => $shipment->id,
            'company' => $shipment->company?->name,
            'recipient' => $shipment->recipient?->name,
            'status' => $shipment->status,
            'can_return' => $service->canReturn($shipment),
            'reason' => $shipment->status === 'returned' ? $shipment->latestCompletedReturn?->reason : null,
        ]);

        return Inertia::render('returns/index', [
            'shipments' => $shipments,
            'zone' => $manager->zone?->district,
        ]);
    }

    public function store(StoreShipmentReturnRequest $request, ShipmentReturnService $service): RedirectResponse
    {
        $data = $request->validated();

        try {
            $service->register($request->user()->id, (int) $data['shipment_id'], $data['reason']);
        } catch (QueryException $e) {
            report($e);

            return back()->withErrors(['shipment_id' => 'No se pudo guardar la devolución. Inténtalo nuevamente.']);
        }

        $code = 'DB-'.str_pad((string) $data['shipment_id'], 4, '0', STR_PAD_LEFT);

        return to_route('returns.index')->with('success', "El envío {$code} se marcó como Devuelto.");
    }
}
