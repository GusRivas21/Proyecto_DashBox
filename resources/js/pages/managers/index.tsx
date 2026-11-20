import { Head, Link, usePage } from '@inertiajs/react';

import FlashMessage from '@/components/flash-message';
import PageHeader from '@/components/page-header';
import Pagination from '@/components/pagination';
import RowActions from '@/components/row-actions';
import AppLayout from '@/layouts/app-layout';
import type { Paginated } from '@/types/pagination';

type Manager = {
    id: number;
    first_name: string;
    last_name: string;
    national_id: string;
    phone: string | null;
    email: string | null;
    zone: string | null;
    active: boolean;
};

type PageProps = {
    managers: Paginated<Manager>;
    flash?: { success?: string | null; error?: string | null };
    auth: { user: { permissions: string[] } | null };
};

export default function ManagersIndex() {
    const { managers, flash, auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions ?? [];
    const canCreate = permissions.includes('managers.create');
    const canUpdate = permissions.includes('managers.edit');
    const canDelete = permissions.includes('managers.delete');

    return (
        <AppLayout breadcrumbs={[{ title: 'Gerentes', href: '/managers' }]}>
            <Head title="Gerentes" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    title="Gerentes"
                    description="Administra las cuentas de gerente y sus zonas asignadas."
                >
                    {canCreate && (
                        <Link href="/managers/create" className="btn-brand">
                            Registrar gerente
                        </Link>
                    )}
                </PageHeader>

                <FlashMessage message={flash?.success} />
                <FlashMessage message={flash?.error} type="error" />

                {/* Tabla */}
                <div className="rounded-xl border bg-card">
                    <h2 className="px-5 py-4 text-sm font-semibold">Gerentes registrados</h2>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Gerente</th>
                                    <th>Documento</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Zona asignada</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="empty">
                                            Aún no hay gerentes registrados.
                                        </td>
                                    </tr>
                                )}

                                {managers.data.map((m) => (
                                    <tr key={m.id}>
                                        <td className="font-semibold">
                                            {m.first_name} {m.last_name}
                                        </td>
                                        <td>{m.national_id}</td>
                                        <td>{m.email ?? '—'}</td>
                                        <td>{m.phone ?? '—'}</td>
                                        <td>{m.zone ?? '—'}</td>
                                        <td className={m.active ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>{m.active ? 'Activo' : 'Inactivo'}</td>
                                        <td>
                                            <RowActions
                                                viewHref={`/managers/${m.id}`}
                                                editHref={m.active && canUpdate ? `/managers/${m.id}/edit` : undefined}
                                                deleteHref={m.active && canDelete ? `/managers/${m.id}` : undefined}
                                                confirmTitle="¿Dar de baja al gerente?"
                                                confirmMessage="Se desactivará la cuenta de acceso del gerente y se conservarán sus registros e historial."
                                                confirmButtonText="Confirmar baja"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={managers} />
                </div>
            </div>
        </AppLayout>
    );
}
