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

type State = 'active' | 'expired' | 'cancelled';
type StatusFilter = 'all' | State;

type Contract = {
    id: number;
    company: string | null;
    tax_id: string | null;
    start_date: string;
    end_date: string;
    amount: string;
    status: State;
};

type PageProps = {
    contracts: Paginated<Contract>;
    filters: { search: string; status: StatusFilter };
    flash?: { success?: string | null };
    auth: { user: { permissions: string[] } | null };
};

const stateLabel: Record<State, string> = {
    active: 'Vigente',
    expired: 'Vencido',
    cancelled: 'Cancelado',
};

const stateClass: Record<State, string> = {
    active: 'text-green-700 dark:text-green-400',
    expired: 'text-amber-700 dark:text-amber-400',
    cancelled: 'text-red-700 dark:text-red-400',
};

const money = new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' });
const date = (d: string) => d.split('-').reverse().join('/');

export default function ContractsIndex() {
    const { contracts, filters, flash, auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions ?? [];
    const canCreate = permissions.includes('contracts.create');
    const canUpdate = permissions.includes('contracts.update');
    const canDelete = permissions.includes('contracts.delete');

    const { search, setSearch, status, setStatus, hasFilters } =
        useListFilters<StatusFilter>('/contracts', filters);

    return (
        <AppLayout breadcrumbs={[{ title: 'Contratos', href: '/contracts' }]}>
            <Head title="Contratos" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    title="Contratos"
                    description="Consulta los contratos de las empresas clientes y su vigencia."
                >
                    {canCreate && (
                        <Link href="/contracts/create" className="btn-brand">
                            Registrar contrato
                        </Link>
                    )}
                </PageHeader>

                <FlashMessage message={flash?.success} />

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
                            Estado
                        </Label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as StatusFilter)}
                            className="filter-select"
                        >
                            <option value="all">Todos</option>
                            <option value="active">Vigentes</option>
                            <option value="expired">Vencidos</option>
                            <option value="cancelled">Cancelados</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-xl border bg-card">
                    <h2 className="px-5 py-4 text-sm font-semibold">Contratos registrados</h2>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Empresa</th>
                                    <th>Inicio</th>
                                    <th>Vencimiento</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="empty">
                                            {hasFilters
                                                ? 'No se encontraron contratos con esos filtros.'
                                                : 'Aún no hay contratos registrados.'}
                                        </td>
                                    </tr>
                                )}

                                {contracts.data.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="font-semibold">{c.company ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">{c.tax_id}</div>
                                        </td>
                                        <td>{date(c.start_date)}</td>
                                        <td>{date(c.end_date)}</td>
                                        <td>{money.format(Number(c.amount))}</td>
                                        <td className={stateClass[c.status]}>{stateLabel[c.status]}</td>
                                        <td>
                                            <RowActions
                                                editHref={canUpdate ? `/contracts/${c.id}/edit` : undefined}
                                                deleteHref={canDelete ? `/contracts/${c.id}` : undefined}
                                                confirmMessage="¿Eliminar este contrato?"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={contracts} />
                </div>
            </div>
        </AppLayout>
    );
}