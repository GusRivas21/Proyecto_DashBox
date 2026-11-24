import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function useListFilters<S extends string = 'all'>(
    url: string,
    initial: { search: string; status?: S },
    filterKey = 'status',
) {
    const [search, setSearch] = useState(initial.search);
    const [status, setStatus] = useState<S | 'all'>(initial.status ?? 'all');
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const t = setTimeout(() => {
            router.get(
                url,
                {
                    search: search || undefined,
                    [filterKey]: status === 'all' ? undefined : status,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(t);
    }, [search, status, url, filterKey]);

    return {
        search,
        setSearch,
        status,
        setStatus,
        hasFilters: search !== '' || status !== 'all',
    };
}