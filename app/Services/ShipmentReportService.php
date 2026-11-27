<?php

namespace App\Services;

use App\Models\Administrator;
use App\Models\DeliveryProof;
use App\Models\Manager;
use App\Models\Shipment;
use App\Models\User;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
use OpenSpout\Common\Entity\Cell\DateTimeCell;
use OpenSpout\Common\Entity\Cell\EmptyCell;
use OpenSpout\Common\Entity\Cell\StringCell;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\CellAlignment;
use OpenSpout\Common\Entity\Style\CellVerticalAlignment;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\AutoFilter;
use OpenSpout\Writer\XLSX\Entity\SheetView;
use OpenSpout\Writer\XLSX\Options;
use OpenSpout\Writer\XLSX\Writer;

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

    private const EXCEL_COLUMNS = [
        'code' => ['Envío', 16],
        'company' => ['Empresa', 27],
        'recipient' => ['Destinatario', 25],
        'driver' => ['Transportista', 25],
        'zone' => ['Zona', 30],
        'status_label' => ['Estado', 16],
        'registered_on' => ['Fecha de registro', 21],
        'delivered_on' => ['Fecha de entrega', 21],
    ];

    private const EXCEL_ROW_LIMIT = 1_048_576;

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

    public function streamExcel(Builder $query, string $title): void
    {
        $options = new Options;
        foreach (array_values(self::EXCEL_COLUMNS) as $index => [, $width]) {
            $options->setColumnWidth($width, $index + 1);
        }

        $headerStyle = (new Style)->setFontBold()->setFontColor('FFFFFF')->setBackgroundColor('1B6272')
            ->setCellVerticalAlignment(CellVerticalAlignment::CENTER);
        $bodyStyle = (new Style)->setFontColor('10242F')->setShouldWrapText(true)
            ->setCellVerticalAlignment(CellVerticalAlignment::CENTER);
        $alternateStyle = (clone $bodyStyle)->setBackgroundColor('EDF5F7');
        $dateStyle = (new Style)->setFormat('dd/mm/yyyy')->setCellAlignment(CellAlignment::CENTER);
        $sheetView = (new SheetView)->setFreezeRow(2)->setShowGridLines(false);
        $columnKeys = array_keys(self::EXCEL_COLUMNS);
        $lastColumn = count($columnKeys) - 1;

        $writer = new Writer($options);
        $writer->openToFile('php://output');

        try {
            $sheet = $writer->getCurrentSheet();
            $sheet->setName($title);
            $sheet->setSheetView($sheetView);
            $headers = array_column(self::EXCEL_COLUMNS, 0);
            $writer->addRow(Row::fromValues($headers, $headerStyle)->setHeight(25));

            foreach ($query->cursor() as $shipment) {
                if ($sheet->getWrittenRowCount() === self::EXCEL_ROW_LIMIT) {
                    $sheet->setAutoFilter(new AutoFilter(0, 1, $lastColumn, self::EXCEL_ROW_LIMIT));
                    $sheet = $writer->addNewSheetAndMakeItCurrent();
                    $sheet->setName($title.' '.$sheet->getIndex());
                    $sheet->setSheetView($sheetView);
                    $writer->addRow(Row::fromValues($headers, $headerStyle)->setHeight(25));
                }

                $row = $this->row($shipment);
                $cells = [];
                foreach ($columnKeys as $key) {
                    $value = $row[$key];
                    // Escribir los nombres como texto evita que Excel los interprete como fórmulas.
                    $cells[] = match (true) {
                        $value === null => new EmptyCell(null, null),
                        $key === 'registered_on' || $key === 'delivered_on' => new DateTimeCell(new DateTimeImmutable($value), $dateStyle),
                        default => new StringCell($value, null),
                    };
                }

                $style = $sheet->getWrittenRowCount() % 2 === 1 ? $alternateStyle : $bodyStyle;
                $writer->addRow(new Row($cells, $style));
            }

            $sheet->setAutoFilter(new AutoFilter(0, 1, $lastColumn, $sheet->getWrittenRowCount()));
        } finally {
            $writer->close();
        }
    }
}
