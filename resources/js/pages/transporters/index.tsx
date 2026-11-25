import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, CircleUserRound, Pencil, Search, Truck, UserRoundX, Users, X, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import PageHeader from '@/components/page-header';
import ManagerOnly from '@/components/transporters/manager-only';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Transporter = {
    id: number;
    first_name: string;
    last_name: string;
    national_id: string;
    license_number: string;
    phone: string | null;
    zone: string | null;
    manager: string | null;
    vehicle: string | null;
    deleted_at: string | null;
};

type StatusFilter = 'all' | 'active' | 'inactive';

export default function TransportersIndex({ transporters }: { transporters: Transporter[] }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [selected, setSelected] = useState<Transporter | null>(null);
    const [notice, setNotice] = useState('');

    const filtered = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('es');

        return transporters.filter((transporter) => {
            const isActive = transporter.deleted_at === null;
            const matchesStatus = status === 'all' || (status === 'active' ? isActive : !isActive);
            const searchable = [
                transporter.first_name,
                transporter.last_name,
                transporter.national_id,
                transporter.license_number,
                transporter.zone,
                transporter.manager,
            ]
                .join(' ')
                .toLocaleLowerCase('es');

            return matchesStatus && (!query || searchable.includes(query));
        });
    }, [search, status, transporters]);

    const activeCount = transporters.filter((transporter) => transporter.deleted_at === null).length;
    const inactiveCount = transporters.length - activeCount;

    const confirmDeactivation = () => {
        if (!selected) return;
        setNotice(`Vista previa: la baja de ${selected.first_name} ${selected.last_name} no se ejecutó. El registro continúa sin cambios.`);
        setSelected(null);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Transportistas', href: '/transporters' }]}>
            <ManagerOnly>
                <Head title="Transportistas" />
                <div className="flex flex-col gap-6 p-6 lg:p-8">
                    <PageHeader
                        title="Transportistas"
                        description="Consulta y administra los transportistas disponibles para las operaciones de tu zona."
                    >
                        <Link
                            href="/transporters/create"
                            className="btn-brand inline-flex h-10 items-center justify-center px-4 whitespace-nowrap shadow-sm transition hover:-translate-y-0.5"
                        >
                            Registrar transportista
                        </Link>
                    </PageHeader>

                    <div className="flex flex-col gap-3 rounded-lg border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm sm:flex-row sm:items-start dark:border-sky-900 dark:bg-sky-950/30">
                        <span className="mt-0.5 shrink-0 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-800 uppercase dark:bg-sky-900 dark:text-sky-100">
                            Vista previa
                        </span>
                        <p className="leading-relaxed text-sky-950 dark:text-sky-100">
                            Los registros mostrados son datos de demostración. La lista real, los permisos y la baja lógica dependen de la integración
                            del backend.
                        </p>
                    </div>

                    {notice && (
                        <div
                            role="status"
                            className="flex items-start justify-between gap-4 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                        >
                            <p>{notice}</p>
                            <button
                                type="button"
                                onClick={() => setNotice('')}
                                aria-label="Cerrar mensaje"
                                className="shrink-0 rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <section aria-label="Resumen de transportistas" className="grid gap-4 sm:grid-cols-3">
                        <SummaryCard icon={Users} label="Registros de demostración" value={transporters.length} tone="brand" />
                        <SummaryCard icon={CheckCircle2} label="Activos" value={activeCount} tone="green" />
                        <SummaryCard icon={UserRoundX} label="Inactivos" value={inactiveCount} tone="muted" />
                    </section>

                    <section className="bg-card rounded-xl border shadow-sm shadow-black/[0.02]">
                        <div className="flex flex-col gap-4 border-b px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-base font-semibold">Directorio de transportistas</h2>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Datos de demostración · {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-[minmax(16rem,1fr)_12rem]">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="transporter-search" className="text-xs">
                                        Buscar transportista
                                    </Label>
                                    <div className="relative">
                                        <Search
                                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="transporter-search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Nombre, documento, licencia…"
                                            className="h-10 pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="transporter-status" className="text-xs">
                                        Estado
                                    </Label>
                                    <select
                                        id="transporter-status"
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value as StatusFilter)}
                                        className="filter-select bg-background h-10"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="active">Activos</option>
                                        <option value="inactive">Inactivos</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="data-table min-w-[1050px]">
                                <thead>
                                    <tr>
                                        <th>Transportista</th>
                                        <th>Documento / Licencia</th>
                                        <th>Contacto</th>
                                        <th>Zona</th>
                                        <th>Gerente</th>
                                        <th>Vehículo</th>
                                        <th>Estado</th>
                                        <th className="text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="empty">
                                                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                                                    <div className="bg-muted rounded-full p-3">
                                                        <CircleUserRound className="text-muted-foreground h-5 w-5" />
                                                    </div>
                                                    <span className="text-foreground font-medium">
                                                        {transporters.length === 0
                                                            ? 'Aún no hay transportistas registrados.'
                                                            : 'No encontramos coincidencias.'}
                                                    </span>
                                                    <span className="text-xs">
                                                        {transporters.length === 0
                                                            ? 'Cuando el backend esté conectado, aquí aparecerán los transportistas de tu zona.'
                                                            : 'Prueba con otro término o cambia el filtro de estado.'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {filtered.map((transporter) => {
                                        const active = transporter.deleted_at === null;

                                        return (
                                            <tr key={transporter.id}>
                                                <td>
                                                    <div className="font-semibold">
                                                        {transporter.first_name} {transporter.last_name}
                                                    </div>
                                                    <div className="text-muted-foreground mt-0.5 text-xs">ID demo · {transporter.id}</div>
                                                </td>
                                                <td>
                                                    <div>{transporter.national_id}</div>
                                                    <div className="text-muted-foreground mt-0.5 text-xs">Lic. {transporter.license_number}</div>
                                                </td>
                                                <td>{transporter.phone ?? '—'}</td>
                                                <td>{transporter.zone ?? '—'}</td>
                                                <td>{transporter.manager ?? '—'}</td>
                                                <td>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        {transporter.vehicle && <Truck className="text-muted-foreground h-3.5 w-3.5" />}
                                                        {transporter.vehicle ?? 'Sin asignar'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <StatusPill active={active} />
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-1">
                                                        <Link
                                                            href={`/transporters/${transporter.id}/edit`}
                                                            className="icon-action"
                                                            title="Editar transportista"
                                                            aria-label={`Editar a ${transporter.first_name} ${transporter.last_name}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        {active && (
                                                            <button
                                                                type="button"
                                                                className="icon-action-danger"
                                                                title="Dar de baja"
                                                                aria-label={`Dar de baja a ${transporter.first_name} ${transporter.last_name}`}
                                                                onClick={() => setSelected(transporter)}
                                                            >
                                                                <UserRoundX className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-muted-foreground flex flex-col gap-1 border-t px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                            <span>La búsqueda y los filtros operan solo sobre estos datos de demostración.</span>
                            <span>Los registros inactivos se identifican usando la baja lógica de SoftDeletes.</span>
                        </div>
                    </section>
                </div>

                {selected && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setSelected(null);
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="deactivation-title"
                            aria-describedby="deactivation-description"
                            className="bg-card w-full max-w-md rounded-xl border p-6 shadow-2xl"
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-amber-100 p-3 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                    <UserRoundX className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 id="deactivation-title" className="text-lg font-semibold">
                                        ¿Dar de baja al transportista?
                                    </h2>
                                    <p className="mt-1 text-sm font-medium">
                                        {selected.first_name} {selected.last_name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelected(null)}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
                                    aria-label="Cerrar"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p id="deactivation-description" className="text-muted-foreground mt-4 text-sm leading-relaxed">
                                Al darlo de baja, dejaría de aparecer entre los transportistas activos. Su registro debe conservarse mediante baja
                                lógica.
                            </p>
                            <p className="bg-muted/70 text-muted-foreground mt-3 rounded-md px-3 py-2 text-xs leading-relaxed">
                                Vista previa: confirmar aquí no ejecuta una operación ni cambia el estado del registro.
                            </p>
                            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelected(null)}
                                    className="bg-background hover:bg-muted h-10 rounded-md border px-4 text-sm font-medium transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeactivation}
                                    className="h-10 rounded-md bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700"
                                >
                                    Confirmar baja (vista previa)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ManagerOnly>
        </AppLayout>
    );
}

function StatusPill({ active }: { active: boolean }) {
    return (
        <span
            className={
                active
                    ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium'
            }
        >
            <span className={active ? 'h-1.5 w-1.5 rounded-full bg-emerald-500' : 'bg-muted-foreground/60 h-1.5 w-1.5 rounded-full'} />
            {active ? 'Activo' : 'Inactivo'}
        </span>
    );
}

function SummaryCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: 'brand' | 'green' | 'muted' }) {
    const tones = {
        brand: 'bg-brand/10 text-brand dark:text-brand-light',
        green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        muted: 'bg-muted text-muted-foreground',
    };

    return (
        <div className="bg-card flex items-center gap-4 rounded-xl border p-4 shadow-sm shadow-black/[0.02] sm:p-5">
            <div className={`rounded-xl p-3 ${tones[tone]}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
            </div>
        </div>
    );
}
