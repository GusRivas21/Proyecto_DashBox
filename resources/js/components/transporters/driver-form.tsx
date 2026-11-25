import { Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEvent, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type DriverOption = { id: number; label: string };
export type VehicleOption = DriverOption & {
    status: 'available' | 'assigned' | 'under_maintenance';
};
export type DriverOptions = {
    zones: DriverOption[];
    managers: DriverOption[];
    vehicles: VehicleOption[];
};

export type DriverFormValues = {
    first_name: string;
    last_name: string;
    national_id: string;
    license_number: string;
    phone: string;
    zone_id: string;
    manager_id: string;
    vehicle_id: string;
};

const emptyValues: DriverFormValues = {
    first_name: '',
    last_name: '',
    national_id: '',
    license_number: '',
    phone: '',
    zone_id: '',
    manager_id: '',
    vehicle_id: '',
};

const selectClass =
    'h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-muted-foreground';

function TextField({
    id,
    label,
    value,
    onChange,
    required = false,
    type = 'text',
    placeholder,
    hint,
    pattern,
    minLength,
    maxLength,
    error,
}: {
    id: keyof DriverFormValues;
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    hint?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    error?: string;
}) {
    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>
                {label}{' '}
                {required ? (
                    <span className="text-destructive">*</span>
                ) : (
                    <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                )}
            </Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                pattern={pattern}
                minLength={minLength}
                maxLength={maxLength}
                aria-invalid={!!error}
                autoComplete="off"
                className="h-11"
            />
            <InputError message={error} />
            {hint && <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>}
        </div>
    );
}

function OptionField({
    id,
    label,
    value,
    options,
    onChange,
    required = false,
    locked = false,
    emptyLabel,
    hint,
    error,
}: {
    id: 'zone_id' | 'manager_id' | 'vehicle_id';
    label: string;
    value: string;
    options: DriverOption[];
    onChange: (value: string) => void;
    required?: boolean;
    locked?: boolean;
    emptyLabel?: string;
    hint?: string;
    error?: string;
}) {
    const enabled = options.length > 0;

    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>
                {label}{' '}
                {required ? (
                    <span className="text-destructive">*</span>
                ) : (
                    <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                )}
            </Label>
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                disabled={!enabled || locked}
                aria-invalid={!!error}
                className={selectClass}
            >
                {!locked && (
                    <option value="">
                        {enabled
                            ? required
                                ? `Selecciona ${label.toLowerCase()}`
                                : 'Sin asignar'
                            : (emptyLabel ?? 'Opciones pendientes del backend')}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.label}
                    </option>
                ))}
            </select>
            <InputError message={error} />
            {hint && <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>}
            {!enabled && !hint && (
                <p className="text-muted-foreground text-xs leading-relaxed">El backend debe proporcionar las opciones disponibles.</p>
            )}
        </div>
    );
}

