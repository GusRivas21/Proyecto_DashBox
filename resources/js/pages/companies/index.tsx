import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

type Company = {
    id: number;
    name: string;
    legal_name: string;
    tax_id: string;
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

type PageProps = {
    companies: Paginated<Company>;
    flash?: { success?: string | null };
    auth: { user: { permissions: string[] } | null };
};

export default function CompaniesIndex() {
    const { companies, flash, auth } = usePage<PageProps>().props;
    const canCreate = auth.user?.permissions.includes('companies.create');

    return (
        <AppLayout breadcrumbs={[{ title: 'Empresas', href: '/companies' }]}>
            <Head title="Empresas" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Empresas</h1>
                    {canCreate && (
                        <Button asChild>
                            <Link href="/companies/create">Nueva empresa</Link>
                        </Button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nombre</th>
                                <th className="px-4 py-3 font-medium">Razón social</th>
                                <th className="px-4 py-3 font-medium">NIT</th>
                                <th className="px-4 py-3 font-medium">Correo</th>
                                <th className="px-4 py-3 font-medium">Teléfono</th>
                                <th className="px-4 py-3 font-medium">Distrito</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Aún no hay empresas registradas.
                                    </td>
                                </tr>
                            )}
                            {companies.data.map((c) => (
                                <tr key={c.id} className="border-t">
                                    <td className="px-4 py-3 font-medium">{c.name}</td>
                                    <td className="px-4 py-3">{c.legal_name}</td>
                                    <td className="px-4 py-3">{c.tax_id}</td>
                                    <td className="px-4 py-3">{c.email}</td>
                                    <td className="px-4 py-3">{c.phone}</td>
                                    <td className="px-4 py-3">{c.zone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {companies.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Página {companies.current_page} de {companies.last_page}
                        </span>
                        <div className="flex gap-2">
                            {companies.prev_page_url && (
                                <Button variant="outline" asChild>
                                    <Link href={companies.prev_page_url}>Anterior</Link>
                                </Button>
                            )}
                            {companies.next_page_url && (
                                <Button variant="outline" asChild>
                                    <Link href={companies.next_page_url}>Siguiente</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}