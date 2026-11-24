import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Box, LoaderCircle, Package, Weight, Wine } from 'lucide-react';
import { FormEvent } from 'react';

import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import OptionPicker from '@/components/option-picker';
import PageHeader from '@/components/page-header';
import ShipmentSummary from '@/components/shipment-summary';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Recipient = {
    id: number;
    name: string;
    address: string;
    contact: string;
};

type ShipmentForm = {
    recipient_id: string;
    size: string;
    cargo_type: string;
};

const sizes = [
    { value: 'small', label: 'Pequeño', description: 'Hasta 2 kg', icon: Package, iconClass: 'h-5 w-5' },
    { value: 'medium', label: 'Mediano', description: '2 a 10 kg', icon: Package, iconClass: 'h-6 w-6' },
    { value: 'large', label: 'Grande', description: 'Más de 10 kg', icon: Package, iconClass: 'h-8 w-8' },
];

const cargoTypes = [
    { value: 'fragile', label: 'Frágil', description: 'Manejo delicado', icon: Wine },
    { value: 'neutral', label: 'Neutro', description: 'Carga estándar', icon: Box },
    { value: 'heavy', label: 'Pesado', description: 'Soporte reforzado', icon: Weight },
];

export default function CreateShipment({ recipients }: { recipients: Recipient[] }) {
    const { flash } = usePage<{ flash?: { error?: string | null } }>().props;

    const { data, setData, post, processing, errors } = useForm<ShipmentForm>({
        recipient_id: '',
        size: '',
        cargo_type: '',
    });

    const selectedRecipient = recipients.find((r) => String(r.id) === data.recipient_id);
    const selectedSize = sizes.find((s) => s.value === data.size);
    const selectedCargo = cargoTypes.find((c) => c.value === data.cargo_type);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/shipments');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Envíos', href: '/shipments' },
                { title: 'Registrar envío', href: '/shipments/create' },
            ]}
        >
            <Head title="Registrar envío" />

            <div className="flex flex-col gap-8 p-6 lg:p-8">
                <PageHeader
                    eyebrow="Mi empresa"
                    title="Registrar envío"
                    description="Selecciona el destinatario y clasifica el pedido."
                />

                <FlashMessage
                    message={flash?.error}
                    type="error"
                />

                <div className="grid items-start gap-6 lg:grid-cols-3">
                    <form
                        onSubmit={submit}
                        noValidate
                        className="rounded-xl border bg-card lg:col-span-2"
                    >
                        {/* Destinatario */}
                        <section className="p-6">
                            <h2 className="text-base font-semibold">
                                Destinatario
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Selecciona a quién se le entregará el envío.
                            </p>

                            <div className="form-field mt-6">
                                <Label htmlFor="recipient_id" className="text-sm">
                                    Destinatario <span className="text-destructive">*</span>
                                </Label>

                                <select
                                    id="recipient_id"
                                    value={data.recipient_id}
                                    onChange={(e) => setData('recipient_id', e.target.value)}
                                    aria-invalid={!!errors.recipient_id}
                                    className="form-select"
                                >
                                    <option value="">Selecciona un destinatario</option>

                                    {recipients.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>

                                {recipients.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Aún no tienes destinatarios.{' '}
                                        <Link href="/recipients/create" className="link-brand">
                                            Registrar uno
                                        </Link>
                                    </p>
                                )}

                                <InputError message={errors.recipient_id} />
                            </div>
                        </section>

                        {/* Características del pedido */}
                        <section className="border-t p-6">
                            <h2 className="text-base font-semibold">
                                Características del pedido
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                El estado inicial del envío será pendiente.
                            </p>

                            <div className="mt-6 flex flex-col gap-6">
                                {/* Tamaño */}
                                <div className="form-field">
                                    <Label className="text-sm">
                                        Tamaño <span className="text-destructive">*</span>
                                    </Label>

                                    <OptionPicker
                                        label="Tamaño"
                                        options={sizes}
                                        value={data.size}
                                        onChange={(v) => setData('size', v)}
                                        invalid={!!errors.size}
                                    />

                                    <InputError message={errors.size} />
                                </div>

                                {/* Naturaleza */}
                                <div className="form-field">
                                    <Label className="text-sm">
                                        Naturaleza del paquete <span className="text-destructive">*</span>
                                    </Label>

                                    <OptionPicker
                                        label="Naturaleza del paquete"
                                        options={cargoTypes}
                                        value={data.cargo_type}
                                        onChange={(v) => setData('cargo_type', v)}
                                        invalid={!!errors.cargo_type}
                                    />

                                    <InputError message={errors.cargo_type} />
                                </div>
                            </div>
                        </section>

                        {/* Acciones */}
                        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 px-6"
                                asChild
                            >
                                <Link href="/shipments">Cancelar</Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 bg-brand px-6 text-white hover:bg-brand-dark"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                Guardar envío
                            </Button>
                        </div>
                    </form>

                    <ShipmentSummary
                        recipient={selectedRecipient}
                        size={selectedSize}
                        cargo={selectedCargo}
                    />
                </div>
            </div>
        </AppLayout>
    );
}