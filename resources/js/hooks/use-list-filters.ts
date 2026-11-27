import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function useListFilters<S extends string = 'all'>(
    url: string,
    initial: { search: string; status?: S },
    filterKey = 'status',
    options?: { query?: Record<string, string | undefined>; enabled?: boolean },
) {
    const extraQuery = options?.query;
    const enabled = options?.enabled ?? true;
    const [search, setSearch] = useState(initial.search);
    const [status, setStatus] = useState<S | 'all'>(initial.status ?? 'all');
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (!enabled) return;

        const t = setTimeout(() => {
            router.get(
                url,
                {
                    ...extraQuery,
                    search: search || undefined,
                    [filterKey]: status === 'all' ? undefined : status,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(t);
    }, [search, status, url, filterKey, extraQuery, enabled]);

    return {
        search,
        setSearch,
        status,
        setStatus,
        hasFilters: search !== '' || status !== 'all' || Object.values(extraQuery ?? {}).some(Boolean),
    };
}