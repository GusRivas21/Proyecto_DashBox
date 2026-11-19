import { Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export default function RowActions({
    viewHref,
    editHref,
    deleteHref,
    confirmMessage = '¿Seguro que deseas eliminar este registro?',
}: {
    viewHref?: string;
    editHref?: string;
    deleteHref?: string;
    confirmMessage?: string;
}) {
    return (
        <div className="flex items-center gap-1">
            {viewHref && (
                <Link href={viewHref} className="icon-action" title="Consultar" aria-label="Consultar">
                    <Eye className="h-4 w-4" />
                </Link>
            )}

            {editHref && (
                <Link href={editHref} className="icon-action" title="Actualizar" aria-label="Actualizar">
                    <Pencil className="h-4 w-4" />
                </Link>
            )}

            {deleteHref && (
                <button
                    type="button"
                    className="icon-action-danger"
                    title="Eliminar"
                    aria-label="Eliminar"
                    onClick={() => {
                        if (confirm(confirmMessage)) {
                            router.delete(deleteHref, { preserveScroll: true });
                        }
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}