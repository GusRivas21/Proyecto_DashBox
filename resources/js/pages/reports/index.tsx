import { Head, Link, usePage } from '@inertiajs/react';
import { Download } from 'lucide-react';

import PageHeader from '@/components/page-header';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/pagination';

const reportViews = {
    deliveries: 'Historial de entregas',
    shipments: 'Reporte de envíos',
} as const;

type ReportView = keyof typeof reportViews;

type Shipment = {
    code: string;
    company: string | null;
    recipient: string | null;
    driver: string | null;
    zone: string | null;
    status: string;
    status_label: string;
    registered_on: string | null;
    delivered_on: string | null;
};

type PageProps = {
    shipments: Paginated<Shipment> & { total: number };
    view: ReportView;
    zone: string | null;
    canExport: boolean;
};

function formatDate(value: string | null) {
    return value ? value.split('-').reverse().join('/') : '—';
}

export default function ShipmentReportsIndex() {
    const { shipments, view, zone, canExport } = usePage<PageProps>().props;
    const history = view === 'deliveries';
    const title = reportViews[view];
    const allZones = zone === null;
    const countLabel = history ? 'entrega' : 'envío';

    return (
        <AppLayout breadcrumbs={[{ title: 'Reportes e historial', href: '/reports' }]}>
            <Head title={title} />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    eyebrow={allZones ? 'Todas las zonas' : `Zona ${zone}`}
                    title={title}
                    description={
                        history ? 'Consulta los envíos completados y cuándo se entregaron.' : 'Consulta los envíos registrados y su estado actual.'
                    }
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <nav aria-label="Vistas del reporte" className="bg-muted/40 flex flex-wrap items-center gap-1 rounded-lg border p-1">
                        {Object.entries(reportViews).map(([key, label]) => (
                            <Link
                                key={key}
                                href={`/reports?view=${key}`}
                                aria-current={view === key ? 'page' : undefined}
                                className={cn(
                                    'focus-visible:ring-ring rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:outline-hidden',
                                    view === key
                                        ? 'border-border bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground border-transparent',
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                    {canExport && (
                        <Button asChild variant="outline" size="sm">
                            <a href={`/reports/export?view=${view}`}>
                                <Download aria-hidden="true" />
                                Descargar Excel
                            </a>
                        </Button>
                    )}
                </div>

                <section aria-label={title} className="bg-card rounded-xl border">
                    <p className="px-5 py-4 text-sm font-medium tabular-nums" aria-live="polite">
                        {shipments.total} {countLabel}
                        {shipments.total === 1 ? '' : 's'}
                    </p>
                    <div className="overflow-x-auto">
                        <table className="data-table [&_td]:px-3 2xl:[&_td]:px-5 [&_th]:px-3 2xl:[&_th]:px-5">
                            <thead>
                                <tr>
                                    <th scope="col">Envío</th>
                                    <th scope="col">Empresa</th>
                                    <th scope="col">Destinatario</th>
                                    <th scope="col">Transportista</th>
                                    {allZones && <th scope="col">Zona</th>}
                                    <th scope="col">Registrado</th>
                                    <th scope="col">Entregado</th>
                                    <th scope="col">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={allZones ? 8 : 7} className="empty">
                                            {history ? 'Todavía no hay entregas realizadas en este historial.' : 'Todavía no hay envíos registrados.'}
                                        </td>
                                    </tr>
                                )}
                                {shipments.data.map((shipment) => (
                                    <tr key={shipment.code}>
                                        <td className="font-semibold whitespace-nowrap">{shipment.code}</td>
                                        <td>{shipment.company ?? '—'}</td>
                                        <td>{shipment.recipient ?? '—'}</td>
                                        <td>{shipment.driver ?? '—'}</td>
                                        {allZones && <td>{shipment.zone ?? '—'}</td>}
                                        <td className="whitespace-nowrap tabular-nums">{formatDate(shipment.registered_on)}</td>
                                        <td className="whitespace-nowrap tabular-nums">
                                            {shipment.status === 'delivered' && !shipment.delivered_on ? (
                                                <span className="text-muted-foreground">Sin fecha registrada</span>
                                            ) : (
                                                formatDate(shipment.delivered_on)
                                            )}
                                        </td>
                                        <td>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    shipment.status === 'delivered'
                                                        ? 'border-green-500/40 text-green-700 dark:text-green-300'
                                                        : undefined
                                                }
                                            >
                                                {shipment.status_label}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination page={shipments} />
                </section>
            </div>
        </AppLayout>
    );
}
