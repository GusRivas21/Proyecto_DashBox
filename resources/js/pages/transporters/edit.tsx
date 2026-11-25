import { Head } from '@inertiajs/react';
import { UserRoundPen } from 'lucide-react';

import DriverForm, { type DriverFormValues, type DriverOption, type DriverOptions } from '@/components/transporters/driver-form';
import ManagerOnly from '@/components/transporters/manager-only';
import AppLayout from '@/layouts/app-layout';

type Transporter = {
    id: number;
    first_name: string;
    last_name: string;
    national_id: string;
    license_number: string;
    phone: string | null;
    zone: { id: number; label: string } | null;
    manager: { id: number; label: string } | null;
    vehicle: { id: number; label: string } | null;
};

export default function EditTransporter({
    transporter,
    options,
    managerZone = null,
}: {
    transporter: Transporter;
    options: DriverOptions;
    managerZone?: DriverOption | null;
}) {
    const initialValues: Partial<DriverFormValues> = {
        first_name: transporter.first_name,
        last_name: transporter.last_name,
        national_id: transporter.national_id,
        license_number: transporter.license_number,
        phone: transporter.phone ?? '',
        zone_id: managerZone ? String(managerZone.id) : '',
        manager_id: transporter.manager ? String(transporter.manager.id) : '',
        vehicle_id: transporter.vehicle ? String(transporter.vehicle.id) : '',
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transportistas', href: '/transporters' },
                { title: 'Editar', href: `/transporters/${transporter.id}/edit` },
            ]}
        >
            <ManagerOnly>
                <Head title="Editar transportista" />
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 lg:p-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-brand/10 text-brand dark:text-brand-light mt-1 rounded-xl p-3">
                            <UserRoundPen className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="eyebrow">Administración de personal</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight">Editar transportista</h1>
                            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
                                Actualiza los datos de identificación y las asignaciones operativas.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm dark:border-sky-900 dark:bg-sky-950/30">
                        <p className="font-semibold text-sky-950 dark:text-sky-100">Datos de demostración · registro {transporter.id}</p>
                        <p className="mt-1 leading-relaxed text-sky-900/80 dark:text-sky-100/80">
                            Los datos personales visibles son ficticios y sirven para revisar la interfaz. No se enviarán ni guardarán cambios. El
                            backend debe proporcionar los datos actuales y las opciones de asignación.
                        </p>
                    </div>

                    <DriverForm mode="edit" options={options} initialValues={initialValues} managerZone={managerZone} />
                </div>
            </ManagerOnly>
        </AppLayout>
    );
}