export default function DriverForm({
    mode,
    transporterId,
    options,
    initialValues,
    managerZone = null,
}: {
    options: DriverOptions;
    initialValues?: Partial<DriverFormValues>;
    managerZone?: DriverOption | null;
} & ({ mode: 'create'; transporterId?: never } | { mode: 'edit'; transporterId: number })) {
    const {
        data: values,
        setData,
        put,
        processing,
        errors,
        clearErrors,
    } = useForm<DriverFormValues>({
        ...emptyValues,
        ...initialValues,
        zone_id: managerZone ? String(managerZone.id) : '',
    });
    const [notice, setNotice] = useState(false);
    const isEdit = mode === 'edit';
    const availableVehicles = options.vehicles.filter(
        (vehicle) => vehicle.status === 'available' || String(vehicle.id) === initialValues?.vehicle_id,
    );

    const update = (key: keyof DriverFormValues, value: string) => {
        setData(key, value);
        clearErrors(key);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (mode === 'edit') {
            put(`/transporters/${transporterId}`);
        } else {
            setNotice(true);
        }
    };

    return (
        <form onSubmit={submit} className="bg-card overflow-hidden rounded-xl border shadow-sm shadow-black/[0.02]">
            <div className="bg-muted/20 border-b px-5 py-4 sm:px-7">
                <div className="flex items-start gap-3">
                    <div className="bg-brand/10 text-brand dark:text-brand-light mt-0.5 rounded-lg p-2">
                        <Save className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold">Datos del transportista</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Los campos marcados con * son obligatorios según las reglas disponibles.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-9 p-5 sm:p-7">
                <section aria-labelledby="personal-heading">
                    <div className="mb-5 border-b pb-3">
                        <h3 id="personal-heading" className="text-sm font-semibold">
                            Información personal
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs">Identificación y medios de contacto.</p>
                    </div>
                    <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                        <TextField
                            id="first_name"
                            label="Nombres"
                            value={values.first_name}
                            onChange={(value) => update('first_name', value)}
                            required
                            maxLength={80}
                            error={errors.first_name}
                            placeholder="Nombres del transportista"
                        />
                        <TextField
                            id="last_name"
                            label="Apellidos"
                            value={values.last_name}
                            onChange={(value) => update('last_name', value)}
                            required
                            maxLength={80}
                            error={errors.last_name}
                            placeholder="Apellidos del transportista"
                        />
                        <TextField
                            id="national_id"
                            label="Documento de identidad"
                            value={values.national_id}
                            onChange={(value) => update('national_id', value)}
                            required
                            pattern={isEdit && values.national_id === initialValues?.national_id ? undefined : '[0-9]{8}-[0-9]'}
                            maxLength={10}
                            error={errors.national_id}
                            placeholder="00000000-0"
                            hint="Formato esperado: 00000000-0."
                        />
                        <TextField
                            id="license_number"
                            label="Número de licencia"
                            value={values.license_number}
                            onChange={(value) => update('license_number', value)}
                            required
                            maxLength={30}
                            error={errors.license_number}
                            placeholder="Número de licencia"
                        />
                        <TextField
                            id="phone"
                            label="Teléfono"
                            value={values.phone}
                            onChange={(value) => update('phone', value)}
                            type="tel"
                            placeholder="0000-0000"
                            required
                            pattern={String.raw`[0-9+\(\) \-]{8,20}`}
                            minLength={8}
                            maxLength={20}
                            error={errors.phone}
                            hint="Ingresá entre 8 y 15 dígitos. Podés incluir el código de país."
                        />
                    </div>
                </section>

                <section aria-labelledby="assignment-heading">
                    <div className="mb-5 border-b pb-3">
                        <h3 id="assignment-heading" className="text-sm font-semibold">
                            Asignación operativa
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs">La zona y el gerente son requeridos; el vehículo es opcional.</p>
                    </div>
                    <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                        <OptionField
                            id="zone_id"
                            label="Zona"
                            value={managerZone ? String(managerZone.id) : values.zone_id}
                            options={managerZone ? [managerZone] : []}
                            onChange={(value) => update('zone_id', value)}
                            required
                            locked={!!managerZone}
                            emptyLabel="Zona del gerente pendiente de recibir por Inertia"
                            error={errors.zone_id}
                            hint={
                                managerZone
                                    ? 'Se usa la zona asignada al gerente y no se puede cambiar.'
                                    : 'El backend debe enviar la zona del gerente autenticado mediante Inertia.'
                            }
                        />
                        <OptionField
                            id="manager_id"
                            label="Gerente"
                            value={values.manager_id}
                            options={options.managers}
                            onChange={(value) => update('manager_id', value)}
                            required
                            error={errors.manager_id}
                        />
                        <OptionField
                            id="vehicle_id"
                            label="Vehículo"
                            value={values.vehicle_id}
                            options={availableVehicles}
                            onChange={(value) => update('vehicle_id', value)}
                            emptyLabel="No hay camiones disponibles"
                            hint={
                                isEdit
                                    ? 'Podés conservar el vehículo actual o elegir uno disponible de tu zona.'
                                    : 'Solo se mostrarán camiones con estado disponible.'
                            }
                            error={errors.vehicle_id}
                        />
                    </div>
                </section>

                {notice && (
                    <div
                        role="status"
                        className="rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                    >
                        <p className="font-semibold">Vista previa: no se guardaron cambios.</p>
                        <p className="mt-1">El backend debe conectar este formulario y proporcionar opciones para zona, gerente y vehículo.</p>
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                    {!isEdit && <p className="text-muted-foreground text-xs">Modo de demostración · sin conexión al backend</p>}
                    <div className="ml-auto flex flex-col-reverse gap-2 sm:flex-row">
                        <Button type="button" variant="outline" className="h-10 px-5" asChild>
                            <Link href="/transporters">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="h-10 bg-[#1B6272] px-5 text-white hover:bg-[#164E5B]">
                            {processing ? 'Guardando…' : isEdit ? 'Actualizar transportista' : 'Registrar transportista'}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
