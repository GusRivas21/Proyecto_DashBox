import { Head, useForm, usePage } from '@inertiajs/react';
import { Undo2 } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';

import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { Paginated } from '@/types/pagination';

const statusLabels = {
    registered: 'Pendiente',
    assigned: 'Asignado',
    in_transit: 'En camino',
    delivered: 'Entregado',
    returned: 'Devuelto',
    cancelled: 'Cancelado',
};

type Shipment = {
    id: number;
    company: string | null;
    recipient: string | null;
    status: keyof typeof statusLabels;
    can_return: boolean;
    reason: string | null;
};

type PageProps = {
    shipments: Paginated<Shipment>;
    zone: string | null;
    flash?: { success?: string | null };
    errors?: { shipment_id?: string };
};

const shipmentCode = (id: number) => `DB-${String(id).padStart(4, '0')}`;

function ReturnShipmentDialog({ shipment }: { shipment: Shipment }) {
    const [open, setOpen] = useState(false);
    const reasonId = useId();
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ shipment_id: shipment.id, reason: '' });
    const code = shipmentCode(shipment.id);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/returns', {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (processing) return;
                setOpen(next);
                if (!next) {
                    reset('reason');
                    clearErrors();
                }
            }}
        >
            <DialogTrigger asChild>
                <Button type="button" size="sm" variant="outline" aria-label={`Registrar devolución de ${code}`}>
                    <Undo2 aria-hidden="true" />
                    Registrar devolución
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] rounded-xl">
                <DialogHeader>
                    <DialogTitle>Registrar devolución de {code}</DialogTitle>
                    <DialogDescription>El envío se marcará como Devuelto y quedará registrado el motivo.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor={reasonId}>Motivo de la devolución</Label>
                        <textarea
                            id={reasonId}
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            required
                            maxLength={255}
                            rows={4}
                            disabled={processing}
                            placeholder="Ej. El destinatario rechazó la entrega"
                            aria-invalid={Boolean(errors.reason)}
                            aria-describedby={errors.reason ? `${reasonId}-error` : undefined}
                            className="border-input bg-background focus-visible:ring-ring aria-invalid:border-destructive w-full resize-y rounded-md border px-3 py-2 text-base outline-hidden focus-visible:ring-2 md:text-sm"
                        />
                        <InputError id={`${reasonId}-error`} role="alert" message={errors.reason} />
                        <InputError role="alert" message={errors.shipment_id} />
                    </div>
                    <DialogFooter className="gap-2 sm:space-x-0">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={processing}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="bg-brand hover:bg-brand-dark text-white" disabled={processing}>
                            {processing ? 'Guardando…' : 'Confirmar devolución'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ShipmentReturnsIndex() {
    const { shipments, zone, flash, errors } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Devoluciones', href: '/returns' }]}>
            <Head title="Devoluciones" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                <PageHeader
                    eyebrow={zone ? `Zona ${zone}` : 'Mi zona'}
                    title="Devoluciones"
                    description="Registra devoluciones y consulta los motivos de los envíos devueltos en tu zona."
                />
                <FlashMessage message={flash?.success} />
                <InputError
                    role="alert"
                    message={errors?.shipment_id}
                    className="border-destructive/30 bg-destructive/5 rounded-md border px-4 py-3"
                />

                <section aria-labelledby="return-shipments-heading" className="bg-card rounded-xl border">
                    <h2 id="return-shipments-heading" className="px-5 py-4 text-sm font-semibold">
                        Envíos de tu zona
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th scope="col">Envío</th>
                                    <th scope="col">Empresa</th>
                                    <th scope="col">Destinatario</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Motivo</th>
                                    <th scope="col">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="empty">
                                            No hay envíos disponibles para devolver ni devoluciones registradas en tu zona.
                                        </td>
                                    </tr>
                                )}
                                {shipments.data.map((shipment) => (
                                    <tr key={shipment.id}>
                                        <td className="font-semibold whitespace-nowrap">{shipmentCode(shipment.id)}</td>
                                        <td>{shipment.company ?? '—'}</td>
                                        <td>{shipment.recipient ?? '—'}</td>
                                        <td>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    shipment.status === 'returned'
                                                        ? 'border-violet-500/40 text-violet-700 dark:text-violet-300'
                                                        : 'border-blue-500/40 text-blue-700 dark:text-blue-300'
                                                }
                                            >
                                                {statusLabels[shipment.status]}
                                            </Badge>
                                        </td>
                                        <td className="text-muted-foreground max-w-64 wrap-anywhere">{shipment.reason ?? '—'}</td>
                                        <td>{shipment.can_return ? <ReturnShipmentDialog shipment={shipment} /> : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination page={shipments} />
                </section>
            </div>
        </AppLayout>
    );
}
