import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Company = {
    id: number;
    name: string;
    tax_id: string;
    zone: string | null;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type StatusFilter = 'all' | 'active' | 'inactive';

type PageProps = {
    companies: Paginated<Company>;
    filters: { search: string; status: StatusFilter };
    flash?: { success?: string | null };
    auth: { user: { permissions: string[] } | null };
};

export default function CompaniesIndex() {
    const { companies, filters, flash, auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions ?? [];
    const canCreate = permissions.includes('companies.create');
    const canDeactivate = permissions.includes('companies.deactivate');

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
                '/companies',
                {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, status]);

    const hasFilters = search !== '' || status !== 'all';

    return (
        <AppLayout breadcrumbs={[{ title: 'Empresas', href: '/companies' }]}>
            <Head title="Empresas" />

            <div className="flex flex-col gap-6 p-6">
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest text-[#1B6272] uppercase dark:text-[#A9C6D3]">
                            Administración general
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight">Empresas</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Administra empresas clientes, sus cuentas y su distrito.
                        </p>
                    </div>

                    {canCreate && (
                        <Link
                            href="/companies/create"
                            className="rounded-md bg-[#1B6272] px-4 py-2 text-sm font-medium text-white hover:bg-[#164E5B]"
                        >
                            Registrar empresa
                        </Link>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

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
                            className="h-9 rounded-md border bg-transparent px-3 text-sm"
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
                        <table className="w-full text-left text-sm">
                            <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Empresa</th>
                                    <th className="px-5 py-3 font-medium">Distrito</th>
                                    <th className="px-5 py-3 font-medium">Cuenta</th>
                                    <th className="px-5 py-3 font-medium">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                                            {hasFilters
                                                ? 'No se encontraron empresas con esos filtros.'
                                                : 'Aún no hay empresas registradas.'}
                                        </td>
                                    </tr>
                                )}

                                {companies.data.map((c) => (
                                    <tr key={c.id} className="border-b last:border-0">
                                        <td className="px-5 py-3">
                                            <div className="font-semibold">{c.name}</div>
                                            <div className="text-xs text-muted-foreground">{c.tax_id}</div>
                                        </td>
                                        <td className="px-5 py-3">{c.zone ?? '—'}</td>
                                        <td className="px-5 py-3">
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
                                        <td className="px-5 py-3">
                                            {c.active && canDeactivate ? (
                                                <Link
                                                    href={`/companies/${c.id}/deactivate`}
                                                    className="text-[#1B6272] hover:underline dark:text-[#A9C6D3]"
                                                >
                                                    Dar de baja
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/companies/${c.id}`}
                                                    className="text-[#1B6272] hover:underline dark:text-[#A9C6D3]"
                                                >
                                                    Consultar
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {companies.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
                            <span className="text-muted-foreground">
                                Página {companies.current_page} de {companies.last_page}
                            </span>
                            <div className="flex gap-2">
                                {companies.prev_page_url && (
                                    <Link
                                        href={companies.prev_page_url}
                                        className="rounded-md border px-3 py-1.5 hover:bg-muted"
                                    >
                                        Anterior
                                    </Link>
                                )}
                                {companies.next_page_url && (
                                    <Link
                                        href={companies.next_page_url}
                                        className="rounded-md border px-3 py-1.5 hover:bg-muted"
                                    >
                                        Siguiente
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Aviso de baja lógica */}
                <div className="rounded-lg border border-[#1B6272]/20 bg-[#1B6272]/5 px-4 py-3 text-sm">
                    <p className="font-semibold text-[#1B6272] dark:text-[#A9C6D3]">
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