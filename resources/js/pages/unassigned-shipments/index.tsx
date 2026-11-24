import { Head, Link, usePage } from '@inertiajs/react';

import PageHeader from '@/components/page-header';
import Pagination from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useListFilters from '@/hooks/use-list-filters';
import AppLayout from '@/layouts/app-layout';
import type { Paginated } from '@/types/pagination';

type Shipment = {
    id: number;
    code: string;
    company: string | null;
    recipient: string | null;
    district: string | null;
};

type CompanyOption = {
    id: number;
    name: string;
};

type PageProps = {
    shipments: Paginated<Shipment>;
    filters: { search: string; company: string };
    zone: string | null;
    companies: CompanyOption[];
    auth: { user: { permissions: string[] } | null };
};

export default function UnassignedShipmentsIndex() {
    const { shipments, filters, zone, companies, auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions ?? [];
    const canAssign = permissions.includes('shipments.assign');

    const {
        search,
        setSearch,
        status: company,
        setStatus: setCompany,
        hasFilters,
    } = useListFilters(
        '/unassigned-shipments',
        { search: filters.search, status: filters.company },
        'company',
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Envíos pendientes', href: '/unassigned-shipments' }]}>
            <Head title="Envíos pendientes" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    eyebrow={zone ? `Zona ${zone}` : 'Mi zona'}
                    title="Envíos pendientes"
                    description="Selecciona un envío pendiente para asignarlo."
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
                            placeholder="Código o destinatario"
                        />
                    </div>

                    <div className="grid w-64 gap-1.5">
                        <Label htmlFor="company" className="text-xs">
                            Empresa
                        </Label>
                        <select
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Todas en mi zona</option>

                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-xl border bg-card">
                    <h2 className="px-5 py-4 text-sm font-semibold">
                        {zone ? `Pendientes de ${zone}` : 'Envíos pendientes'}
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Envío</th>
                                    <th>Empresa</th>
                                    <th>Destinatario</th>
                                    <th>Distrito</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {shipments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="empty">
                                            {hasFilters
                                                ? 'No se encontraron envíos con esos filtros.'
                                                : 'No hay envíos pendientes de asignación.'}
                                        </td>
                                    </tr>
                                )}

                                {shipments.data.map((s) => (
                                    <tr key={s.id}>
                                        {/* Envío */}
                                        <td className="font-semibold">{s.code}</td>

                                        {/* Empresa */}
                                        <td>{s.company ?? '—'}</td>

                                        {/* Destinatario */}
                                        <td>{s.recipient ?? '—'}</td>

                                        {/* Distrito */}
                                        <td>{s.district ?? '—'}</td>

                                        {/* Estado */}
                                        <td>
                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                                                Pendiente
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td>
                                            {canAssign ? (
                                                <Link
                                                    href={`/unassigned-shipments/${s.id}/assign`}
                                                    className="link-brand"
                                                >
                                                    Asignar
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={shipments} />
                </div>

                {/* Aviso */}
                <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm">
                    <p className="font-semibold text-brand dark:text-brand-light">
                        La asignación corresponde al gerente
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                        El transportista debe estar disponible y pertenecer a {zone ?? 'tu zona'}.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}