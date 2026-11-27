<?php

namespace App\Services;

use App\Models\Administrator;
use App\Models\DeliveryProof;
use App\Models\Manager;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

class ShipmentReportService
{
    public const DELIVERIES = 'deliveries';

    public const SHIPMENTS = 'shipments';

    private const STATUS_LABELS = [
        'registered' => 'Pendiente',
        'assigned' => 'Asignado',
        'in_transit' => 'En camino',
        'delivered' => 'Entregado',
        'returned' => 'Devuelto',
        'cancelled' => 'Cancelado',
    ];

    public function manager(User $user): ?Manager
    {
        if ($user->hasRole('administrator')) {
            abort_unless(Administrator::whereKey($user->id)->exists(), 403, 'Tu cuenta necesita un perfil de administrador activo.');

            return null;
        }

        abort_unless($user->hasRole('manager'), 403);
        $manager = Manager::with('zone:id,department,district')->find($user->id);
        abort_unless($manager?->zone, 403, 'Tu cuenta necesita un perfil de gerente activo con una zona asignada.');

        return $manager;
    }

    public function query(?Manager $manager, string $view): Builder
    {
        $deliveryDates = DeliveryProof::query()
            ->select('shipment_id')
            ->selectRaw('MAX(proof_date) AS delivery_date')
            ->groupBy('shipment_id');

        $shipments = Shipment::query()
            ->leftJoin('managers', 'managers.id', '=', 'shipments.manager_id')
            ->leftJoin('zones', 'zones.id', '=', 'managers.zone_id')
            ->leftJoin('companies', 'companies.id', '=', 'shipments.company_id')
            ->leftJoin('recipients', fn ($join) => $join
                ->on('recipients.id', '=', 'shipments.recipient_id')
                ->on('recipients.company_id', '=', 'shipments.company_id'))
            ->leftJoin('drivers', 'drivers.id', '=', 'shipments.driver_id')
            ->leftJoinSub($deliveryDates, 'delivery_dates', 'delivery_dates.shipment_id', '=', 'shipments.id')
            ->select([
                'shipments.id', 'shipments.created_at', 'shipments.status',
                'companies.name AS company', 'recipients.name AS recipient',
                'drivers.first_name', 'drivers.last_name', 'zones.district', 'zones.department',
                'delivery_dates.delivery_date',
            ])
            ->withCasts(['delivery_date' => 'date'])
            ->when($manager, fn (Builder $query) => $query->where('managers.zone_id', $manager->zone_id));

        if ($view === self::DELIVERIES) {
            $shipments->where('shipments.status', 'delivered')
                ->orderByRaw('CASE WHEN delivery_dates.delivery_date IS NULL THEN 1 ELSE 0 END')
                ->orderByDesc('delivery_dates.delivery_date');
        } else {
            $shipments->latest('shipments.created_at');
        }

        return $shipments->latest('shipments.id');
    }

    public function row(Shipment $shipment): array
    {
        return [
            'code' => 'DB-'.str_pad((string) $shipment->id, 4, '0', STR_PAD_LEFT),
            'company' => $shipment->company,
            'recipient' => $shipment->recipient,
            'driver' => $shipment->first_name === null ? null : trim($shipment->first_name.' '.$shipment->last_name),
            'zone' => $shipment->district === null ? null : $shipment->district.', '.$shipment->department,
            'status' => $shipment->status,
            'status_label' => self::STATUS_LABELS[$shipment->status] ?? $shipment->status,
            'registered_on' => $shipment->created_at?->toDateString(),
            'delivered_on' => $shipment->status === 'delivered' ? $shipment->delivery_date?->toDateString() : null,
        ];
    }

    public function streamCsv(Builder $query): void
    {
        $output = fopen('php://output', 'w');
        if ($output === false) {
            throw new RuntimeException('No se pudo generar el reporte CSV.');
        }

        try {
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Envío', 'Empresa', 'Destinatario', 'Transportista', 'Zona', 'Estado', 'Fecha de registro', 'Fecha de entrega'], ',', '"', '');

            foreach ($query->cursor() as $shipment) {
                $row = $this->row($shipment);
                unset($row['status']);

                // Los nombres de la base pueden empezar con caracteres que Excel interpreta como fórmulas.
                $values = array_map(static function (?string $value): string {
                    $value ??= '';

                    return preg_match('/\A(?:[\t\r\n]|[\s\p{Z}\x{FEFF}]*[=+\-@])/u', $value) ? "'".$value : $value;
                }, $row);

                fputcsv($output, $values, ',', '"', '');
            }
        } finally {
            fclose($output);
        }
    }
}
