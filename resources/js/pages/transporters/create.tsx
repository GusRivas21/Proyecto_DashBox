import { Head } from '@inertiajs/react';
import { UserRoundPlus } from 'lucide-react';

import DriverForm, { type DriverOption, type DriverOptions } from '@/components/transporters/driver-form';
import ManagerOnly from '@/components/transporters/manager-only';
import AppLayout from '@/layouts/app-layout';

export default function CreateTransporter({ options, managerZone = null }: { options: DriverOptions; managerZone?: DriverOption | null }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transportistas', href: '/transporters' },
                { title: 'Registrar', href: '/transporters/create' },
            ]}
        >
            <ManagerOnly>
                <Head title="Registrar transportista" />
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 lg:p-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-brand/10 text-brand dark:text-brand-light mt-1 rounded-xl p-3">
                            <UserRoundPlus className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="eyebrow">Administración de personal</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight">Registrar transportista</h1>
                            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
                                Registra sus datos de identificación y prepara la asignación de zona, gerente y vehículo.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                        <p className="font-semibold text-amber-950 dark:text-amber-100">Formulario de demostración</p>
                        <p className="mt-1 leading-relaxed text-amber-900/80 dark:text-amber-100/80">
                            No se enviarán ni guardarán datos. Las opciones de zona, gerente y vehículo aparecerán cuando el backend las proporcione.
                        </p>
                    </div>

                    <DriverForm mode="create" options={options} managerZone={managerZone} />
                </div>
            </ManagerOnly>
        </AppLayout>
    );
}
