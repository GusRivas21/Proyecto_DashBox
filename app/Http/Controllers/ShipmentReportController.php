<?php

namespace App\Http\Controllers;

use App\Models\Manager;
use App\Models\Shipment;
use App\Services\ShipmentReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ShipmentReportController extends Controller
{
    public function index(Request $request, ShipmentReportService $reports): Response
    {
        $manager = $reports->manager($request->user());
        $view = $this->view($request, $manager);
        $shipments = $reports->query($manager, $view)
            ->paginate(15)->appends(['view' => $view])
            ->through(fn (Shipment $shipment) => $reports->row($shipment));

        return Inertia::render('reports/index', [
            'shipments' => $shipments,
            'view' => $view,
            'zone' => $manager?->zone->district,
            'canExport' => $request->user()->can('reports.generate'),
        ]);
    }

    public function export(Request $request, ShipmentReportService $reports): StreamedResponse
    {
        $manager = $reports->manager($request->user());
        $view = $this->view($request, $manager);
        $query = $reports->query($manager, $view);
        [$name, $title] = $view === ShipmentReportService::DELIVERIES
            ? ['historial-entregas.xlsx', 'Historial de entregas']
            : ['reporte-envios.xlsx', 'Reporte de envíos'];

        return response()->streamDownload(
            fn () => $reports->streamExcel($query, $title),
            $name,
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control' => 'private, no-store'],
        );
    }

    private function view(Request $request, ?Manager $manager): string
    {
        $view = $request->query('view');
        if (in_array($view, [ShipmentReportService::DELIVERIES, ShipmentReportService::SHIPMENTS], true)) {
            return $view;
        }

        return $manager ? ShipmentReportService::DELIVERIES : ShipmentReportService::SHIPMENTS;
    }
}
