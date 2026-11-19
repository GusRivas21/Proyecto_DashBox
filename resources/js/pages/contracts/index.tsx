import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

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

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
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
    const canCreate = auth.user?.permissions.includes('contracts.create');

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState<StatusFilter>(filters.status);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get(
                '/contracts',
                { search: search || undefined, status: status === 'all' ? undefined : status },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, status]);

    const hasFilters = search !== '' || status !== 'all';

    return (
        <AppLayout breadcrumbs={[{ title: 'Contratos', href: '/contracts' }]}>
            <Head title="Contratos" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest text-[#1B6272] uppercase dark:text-[#A9C6D3]">
                            Administración general
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight">Contratos</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Consulta los contratos de las empresas clientes y su vigencia.
                        </p>
                    </div>

                    {canCreate && (
                        <Link
                            href="/contracts/create"
                            className="rounded-md bg-[#1B6272] px-4 py-2 text-sm font-medium text-white hover:bg-[#164E5B]"
                        >
                            Registrar contrato
                        </Link>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex flex-wrap gap-4">
                    <div className="grid w-64 gap-1.5">
                        <Label htmlFor="search" className="text-xs">Buscar empresa</Label>
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nombre o NIT"
                        />
                    </div>

                    <div className="grid w-48 gap-1.5">
                        <Label htmlFor="status" className="text-xs">Estado</Label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as StatusFilter)}
                            className="h-9 rounded-md border bg-transparent px-3 text-sm"
                        >
                            <option value="all">Todos</option>
                            <option value="active">Vigentes</option>
                            <option value="expired">Vencidos</option>
                            <option value="cancelled">Cancelados</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-xl border bg-card">
                    <h2 className="px-5 py-4 text-sm font-semibold">Contratos registrados</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Empresa</th>
                                    <th className="px-5 py-3 font-medium">Inicio</th>
                                    <th className="px-5 py-3 font-medium">Vencimiento</th>
                                    <th className="px-5 py-3 font-medium">Monto</th>
                                    <th className="px-5 py-3 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                                            {hasFilters
                                                ? 'No se encontraron contratos con esos filtros.'
                                                : 'Aún no hay contratos registrados.'}
                                        </td>
                                    </tr>
                                )}

                                {contracts.data.map((c) => (
                                    <tr key={c.id} className="border-b last:border-0">
                                        <td className="px-5 py-3">
                                            <div className="font-semibold">{c.company ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">{c.tax_id}</div>
                                        </td>
                                        <td className="px-5 py-3">{date(c.start_date)}</td>
                                        <td className="px-5 py-3">{date(c.end_date)}</td>
                                        <td className="px-5 py-3">{money.format(Number(c.amount))}</td>
                                        <td className={`px-5 py-3 ${stateClass[c.status]}`}>{stateLabel[c.status]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {contracts.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
                            <span className="text-muted-foreground">
                                Página {contracts.current_page} de {contracts.last_page}
                            </span>
                            <div className="flex gap-2">
                                {contracts.prev_page_url && (
                                    <Link href={contracts.prev_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                                        Anterior
                                    </Link>
                                )}
                                {contracts.next_page_url && (
                                    <Link href={contracts.next_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                                        Siguiente
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}