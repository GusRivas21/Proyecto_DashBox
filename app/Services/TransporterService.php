<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Manager;
use App\Models\Vehicle;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransporterService
{
    /** @return array<string, mixed> */
    public function options(Driver $driver): array
    {
        $managers = Manager::query()->where('zone_id', $driver->zone_id)
            ->orderBy('first_name')->orderBy('last_name')->get();

        if ($driver->manager && ! $managers->contains('id', $driver->manager_id)) {
            $managers->push($driver->manager);
        }

        $vehicles = Vehicle::whereHas('manager', fn ($query) => $query->where('zone_id', $driver->zone_id))
            ->where('status', 'available')->whereDoesntHave('drivers')
            ->orderBy('plate')->get();

        if ($driver->vehicle && ! $vehicles->contains('id', $driver->vehicle_id)) {
            $vehicles->push($driver->vehicle);
        }

        return [
            'zones' => [],
            'managers' => $managers->map(fn (Manager $manager) => [
                'id' => $manager->id,
                'label' => $manager->first_name.' '.$manager->last_name,
            ])->values(),
            'vehicles' => $vehicles->map(fn (Vehicle $vehicle) => [
                'id' => $vehicle->id,
                'label' => $vehicle->plate.' · '.$vehicle->brand.' '.$vehicle->model,
                'status' => $vehicle->status,
            ])->values(),
        ];
    }

    /** @param array<string, mixed> $data */
    public function update(Driver $driver, int $managerId, array $data): void
    {
        DB::transaction(function () use ($driver, $managerId, $data) {
            // Existing phone formats cannot share a plain unique index; serialize the duplicate checks and write.
            DB::statement('LOCK TABLE drivers IN SHARE ROW EXCLUSIVE MODE');

            $current = Driver::query()->lockForUpdate()->findOrFail($driver->getKey());
            $manager = Manager::query()->lockForUpdate()->find($managerId);
            abort_unless($manager && $manager->zone_id === $current->zone_id, 403);

            $assigneeId = (int) $data['manager_id'];
            if ($assigneeId !== $current->manager_id
                && ! Manager::whereKey($assigneeId)->where('zone_id', $current->zone_id)->exists()) {
                throw ValidationException::withMessages(['manager_id' => 'Seleccioná un gerente activo de esta zona.']);
            }

            $this->checkDuplicates($current, $data);
            $previousVehicleId = $current->vehicle_id;
            $vehicleId = Arr::get($data, 'vehicle_id', $previousVehicleId);
            $vehicleId = $vehicleId === null ? null : (int) $vehicleId;

            if ($vehicleId !== $previousVehicleId) {
                $this->updateVehicles($current, $vehicleId);
            }

            $current->update([
                ...Arr::only($data, ['first_name', 'last_name', 'national_id', 'license_number', 'phone']),
                'manager_id' => $assigneeId,
                'vehicle_id' => $vehicleId,
            ]);

            $current->user()->withTrashed()->firstOrFail()->update([
                'name' => $current->first_name.' '.$current->last_name,
            ]);
        });
    }

    /** @param array<string, mixed> $data */
    private function checkDuplicates(Driver $driver, array $data): void
    {
        $otherDrivers = Driver::withTrashed()->whereKeyNot($driver->getKey());
        $errors = [];

        if ((clone $otherDrivers)->whereRaw("replace(national_id, '-', '') = ?", [str_replace('-', '', $data['national_id'])])->exists()) {
            $errors['national_id'] = 'Ya existe un transportista con este documento.';
        }

        if ((clone $otherDrivers)->whereRaw('lower(license_number) = lower(?)', [$data['license_number']])->exists()) {
            $errors['license_number'] = 'Ya existe un transportista con esta licencia.';
        }

        $phoneDigits = preg_replace('/\D/', '', $data['phone']);
        if ((clone $otherDrivers)->whereRaw("regexp_replace(phone, '[^0-9]', '', 'g') = ?", [$phoneDigits])->exists()) {
            $errors['phone'] = 'Ya existe un transportista con este teléfono.';
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function updateVehicles(Driver $driver, ?int $vehicleId): void
    {
        $vehicles = Vehicle::whereKey(array_filter([$driver->vehicle_id, $vehicleId]))
            ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

        if ($vehicleId !== null) {
            $vehicle = $vehicles->get($vehicleId);
            if (! $vehicle || $vehicle->status !== 'available'
                || ! $vehicle->manager()->where('zone_id', $driver->zone_id)->exists()
                || $vehicle->drivers()->exists()) {
                throw ValidationException::withMessages(['vehicle_id' => 'Seleccioná un vehículo disponible de esta zona.']);
            }

            $vehicle->update(['status' => 'assigned']);
        }

        $previous = $vehicles->get($driver->vehicle_id);
        if ($previous?->status === 'assigned'
            && $previous->manager()->withTrashed()->where('zone_id', $driver->zone_id)->exists()
            && ! $previous->drivers()->whereKeyNot($driver->getKey())->exists()) {
            $previous->update(['status' => 'available']);
        }
    }
}
