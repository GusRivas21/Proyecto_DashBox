
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, Pencil, Trash2, X } from 'lucide-react';

export default function RowActions({
    viewHref,
    editHref,
    deleteHref,
    confirmTitle = '¿Confirmar eliminación?',
    confirmMessage = '¿Estás seguro de que deseas eliminar este registro?',
    confirmButtonText = 'Confirmar',
}: {
    viewHref?: string;
    editHref?: string;
    deleteHref?: string;
    confirmTitle?: string;
    confirmMessage?: string;
    confirmButtonText?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!deleteHref || processing) return;

        router.delete(deleteHref, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: () => setIsOpen(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <div className="flex items-center gap-1">
                {viewHref && (
                    <Link
                        href={viewHref}
                        className="icon-action"
                        title="Consultar"
                        aria-label="Consultar"
                    >
                        <Eye className="h-4 w-4" />
                    </Link>
                )}

                {editHref && (
                    <Link
                        href={editHref}
                        className="icon-action"
                        title="Actualizar"
                        aria-label="Actualizar"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                )}

                {deleteHref && (
                    <button
                        type="button"
                        className="icon-action-danger"
                        title="Dar de baja"
                        aria-label="Dar de baja"
                        onClick={() => setIsOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !processing) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                        aria-describedby="confirm-description"
                        className="w-full max-w-md rounded-md border bg-card p-5 shadow-xl"
                    >
                        {/* Encabezado */}
                        <div className="flex items-start justify-between gap-4">
                            <h2
                                id="confirm-title"
                                className="text-base font-semibold"
                            >
                                {confirmTitle}
                            </h2>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={processing}
                                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                                aria-label="Cerrar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Descripción */}
                        <p
                            id="confirm-description"
                            className="mt-3 text-sm leading-relaxed text-muted-foreground"
                        >
                            {confirmMessage}
                        </p>

                        {/* Botones */}
                        <div className="mt-5 flex items-center gap-2">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => setIsOpen(false)}
                                className="h-9 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleDelete}
                                className="h-9 rounded-md bg-red-600 px-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Procesando...' : confirmButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
