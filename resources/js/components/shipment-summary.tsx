import { Clock, Package } from 'lucide-react';

type Recipient = {
    name: string;
    address: string;
    contact: string;
};

type Choice = {
    label: string;
    description: string;
};

export default function ShipmentSummary({
    recipient,
    size,
    cargo,
}: {
    recipient?: Recipient;
    size?: Choice;
    cargo?: Choice;
}) {
    const completed = [recipient, size, cargo].filter(Boolean).length;

    return (
        <aside className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Resumen del envío</h2>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    Pendiente
                </span>
            </div>

            {/* Destinatario */}
            <div className="mt-5 border-t pt-5">
                <p className="text-xs text-muted-foreground">Destinatario</p>

                {recipient ? (
                    <>
                        <p className="mt-1 text-sm font-semibold">{recipient.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{recipient.address}</p>
                        <p className="text-xs text-muted-foreground">{recipient.contact}</p>
                    </>
                ) : (
                    <p className="mt-1 text-sm font-semibold">Sin seleccionar</p>
                )}
            </div>

            {/* Características */}
            <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-5">
                <div>
                    <p className="text-xs text-muted-foreground">Tamaño</p>
                    <p className="mt-1 text-sm font-semibold">{size?.label ?? '—'}</p>
                    {size && <p className="text-xs text-muted-foreground">{size.description}</p>}
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Naturaleza</p>
                    <p className="mt-1 text-sm font-semibold">{cargo?.label ?? '—'}</p>
                    {cargo && <p className="text-xs text-muted-foreground">{cargo.description}</p>}
                </div>
            </div>

            {/* Progreso */}
            <div className="mt-5 flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3 text-sm">
                <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-brand dark:text-brand-light" />
                    Campos completos
                </span>

                <span className="font-semibold">{completed} / 3</span>
            </div>
        </aside>
    );
}