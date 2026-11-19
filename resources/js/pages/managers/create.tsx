import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Zone = { id: number; department: string; municipality: string; district: string };
type ManagerForm = {
    first_name: string;
    last_name: string;
    national_id: string;
    phone: string;
    email: string;
    password: string;
    zone_id: string;
};

const selectClass = 'h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50';
const gridClass = 'grid gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3';

export default function CreateManager({ zones }: { zones: Zone[] }) {
    const { data, setData, post, processing, errors } = useForm<ManagerForm>({
        first_name: '', last_name: '', national_id: '', phone: '', email: '', password: '', zone_id: '',
    });
    const [department, setDepartment] = useState('');
    const [municipality, setMunicipality] = useState('');
    const departments = useMemo(() => [...new Set(zones.map((zone) => zone.department))].sort(), [zones]);
    const municipalities = useMemo(
        () => [...new Set(zones.filter((zone) => zone.department === department).map((zone) => zone.municipality))].sort(),
        [zones, department],
    );
    const districts = zones.filter((zone) => zone.department === department && zone.municipality === municipality);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/managers');
    };

    const field = (key: keyof ManagerForm, label: string, options: { type?: string; placeholder?: string; hint?: string } = {}) => (
        <div className="grid content-start gap-2">
            <Label htmlFor={key}>{label} <span className="text-destructive">*</span></Label>
            <Input
                id={key}
                type={options.type ?? 'text'}
                value={data[key]}
                placeholder={options.placeholder}
                autoComplete={key === 'password' ? 'new-password' : key === 'email' ? 'email' : 'off'}
                onChange={(event) => setData(key, event.target.value)}
                aria-invalid={!!errors[key]}
                className="h-11"
            />
            {options.hint && !errors[key] && <p className="text-xs text-muted-foreground">{options.hint}</p>}
            <InputError message={errors[key]} />
        </div>
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Gerentes', href: '/managers' }, { title: 'Registrar gerente', href: '/managers/create' }]}>
            <Head title="Registrar gerente" />
            <div className="flex flex-col gap-8 p-6 lg:p-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-widest text-[#1B6272] uppercase dark:text-[#A9C6D3]">Administración general</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Registrar gerente</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Crea su cuenta y asigna la zona que administrará.</p>
                </div>

                <form onSubmit={submit} noValidate className="w-full rounded-xl border bg-card p-6 lg:p-8">
                    <section>
                        <h2 className="text-base font-semibold">Información personal</h2>
                        <div className={`mt-6 ${gridClass}`}>
                            {field('first_name', 'Nombre', { placeholder: 'Nombre del gerente' })}
                            {field('last_name', 'Apellido', { placeholder: 'Apellido del gerente' })}
                            {field('national_id', 'Documento de identidad', { placeholder: '00000000-0' })}
                            {field('phone', 'Teléfono', { type: 'tel', placeholder: '0000-0000' })}
                        </div>
                    </section>

                    <section className="mt-10 border-t pt-8">
                        <h2 className="text-base font-semibold">Zona asignada</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Selecciona una zona que ya esté registrada en el sistema.</p>
                        <div className={`mt-6 ${gridClass}`}>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="department">Departamento <span className="text-destructive">*</span></Label>
                                <select id="department" value={department} onChange={(event) => { setDepartment(event.target.value); setMunicipality(''); setData('zone_id', ''); }} className={selectClass}>
                                    <option value="">Selecciona un departamento</option>
                                    {departments.map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="municipality">Municipio <span className="text-destructive">*</span></Label>
                                <select id="municipality" value={municipality} disabled={!department} onChange={(event) => { setMunicipality(event.target.value); setData('zone_id', ''); }} className={selectClass}>
                                    <option value="">Selecciona un municipio</option>
                                    {municipalities.map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="zone_id">Distrito <span className="text-destructive">*</span></Label>
                                <select id="zone_id" value={data.zone_id} disabled={!municipality} onChange={(event) => setData('zone_id', event.target.value)} aria-invalid={!!errors.zone_id} className={selectClass}>
                                    <option value="">Selecciona un distrito</option>
                                    {districts.map((zone) => <option key={zone.id} value={zone.id}>{zone.district}</option>)}
                                </select>
                                <InputError message={errors.zone_id} />
                            </div>
                        </div>
                    </section>

                    <section className="mt-10 border-t pt-8">
                        <h2 className="text-base font-semibold">Credenciales de acceso</h2>
                        <p className="mt-1 text-sm text-muted-foreground">El rol Gerente y sus permisos se asignan automáticamente.</p>
                        <div className={`mt-6 ${gridClass}`}>
                            {field('email', 'Correo electrónico', { type: 'email', placeholder: 'gerente@ejemplo.com' })}
                            {field('password', 'Contraseña inicial', { type: 'password', placeholder: 'Mínimo 8 caracteres', hint: 'Debe incluir letras y números.' })}
                        </div>
                    </section>

                    <div className="mt-10 flex items-center justify-between border-t pt-6">
                        <Button type="button" variant="outline" className="h-11 px-6" asChild><Link href="/managers">Cancelar</Link></Button>
                        <Button type="submit" disabled={processing} className="h-11 bg-[#1B6272] px-6 text-white hover:bg-[#164E5B]">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />} Guardar gerente
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
