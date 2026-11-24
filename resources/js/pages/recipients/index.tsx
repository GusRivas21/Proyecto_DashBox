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

type Recipient = {
    id: number;
    name: string;
    address: string;
    contact: string;
};

type PageProps = {
    recipients: Paginated<Recipient>;
    filters: { search: string };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    auth: { user: { permissions: string[] } | null };
};

export default function RecipientsIndex() {
    const { recipients, filters, flash, auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions ?? [];
    const canCreate = permissions.includes('recipients.create');
    const canUpdate = permissions.includes('recipients.edit');
    const canDelete = permissions.includes('recipients.delete');
    const { search, setSearch, hasFilters } = useListFilters('/recipients', filters);

    return (
        <AppLayout breadcrumbs={[{ title: 'Destinatarios', href: '/recipients' }]}>
            <Head title="Destinatarios" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    eyebrow="Mi empresa"
                    title="Destinatarios"
                    description="Crea, edita y organiza los destinatarios de tus órdenes de envío."
                >
                    {canCreate && (
                        <Link href="/recipients/create" className="btn-brand">
                            Registrar destinatario
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
                            Buscar destinatario
                        </Label>
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nombre, dirección o contacto"
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-xl border bg-card">
                    <h2 className="px-5 py-4 text-sm font-semibold">Destinatarios registrados</h2>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Destinatario</th>
                                    <th>Dirección</th>
                                    <th>Contacto</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recipients.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="empty">
                                            {hasFilters
                                                ? 'No se encontraron destinatarios con esa búsqueda.'
                                                : 'Aún no has registrado destinatarios.'}
                                        </td>
                                    </tr>
                                )}

                                {recipients.data.map((r) => (
                                    <tr key={r.id}>
                                        {/* Destinatario */}
                                        <td className="font-semibold">{r.name}</td>

                                        {/* Dirección */}
                                        <td>{r.address}</td>

                                        {/* Contacto */}
                                        <td>{r.contact}</td>

                                        {/* Acciones */}
                                        <td>
                                            <RowActions
                                                editHref={
                                                    canUpdate
                                                        ? `/recipients/${r.id}/edit`
                                                        : undefined
                                                }
                                                deleteHref={
                                                    canDelete
                                                        ? `/recipients/${r.id}`
                                                        : undefined
                                                }
                                                confirmTitle="¿Eliminar destinatario?"
                                                confirmMessage="Se eliminará este destinatario de tu lista. Si tiene órdenes de envío asociadas, no se podrá eliminar."
                                                confirmButtonText="Confirmar eliminación"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={recipients} />
                </div>
            </div>
        </AppLayout>
    );
}