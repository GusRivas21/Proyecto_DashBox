import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
}

interface LoginProps {
    status?: string;
}

// Colores fijos (claros) para que el modo oscuro de la app no cambie el texto de los campos
const inputClass =
    'h-12 rounded-md border-slate-300 bg-white px-4 text-base text-[#10242F] shadow-none ' +
    'placeholder:text-slate-400 focus-visible:border-[#1B6272] focus-visible:ring-[#1B6272]/25 ' +
    'dark:border-slate-300 dark:bg-white dark:text-[#10242F] dark:placeholder:text-slate-400';

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div className="grid min-h-svh lg:grid-cols-[5fr_7fr]">
                {/* Panel de identidad (oculto en móvil) */}
                <aside className="hidden flex-col justify-between bg-[#10242F] px-16 py-14 text-white lg:flex">
                    <span className="text-2xl font-bold tracking-tight">
                        DASHBOX
                    </span>

                    <div className="my-auto max-w-lg">
                        <h1 className="text-6xl leading-[1.1] font-bold tracking-tight">
                            Cada envío,
                            <br />
                            en su lugar.
                        </h1>

                        <p className="mt-8 max-w-md text-lg leading-relaxed text-white/65">
                            Gestión de envíos B2B2C para empresas, gerentes y transportistas.
                        </p>
                    </div>
                </aside>

                {/* Panel del formulario */}
                <main className="flex flex-col items-center justify-center gap-8 bg-[#F4F7FA] px-6 py-12">
                    <span className="text-2xl font-bold tracking-tight text-[#10242F] lg:hidden">DASHBOX</span>

                    <div className="w-full max-w-lg rounded-xl bg-white p-10 shadow-sm ring-1 ring-slate-200/70">
                        <h2 className="text-3xl font-semibold tracking-tight text-[#10242F]">Bienvenido a DashBox</h2>
                        <p className="mt-2 text-base text-slate-500">Ingresa con las credenciales de tu cuenta.</p>

                        <form className="mt-10 flex flex-col gap-6" onSubmit={submit} noValidate>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="empresa@ejemplo.com"
                                    aria-invalid={!!errors.email}
                                    className={inputClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••••••"
                                    aria-invalid={!!errors.password}
                                    className={inputClass}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                tabIndex={3}
                                disabled={processing}
                                className="mt-2 h-12 w-fit bg-[#1B6272] px-8 text-base text-white hover:bg-[#164E5B]"
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Iniciar sesión
                            </Button>
                        </form>

                        {status && <div className="mt-4 text-sm font-medium text-green-600">{status}</div>}
                    </div>
                </main>
            </div>
        </>
    );
}