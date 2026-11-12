import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Zone = { id: number; department: string; district: string };

type CompanyForm = {
    name: string;
    legal_name: string;
    tax_id: string;
    email: string;
    phone: string;
    zone_id: string;
};

export default function CreateCompany({ zones }: { zones: Zone[] }) {
    const { data, setData, post, processing, errors } = useForm<CompanyForm>({
        name: '',
        legal_name: '',
        tax_id: '',
        email: '',
        phone: '',
        zone_id: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/companies');
    };

    const field = (k: keyof CompanyForm, label: string, type = 'text', placeholder?: string) => (
        <div className="grid gap-2">
            <Label htmlFor={k}>{label}</Label>
            <Input
                id={k}
                type={type}
                value={data[k]}
                placeholder={placeholder}
                onChange={(e) => setData(k, e.target.value)}
                aria-invalid={!!errors[k]}
            />
            <InputError message={errors[k]} />
        </div>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Empresas', href: '/companies' },
                { title: 'Nueva empresa', href: '/companies/create' },
            ]}
        >
            <Head title="Nueva empresa" />

            <div className="p-4">
                <form onSubmit={submit} className="flex max-w-xl flex-col gap-5" noValidate>
                    <h1 className="text-xl font-semibold">Registrar empresa cliente</h1>

                    {field('name', 'Nombre')}
                    {field('legal_name', 'Razón social')}
                    {field('tax_id', 'NIT / Documento')}
                    {field('email', 'Correo', 'email', 'empresa@ejemplo.com')}
                    {field('phone', 'Teléfono', 'tel', '7777-8888')}

                    <div className="grid gap-2">
                        <Label htmlFor="zone_id">Distrito</Label>
                        <select
                            id="zone_id"
                            value={data.zone_id}
                            onChange={(e) => setData('zone_id', e.target.value)}
                            aria-invalid={!!errors.zone_id}
                            className="h-9 rounded-md border bg-transparent px-3 text-sm"
                        >
                            <option value="">Selecciona un distrito</option>
                            {zones.map((z) => (
                                <option key={z.id} value={z.id}>
                                    {z.district} ({z.department})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.zone_id} />
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Registrar empresa
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/companies">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}