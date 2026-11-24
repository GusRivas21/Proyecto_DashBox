<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShipmentRequest;
use App\Http\Requests\UpdateShipmentRequest;
use App\Models\Shipment;
use App\Services\ShipmentService;
use DomainException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ShipmentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:shipments.view', only: ['index']),
            new Middleware('can:shipments.create', only: ['create', 'store']),
            new Middleware('can:shipments.edit', only: ['edit', 'update']),
            new Middleware('can:shipments.delete', only: ['destroy']),
        ];
    }

    /**
     * El id de la empresa es el id del usuario con el que se inicia sesión.
     */
    private function companyId(Request $request): int
    {
        return $request->user()->id;
    }

    public function index(Request $request, ShipmentService $service)
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($request->query('status'), Shipment::STATUSES)
                ? $request->query('status')
                : 'all',
        ];

        $shipments = $service->paginate($this->companyId($request), $filters)
            ->withQueryString()
            ->through(fn ($s) => [
                'id'         => $s->id,
                'recipient'  => $s->recipient?->name,
                'size'       => $s->size,
                'cargo_type' => $s->cargo_type,
                'status'     => $s->status,
                'created_at' => $s->created_at->format('Y-m-d'),
                'editable'   => $s->status === 'registered',
            ]);

        return Inertia::render('shipments/index', [
            'shipments' => $shipments,
            'filters'   => $filters,
        ]);
    }

    public function create(Request $request, ShipmentService $service)
    {
        $companyId = $this->companyId($request);

        try {
            $service->ensureActiveContract($companyId);

            return Inertia::render('shipments/create', [
                'recipients' => $service->recipientsForCompany($companyId),
            ]);

        } catch (DomainException $e) {

            return redirect()
                ->route('shipments.index')
                ->with('error', $e->getMessage());
        }
    }

    public function store(StoreShipmentRequest $request, ShipmentService $service)
    {
        try {
            $service->register($this->companyId($request), $request->validated());

            return redirect()
                ->route('shipments.index')
                ->with('success', 'Envío registrado correctamente.');

        } catch (DomainException $e) {

            return redirect()
                ->back()
                ->with('error', $e->getMessage())
                ->withInput();

        } catch (\Exception $e) {

            report($e);

            return redirect()
                ->back()
                ->with('error', 'No se pudo registrar el envío. Inténtalo nuevamente.')
                ->withInput();
        }
    }

    public function edit(Request $request, int $shipment, ShipmentService $service)
    {
        try {
            $companyId = $this->companyId($request);
            $shipment  = $service->findEditable($shipment, $companyId);

            return Inertia::render('shipments/edit', [
                'shipment'   => $shipment->only('id', 'recipient_id', 'size', 'cargo_type'),
                'recipients' => $service->recipientsForCompany($companyId),
            ]);

        } catch (DomainException $e) {

            return redirect()
                ->route('shipments.index')
                ->with('error', $e->getMessage());
        }
    }

    public function update(UpdateShipmentRequest $request, int $shipment, ShipmentService $service)
    {
        try {
            $service->update($shipment, $this->companyId($request), $request->validated());

            return redirect()
                ->route('shipments.index')
                ->with('success', 'Envío actualizado correctamente.');

        } catch (ModelNotFoundException $e) {

            abort(404);

        } catch (DomainException $e) {

            return redirect()
                ->route('shipments.index')
                ->with('error', $e->getMessage());

        } catch (\Exception $e) {

            report($e);

            return redirect()
                ->back()
                ->with('error', 'No se pudo actualizar el envío. Inténtalo nuevamente.')
                ->withInput();
        }
    }

    public function destroy(Request $request, int $shipment, ShipmentService $service)
    {
        try {
            $service->cancel($shipment, $this->companyId($request));

            return redirect()
                ->route('shipments.index')
                ->with('success', 'Envío cancelado correctamente.');

        } catch (DomainException $e) {

            return redirect()
                ->route('shipments.index')
                ->with('error', $e->getMessage());
        }
    }
}