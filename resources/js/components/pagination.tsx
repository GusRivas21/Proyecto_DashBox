import { Link } from '@inertiajs/react';

import type { Paginated } from '@/types/pagination';

export default function Pagination({ page }: { page: Paginated<unknown> }) {
    if (page.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
            <span className="text-muted-foreground">
                Página {page.current_page} de {page.last_page}
            </span>
            <div className="flex gap-2">
                {page.prev_page_url && (
                    <Link href={page.prev_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                        Anterior
                    </Link>
                )}
                {page.next_page_url && (
                    <Link href={page.next_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                        Siguiente
                    </Link>
                )}
            </div>
        </div>
    );
}