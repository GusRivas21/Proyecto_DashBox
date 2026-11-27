<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Shipment extends Model
{
    public const STATUSES = ['registered', 'assigned', 'in_transit', 'delivered', 'returned', 'cancelled'];
    public const SIZES = ['small', 'medium', 'large'];
    public const CARGO_TYPES = ['fragile', 'neutral', 'heavy'];

    protected $fillable = [
        'company_id',   
        'recipient_id',
        'manager_id',
        'driver_id',
        'size',
        'cargo_type',
        'status',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(Recipient::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function deliveryProofs(): HasMany
    {
        return $this->hasMany(DeliveryProof::class);
    }

    public function shipmentReturns(): HasMany
    {
        return $this->hasMany(ShipmentReturn::class);
    }

    public function latestCompletedReturn(): HasOne
    {
        return $this->shipmentReturns()->one()->ofMany(['id' => 'max'], fn ($query) => $query->where('status', 'completed'));
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
