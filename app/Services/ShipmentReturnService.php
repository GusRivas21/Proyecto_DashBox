<?php

namespace App\Services;

use App\Models\Manager;
use App\Models\Shipment;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShipmentReturnService
{
    private const RETURNABLE_STATUSES = ['in_transit'];

    public function canReturn(Shipment $shipment): bool
    {
        return in_array($shipment->status, self::RETURNABLE_STATUSES, true);
    }

    public function manager(int $managerId): Manager
    {
        $manager = Manager::with('zone:id,district')->find($managerId);
        abort_unless($manager, 403, 'Tu cuenta necesita un perfil de gerente activo con una zona asignada.');

        return $manager;
    }

    public function paginate(Manager $manager): LengthAwarePaginator
    {
        return Shipment::query()
            ->with([
                'company' => fn ($query) => $query->withTrashed()->select('id', 'name'),
                'recipient:id,name',
                'latestCompletedReturn',
            ])
            ->whereHas('manager', fn ($query) => $query->withTrashed()->where('zone_id', $manager->zone_id))
            ->whereIn('status', [...self::RETURNABLE_STATUSES, 'returned'])
            ->orderByRaw('CASE WHEN status = ? THEN 1 ELSE 0 END', ['returned'])
            ->latest('id')
            ->paginate(10);
    }

    public function register(int $managerId, int $shipmentId, string $reason): void
    {
        DB::transaction(function () use ($managerId, $shipmentId, $reason) {
            $shipment = Shipment::query()->lockForUpdate()->find($shipmentId);
            $managers = Manager::withTrashed()
                ->whereKey([$managerId, $shipment?->manager_id ?? $managerId])
                ->orderBy('id')
                ->sharedLock()
                ->get()
                ->keyBy('id');

            $manager = $managers->get($managerId);
            abort_unless($manager && ! $manager->trashed(), 403, 'Tu cuenta necesita un perfil de gerente activo con una zona asignada.');

            if (! $shipment || $managers->get($shipment->manager_id)?->zone_id !== $manager->zone_id) {
                throw ValidationException::withMessages(['shipment_id' => 'El envío no está disponible en tu zona.']);
            }

            if (! $this->canReturn($shipment)) {
                throw ValidationException::withMessages(['shipment_id' => $shipment->status === 'returned'
                    ? 'Este envío ya está marcado como Devuelto.'
                    : 'El estado actual del envío no permite registrar una devolución.']);
            }

            $return = $shipment->shipmentReturns()->create([
                'return_date' => now()->toDateString(),
                'reason' => $reason,
                'status' => 'completed',
            ]);

            if (! $return->exists || ! $shipment->update(['status' => 'returned'])) {
                throw ValidationException::withMessages(['shipment_id' => 'No se pudo guardar la devolución. Inténtalo nuevamente.']);
            }
        }, 3);
    }
}
