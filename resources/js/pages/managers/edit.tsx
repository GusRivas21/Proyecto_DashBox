import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Zone = { id: number; department: string; district: string };
type Manager = { id: number; first_name: string; last_name: string; national_id: string; phone: string | null; zone_id: number; user: { email: string } | null };
type FormData = { first_name: string; last_name: string; national_id: string; phone: string; zone_id: string };

export default function EditManager({ manager, zones }: { manager: Manager; zones: Zone[] }) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        first_name: manager.first_name,
        last_name: manager.last_name,
        national_id: manager.national_id,
        phone: manager.phone ?? '',
        zone_id: String(manager.zone_id),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(`/managers/${manager.id}`);
    };

    const fields: { key: keyof Omit<FormData, 'zone_id'>; label: string; placeholder: string }[] = [
        { key: 'first_name', label: 'Nombre', placeholder: 'Nombre' },
        { key: 'last_name', label: 'Apellido', placeholder: 'Apellido' },
        { key: 'national_id', label: 'Documento de identidad', placeholder: '00000000-0' },
        { key: 'phone', label: 'Teléfono', placeholder: '0000-0000' },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Gerentes', href: '/managers' }, { title: 'Editar gerente', href: `/managers/${manager.id}/edit` }]}>
            <Head title="Editar gerente" />
            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar gerente</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Actualiza sus datos y la zona asignada.</p>
                </div>
                <form onSubmit={submit} className="grid gap-6 rounded-xl border bg-card p-6 sm:grid-cols-2">
                    {fields.map(({ key, label, placeholder }) => (
                        <div className="grid gap-2" key={key}>
                            <Label htmlFor={key}>{label}</Label>
                            <Input id={key} value={data[key]} placeholder={placeholder} onChange={(event) => setData(key, event.target.value)} aria-invalid={!!errors[key]} />
                            <InputError message={errors[key]} />
                        </div>
                    ))}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" value={manager.user?.email ?? ''} disabled />
                        <p className="text-xs text-muted-foreground">El correo de acceso no se puede cambiar desde esta pantalla.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="zone_id">Zona asignada</Label>
                        <select id="zone_id" value={data.zone_id} onChange={(event) => setData('zone_id', event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm" aria-invalid={!!errors.zone_id}>
                            <option value="">Selecciona una zona</option>
                            {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.district}, {zone.department}</option>)}
                        </select>
                        <InputError message={errors.zone_id} />
                    </div>
                    <div className="col-span-full flex justify-between border-t pt-5">
                        <Button type="button" variant="outline" asChild><Link href="/managers">Cancelar</Link></Button>
                        <Button type="submit" disabled={processing} className="bg-[#1B6272] text-white hover:bg-[#164E5B]">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />} Guardar cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
