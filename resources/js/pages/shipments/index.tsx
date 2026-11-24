import { Head, Link, usePage } from '@inertiajs/react';

import FlashMessage from '@/components/flash-message';
import PageHeader from '@/components/page-header';
import Pagination from '@/components/pagination';
import RowActions from '@/components/row-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useListFilters from '@/hooks/use-list-filters';
import AppLayout from '@/layouts/app-layout';
import type { Paginated } from '@/types/pagination';

type Status = 'registered' | 'assigned' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
type StatusFilter = 'all' | Status;

type Shipment = {
    id: number;
    recipient: string | null;
    size: string;
    cargo_type: string;
    status: Status;
    created_at: string;
    editable: boolean;
};

type PageProps = {
    shipments: Paginated<Shipment>;
    filters: { search: string; status: StatusFilter };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    auth: { user: { permissions: string[] } | null };
};

const sizeLabel: Record<string, string> = {
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
};

const cargoLabel: Record<string, string> = {
    fragile: 'Frágil',
    neutral: 'Neutro',
    heavy: 'Pesado',
};

const statusLabel: Record<Status, string> = {
    registered: 'Pendiente',
    assigned: 'Asignado',
    in_transit: 'En tránsito',
    delivered: 'Entregado',
    returned: 'Devuelto',
    cancelled: 'Cancelado',
};

const statusClass: Record<Status, string> = {
    registered: 'text-amber-700 dark:text-amber-400',
    assigned: 'text-blue-700 dark:text-blue-400',
    in_transit: 'text-blue-700 dark:text-blue-400',
    delivered: 'text-green-700 dark:text-green-400',
    returned: 'text-muted-foreground',
    cancelled: 'text-red-700 dark:text-red-400',
};

const date = (d: string) => d.split('-').reverse().join('/');

export default function ShipmentsIndex() {
    const { shipments, filters, flash, auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions ?? [];
    const canCreate = permissions.includes('shipments.create');
    const canUpdate = permissions.includes('shipments.edit');
    const canDelete = permissions.includes('shipments.delete');
    const { search, setSearch, status, setStatus, hasFilters } = useListFilters<StatusFilter>('/shipments', filters);

    return (
        <AppLayout breadcrumbs={[{ title: 'Envíos', href: '/shipments' }]}>
            <Head title="Envíos" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    eyebrow="Mi empresa"
                    title="Envíos"
                    description="Registra tus pedidos y consulta el estado de cada envío."
                >
                    {canCreate && (
                        <Link href="/shipments/create" className="btn-brand">
                            Registrar envío
                        </Link>
                    )}
                </PageHeader>

                <FlashMessage
                    message={flash?.success}
                    type="success"
                />

                <FlashMessage
                    message={flash?.error}
                    type="error"
                />

                {/* Filtros */}
                <div className="flex flex-wrap gap-4">
                    <div className="grid w-64 gap-1.5">
                        <Label htmlFor="search" className="text-xs">
                            Buscar envío
                        </Label>
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Destinatario, tamaño o naturaleza"
                        />
                    </div>

                    <div className="grid w-48 gap-1.5">
                        <Label htmlFor="status" className="text-xs">
                            Estado
                        </Label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as StatusFilter)}
                            className="filter-select"
                        >
                            <option value="all">Todos</option>
                            <option value="registered">Pendientes</option>
                            <option value="assigned">Asignados</option>
                            <option value="in_transit">En tránsito</option>
                            <option value="delivered">Entregados</option>
                            <option value="returned">Devueltos</option>
                            <option value="cancelled">Cancelados</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-xl border bg-card">
                    <h2 className="px-5 py-4 text-sm font-semibold">Envíos registrados</h2>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Envío</th>
                                    <th>Destinatario</th>
                                    <th>Tamaño</th>
                                    <th>Naturaleza</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {shipments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="empty">
                                            {hasFilters
                                                ? 'No se encontraron envíos con esos filtros.'
                                                : 'Aún no has registrado envíos.'}
                                        </td>
                                    </tr>
                                )}

                                {shipments.data.map((s) => (
                                    <tr key={s.id}>
                                        {/* Envío */}
                                        <td className="font-semibold">#{s.id}</td>

                                        {/* Destinatario */}
                                        <td>{s.recipient ?? '—'}</td>

                                        {/* Tamaño */}
                                        <td>{sizeLabel[s.size] ?? s.size}</td>

                                        {/* Naturaleza */}
                                        <td>{cargoLabel[s.cargo_type] ?? s.cargo_type}</td>

                                        {/* Fecha */}
                                        <td>{date(s.created_at)}</td>

                                        {/* Estado */}
                                        <td className={statusClass[s.status]}>{statusLabel[s.status]}</td>

                                        {/* Acciones */}
                                        <td>
                                            <RowActions
                                                editHref={
                                                    canUpdate && s.editable
                                                        ? `/shipments/${s.id}/edit`
                                                        : undefined
                                                }
                                                deleteHref={
                                                    canDelete && s.editable
                                                        ? `/shipments/${s.id}`
                                                        : undefined
                                                }
                                                confirmTitle="¿Cancelar envío?"
                                                confirmMessage="El envío pasará a estado cancelado y ya no podrá modificarse. Solo se pueden cancelar envíos pendientes."
                                                confirmButtonText="Confirmar cancelación"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={shipments} />
                </div>
            </div>
        </AppLayout>
    );
}