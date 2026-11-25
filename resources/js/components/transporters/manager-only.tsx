import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

type AuthProps = {
    auth: {
        user: {
            roles: string[];
        } | null;
    };
};

export default function ManagerOnly({ children }: { children: ReactNode }) {
    const { auth } = usePage<AuthProps>().props;

    if (auth.user?.roles.includes('manager')) {
        return children;
    }

    return (
        <section role="alert" className="bg-card m-6 rounded-xl border p-6 lg:m-8">
            <h1 className="text-lg font-semibold">Acceso restringido</h1>
            <p className="text-muted-foreground mt-2 text-sm">La gestión de transportistas está disponible para el rol Gerente.</p>
        </section>
    );
}
