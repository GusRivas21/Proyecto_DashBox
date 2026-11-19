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

type Company = {
    id: number;
    name: string;
    legal_name: string;
    tax_id: string;
    phone: string;
    active: boolean;

    user: {
        name: string;
        email: string;
    } | null;

    zone: {
        department: string;
        district: string;
    } | null;
};

type StatusFilter = 'all' | 'active' | 'inactive';

type PageProps = {
    companies: Paginated<Company>;
    filters: { search: string; status: StatusFilter };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    auth: { user: { permissions: string[] } | null };
};

export default function CompaniesIndex() {
    const { companies, filters, flash, auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions ?? [];
    const canCreate = permissions.includes('companies.create');
    const canUpdate = permissions.includes('companies.edit');
    const canDeactivate = permissions.includes('companies.deactivate');
    const { search, setSearch, status, setStatus, hasFilters } = useListFilters<StatusFilter>('/companies', filters);

    return (
        <AppLayout breadcrumbs={[{ title: 'Empresas', href: '/companies' }]}>
            <Head title="Empresas" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    title="Empresas"
                    description="Administra empresas clientes, sus cuentas y su distrito."
                >
                    {canCreate && (
                        <Link href="/companies/create" className="btn-brand">
                            Registrar empresa
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
                            Buscar empresa
                        </Label>
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nombre o NIT"
                        />
                    </div>

                    <div className="grid w-48 gap-1.5">
                        <Label htmlFor="status" className="text-xs">
                            Estado de cuenta
                        </Label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as StatusFilter)}
                            className="filter-select"
                        >
                            <option value="all">Todas</option>
                            <option value="active">Activas</option>
                            <option value="inactive">Inactivas</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-xl border bg-card">
                    <h2 className="px-5 py-4 text-sm font-semibold">Empresas registradas</h2>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Empresa</th>
                                    <th>NIT</th>
                                    <th>Contacto</th>
                                    <th>Ubicación</th>
                                    <th>Cuenta</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {companies.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="empty">
                                            {hasFilters
                                                ? 'No se encontraron empresas con esos filtros.'
                                                : 'Aún no hay empresas registradas.'}
                                        </td>
                                    </tr>
                                )}

                                {companies.data.map((c) => (
                                    <tr key={c.id}>
                                        {/* Empresa */}
                                        <td>
                                            <div className="font-semibold">{c.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {c.legal_name}
                                            </div>
                                        </td>

                                        {/* NIT */}
                                        <td>{c.tax_id}</td>

                                        {/* Contacto */}
                                        <td>
                                            <div>{c.user?.email ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {c.phone}
                                            </div>
                                        </td>

                                        {/* Ubicación */}
                                        <td>
                                            {c.zone ? (
                                                <>
                                                    <div className="font-medium">
                                                        {c.zone.district}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {c.zone.department}
                                                    </div>
                                                </>
                                            ) : (
                                                '—'
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td>
                                            <span
                                                className={
                                                    c.active
                                                        ? 'text-green-700 dark:text-green-400'
                                                        : 'text-muted-foreground'
                                                }
                                            >
                                                {c.active ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td>
                                            <RowActions
                                                viewHref={`/companies/${c.id}`}
                                                editHref={
                                                    canUpdate
                                                        ? `/companies/${c.id}/edit`
                                                        : undefined
                                                }
                                                deleteHref={
                                                    c.active && canDeactivate
                                                        ? `/companies/${c.id}`
                                                        : undefined
                                                }
                                                confirmTitle="¿Dar de baja a la empresa?"
                                                confirmMessage="Al dar de baja esta empresa, también se desactivará la cuenta de su usuario asociado. Sus contratos, destinatarios y envíos se conservarán. No se eliminará el historial."
                                                confirmButtonText="Confirmar baja"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={companies} />
                </div>

                {/* Aviso de baja lógica */}
                <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm">
                    <p className="font-semibold text-brand dark:text-brand-light">
                        Baja lógica, sin pérdida de historial
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                        Desactivar una empresa también desactiva su cuenta; sus registros se conservan.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}