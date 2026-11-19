import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Manager = {
    id: number;
    first_name: string;
    last_name: string;
    national_id: string;
    phone: string | null;
    email: string | null;
    zone: string | null;
};
type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function ManagersIndex({ managers, canCreate, flash }: {
    managers: Paginated<Manager>;
    canCreate: boolean;
    flash?: { success?: string | null };
}) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Gerentes', href: '/managers' }]}>
            <Head title="Gerentes" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest text-[#1B6272] uppercase dark:text-[#A9C6D3]">Administración general</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight">Gerentes</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Administra las cuentas de gerente y sus zonas asignadas.</p>
                    </div>
                    {canCreate && <Link href="/managers/create" className="rounded-md bg-[#1B6272] px-4 py-2 text-sm font-medium text-white hover:bg-[#164E5B]">Registrar gerente</Link>}
                </div>

                {flash?.success && <div role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">{flash.success}</div>}

                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Gerente</th>
                                    <th className="px-5 py-3 font-semibold">Documento</th>
                                    <th className="px-5 py-3 font-semibold">Correo</th>
                                    <th className="px-5 py-3 font-semibold">Teléfono</th>
                                    <th className="px-5 py-3 font-semibold">Zona asignada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {managers.data.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Aún no hay gerentes registrados.</td></tr>
                                ) : managers.data.map((manager) => (
                                    <tr key={manager.id} className="hover:bg-muted/30">
                                        <td className="px-5 py-4 font-medium">{manager.first_name} {manager.last_name}</td>
                                        <td className="px-5 py-4">{manager.national_id}</td>
                                        <td className="px-5 py-4">{manager.email ?? '—'}</td>
                                        <td className="px-5 py-4">{manager.phone ?? '—'}</td>
                                        <td className="px-5 py-4">{manager.zone ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {managers.last_page > 1 && <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
                        <span className="text-muted-foreground">Página {managers.current_page} de {managers.last_page}</span>
                        <div className="flex gap-2">
                            {managers.prev_page_url && <Link href={managers.prev_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">Anterior</Link>}
                            {managers.next_page_url && <Link href={managers.next_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">Siguiente</Link>}
                        </div>
                    </div>}
                </div>
            </div>
        </AppLayout>
    );
}
