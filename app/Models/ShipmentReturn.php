<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentReturn extends Model
{
    public const STATUSES = ['pending', 'approved', 'rejected', 'completed'];

    protected $fillable = [
        'shipment_id',
        'return_date',
        'reason',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'return_date' => 'date',
        ];
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
