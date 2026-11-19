import type { ReactNode } from 'react';

export default function PageHeader({
    title,
    description,
    eyebrow = 'Administración general',
    children,
}: {
    title: string;
    description: string;
    eyebrow?: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>

            {children}
        </div>
    );
}