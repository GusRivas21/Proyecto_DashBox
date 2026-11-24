import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function useListFilters<S extends string = 'all'>(
    url: string,
    initial: { search: string; status?: S },
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
                    status: status === 'all' ? undefined : status,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(t);
    }, [search, status, url]);

    return {
        search,
        setSearch,
        status,
        setStatus,
        hasFilters: search !== '' || status !== 'all',
    };
}