import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

type Manager = {
    id: number;
    first_name: string;
    last_name: string;
    national_id: string;
    phone: string | null;
    zone: { department: string; district: string } | null;
    user: { email: string } | null;
    deleted_at: string | null;
};

export default function ShowManager({ manager }: { manager: Manager }) {
    const details = [
        ['Nombre', `${manager.first_name} ${manager.last_name}`],
        ['Documento', manager.national_id],
        ['Correo', manager.user?.email ?? '—'],
        ['Teléfono', manager.phone ?? '—'],
        ['Zona asignada', manager.zone ? `${manager.zone.district}, ${manager.zone.department}` : '—'],
        ['Estado', manager.deleted_at ? 'Inactivo' : 'Activo'],
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Gerentes', href: '/managers' }, { title: 'Detalle', href: `/managers/${manager.id}` }]}>
            <Head title="Detalle del gerente" />
            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Detalle del gerente</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Información de la cuenta y zona asignada.</p>
                </div>
                <div className="rounded-xl border bg-card p-6">
                    <dl className="grid gap-5 sm:grid-cols-2">
                        {details.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-sm text-muted-foreground">{label}</dt>
                                <dd className="mt-1 font-medium">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-8 border-t pt-5">
                        <Link href="/managers" className="btn-brand">Volver a gerentes</Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
