import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent } from 'react';

import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Recipient = {
    id: number;
    name: string;
    address: string;
    contact: string;
};

type RecipientForm = {
    name: string;
    contact: string;
    address: string;
};

export default function EditRecipient({ recipient }: { recipient: Recipient }) {
    const { flash } = usePage<{ flash?: { error?: string | null } }>().props;

    const { data, setData, put, processing, errors } = useForm<RecipientForm>({
        name: recipient.name,
        contact: recipient.contact,
        address: recipient.address,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/recipients/${recipient.id}`);
    };

    const field = (
        k: keyof RecipientForm,
        label: string,
        opts: {
            type?: string;
            placeholder?: string;
            autoComplete?: string;
            hint?: string;
        } = {},
    ) => (
        <div className="form-field">
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
                className="h-11"
            />

            {opts.hint && !errors[k] && (
                <p className="text-xs text-muted-foreground">{opts.hint}</p>
            )}

            <InputError message={errors[k]} />
        </div>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Destinatarios', href: '/recipients' },
                { title: 'Editar destinatario', href: `/recipients/${recipient.id}/edit` },
            ]}
        >
            <Head title="Editar destinatario" />

            <div className="flex flex-col gap-8 p-6 lg:p-8">
                <PageHeader
                    eyebrow="Mi empresa"
                    title="Editar destinatario"
                    description="Actualiza la información del destinatario."
                />

                <FlashMessage
                    message={flash?.error}
                    type="error"
                />

                <form
                    onSubmit={submit}
                    noValidate
                    className="w-full rounded-xl border bg-card p-8"
                >
                    {/* Información del destinatario */}
                    <section>
                        <h2 className="text-base font-semibold">
                            Información del destinatario
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Esta información se usará al asignar órdenes de envío.
                        </p>

                        <div className="form-grid">
                            {field('name', 'Nombre', {
                                placeholder: 'Nombre del destinatario',
                            })}

                            {field('contact', 'Contacto', {
                                type: 'tel',
                                placeholder: '0000-0000',
                            })}

                            {field('address', 'Dirección', {
                                placeholder: 'Dirección de entrega',
                            })}
                        </div>
                    </section>

                    {/* Acciones */}
                    <div className="mt-10 flex items-center justify-between border-t pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 px-6"
                            asChild
                        >
                            <Link href="/recipients">Cancelar</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 bg-brand px-6 text-white hover:bg-brand-dark"
                        >
                            {processing && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            Guardar cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}