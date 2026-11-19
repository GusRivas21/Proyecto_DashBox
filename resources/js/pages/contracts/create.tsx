import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type CompanyOption = { id: number; name: string; tax_id: string };

type ContractForm = {
    company_id: string;
    start_date: string;
    end_date: string;
    amount: string;
};

const selectClass =
    'h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40';

export default function CreateContract({ companies }: { companies: CompanyOption[] }) {
    const { data, setData, post, processing, errors } = useForm<ContractForm>({
        company_id: '',
        start_date: '',
        end_date: '',
        amount: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/contracts');
    };

    const required = <span className="text-destructive">*</span>;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Contratos', href: '/contracts' },
                { title: 'Registrar contrato', href: '/contracts/create' },
            ]}
        >
            <Head title="Registrar contrato" />

            <div className="flex flex-col gap-8 p-6 lg:p-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-widest text-[#1B6272] uppercase dark:text-[#A9C6D3]">
                        Administración general
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Registrar contrato</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Asigna un contrato con vigencia y monto a una empresa cliente.
                    </p>
                </div>

                <form onSubmit={submit} noValidate className="w-full rounded-xl border bg-card p-8">
                    <h2 className="text-base font-semibold">Datos del contrato</h2>

                    <div className="mt-6 grid gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid content-start gap-2">
                            <Label htmlFor="company_id" className="text-sm">Empresa {required}</Label>
                            <select
                                id="company_id"
                                value={data.company_id}
                                onChange={(e) => setData('company_id', e.target.value)}
                                aria-invalid={!!errors.company_id}
                                className={selectClass}
                            >
                                <option value="">Selecciona una empresa</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.tax_id})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.company_id} />
                        </div>

                        <div className="grid content-start gap-2">
                            <Label htmlFor="start_date" className="text-sm">Fecha de inicio {required}</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                aria-invalid={!!errors.start_date}
                                className="h-11"
                            />
                            <InputError message={errors.start_date} />
                        </div>

                        <div className="grid content-start gap-2">
                            <Label htmlFor="end_date" className="text-sm">Fecha de vencimiento {required}</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                aria-invalid={!!errors.end_date}
                                className="h-11"
                            />
                            <InputError message={errors.end_date} />
                        </div>

                        <div className="grid content-start gap-2">
                            <Label htmlFor="amount" className="text-sm">Monto (USD) {required}</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount}
                                placeholder="0.00"
                                onChange={(e) => setData('amount', e.target.value)}
                                aria-invalid={!!errors.amount}
                                className="h-11"
                            />
                            <InputError message={errors.amount} />
                        </div>
                    </div>

                    <p className="mt-5 text-xs text-muted-foreground">
                        El contrato se registra como vigente y pasa a vencido automáticamente al cumplirse su fecha de vencimiento.
                    </p>

                    <div className="mt-10 flex items-center justify-between border-t pt-6">
                        <Button type="button" variant="outline" className="h-11 px-6" asChild>
                            <Link href="/contracts">Cancelar</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 bg-[#1B6272] px-6 text-white hover:bg-[#164E5B]"
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Guardar contrato
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}