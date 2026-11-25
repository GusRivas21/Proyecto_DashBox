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
    manager_id: number;
    vehicle_id: number | null;
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
        national_id: transporter.national_id.replace(/^(\d{8})(\d)$/, '$1-$2'),
        license_number: transporter.license_number,
        phone: transporter.phone ?? '',
        zone_id: managerZone ? String(managerZone.id) : '',
        manager_id: String(transporter.manager_id),
        vehicle_id: transporter.vehicle_id === null ? '' : String(transporter.vehicle_id),
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

                    <DriverForm
                        key={transporter.id}
                        mode="edit"
                        transporterId={transporter.id}
                        options={options}
                        initialValues={initialValues}
                        managerZone={managerZone}
                    />
                </div>
            </ManagerOnly>
        </AppLayout>
    );
}
