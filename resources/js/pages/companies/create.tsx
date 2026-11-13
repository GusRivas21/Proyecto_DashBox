import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Zone = { id: number; department: string; municipality: string; district: string };

type CompanyForm = {
    legal_name: string;
    name: string;
    tax_id: string;
    zone_id: string;
    phone: string;
    email: string;
    password: string;
};

const controlClass = 'h-11';
const selectClass =
    'h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50';
const gridClass = 'grid gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3';

export default function CreateCompany({ zones }: { zones: Zone[] }) {
    const { data, setData, post, processing, errors } = useForm<CompanyForm>({
        legal_name: '',
        name: '',
        tax_id: '',
        zone_id: '',
        phone: '',
        email: '',
        password: '',
    });

    // Departamento y municipio solo filtran; únicamente zone_id se envía al servidor
    const [department, setDepartment] = useState('');
    const [municipality, setMunicipality] = useState('');

    const departments = useMemo(() => [...new Set(zones.map((z) => z.department))].sort(), [zones]);

    const municipalities = useMemo(
        () => [...new Set(zones.filter((z) => z.department === department).map((z) => z.municipality))].sort(),
        [zones, department],
    );

    const districts = useMemo(
        () => zones.filter((z) => z.department === department && z.municipality === municipality),
        [zones, department, municipality],
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/companies');
    };

    const field = (
        k: keyof CompanyForm,
        label: string,
        opts: { type?: string; placeholder?: string; autoComplete?: string; hint?: string } = {},
    ) => (
        <div className="grid content-start gap-2">
            <Label htmlFor={k} className="text-sm">
                {label} <span className="text-destructive">*</span>
            </Label>
            <Input
                id={k}
                type={opts.type ?? 'text'}
                value={data[k]}
                placeholder={opts.placeholder}
                autoComplete={opts.autoComplete}
                onChange={(e) => setData(k, e.target.value)}
                aria-invalid={!!errors[k]}
                className={controlClass}
            />
            {opts.hint && !errors[k] && <p className="text-xs text-muted-foreground">{opts.hint}</p>}
            <InputError message={errors[k]} />
        </div>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Empresas', href: '/companies' },
                { title: 'Registrar empresa', href: '/companies/create' },
            ]}
        >
            <Head title="Registrar empresa" />

            <div className="flex flex-col gap-8 p-6 lg:p-8">
                {/* Encabezado */}
                <div>
                    <p className="text-[11px] font-semibold tracking-widest text-[#1B6272] uppercase dark:text-[#A9C6D3]">
                        Administración general
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Registrar empresa</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Registra la empresa cliente y asigna su distrito.
                    </p>
                </div>

                <form onSubmit={submit} noValidate className="w-full rounded-xl border bg-card p-8">
                    {/* Información de la empresa */}
                    <section>
                        <h2 className="text-base font-semibold">Información de la empresa</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Datos legales y ubicación de la empresa.</p>

                        <div className={`mt-6 ${gridClass}`}>
                            {field('legal_name', 'Razón social', { placeholder: 'Ingresar razón social' })}
                            {field('name', 'Nombre comercial', { placeholder: 'Ingresar nombre' })}
                            {field('tax_id', 'NIT', { placeholder: '0000-000000-000-0' })}

                            {/* Departamento */}
                            <div className="grid content-start gap-2">
                                <Label htmlFor="department" className="text-sm">
                                    Departamento <span className="text-destructive">*</span>
                                </Label>
                                <select
                                    id="department"
                                    value={department}
                                    onChange={(e) => {
                                        setDepartment(e.target.value);
                                        setMunicipality('');
                                        setData('zone_id', '');
                                    }}
                                    className={selectClass}
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {departments.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Municipio */}
                            <div className="grid content-start gap-2">
                                <Label htmlFor="municipality" className="text-sm">
                                    Municipio <span className="text-destructive">*</span>
                                </Label>
                                <select
                                    id="municipality"
                                    value={municipality}
                                    onChange={(e) => {
                                        setMunicipality(e.target.value);
                                        setData('zone_id', '');
                                    }}
                                    disabled={!department}
                                    className={selectClass}
                                >
                                    <option value="">
                                        {department ? 'Selecciona un municipio' : 'Elige primero el departamento'}
                                    </option>
                                    {municipalities.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Distrito */}
                            <div className="grid content-start gap-2">
                                <Label htmlFor="zone_id" className="text-sm">
                                    Distrito <span className="text-destructive">*</span>
                                </Label>
                                <select
                                    id="zone_id"
                                    value={data.zone_id}
                                    onChange={(e) => setData('zone_id', e.target.value)}
                                    disabled={!municipality}
                                    aria-invalid={!!errors.zone_id}
                                    className={selectClass}
                                >
                                    <option value="">
                                        {municipality ? 'Selecciona un distrito' : 'Elige primero el municipio'}
                                    </option>
                                    {districts.map((z) => (
                                        <option key={z.id} value={z.id}>
                                            {z.district}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.zone_id} />
                            </div>
                        </div>
                    </section>

                    {/* Contacto y cuenta de acceso */}
                    <section className="mt-10 border-t pt-8">
                        <h2 className="text-base font-semibold">Cuenta de acceso</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Con estas credenciales la empresa ingresará a la plataforma.
                        </p>

                        <div className={`mt-6 ${gridClass}`}>
                            {field('email', 'Correo electrónico', {
                                type: 'email',
                                placeholder: 'empresa@ejemplo.com',
                                autoComplete: 'off',
                            })}
                            {field('phone', 'Teléfono', { type: 'tel', placeholder: '0000-0000' })}
                            {field('password', 'Contraseña inicial', {
                                type: 'password',
                                placeholder: 'Definir contraseña',
                                autoComplete: 'new-password',
                                hint: 'Mínimo 8 caracteres.',
                            })}
                        </div>

                        <p className="mt-5 text-xs text-muted-foreground">
                            El rol Empresa cliente se asigna automáticamente.
                        </p>
                    </section>

                    {/* Acciones */}
                    <div className="mt-10 flex items-center justify-between border-t pt-6">
                        <Button type="button" variant="outline" className="h-11 px-6" asChild>
                            <Link href="/companies">Cancelar</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 bg-[#1B6272] px-6 text-white hover:bg-[#164E5B]"
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Guardar empresa
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}