<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    public const STATUSES = ['available', 'assigned', 'under_maintenance'];

    protected $fillable = [
        'manager_id',
        'plate',
        'brand',
        'model',
        'year',
        'capacity',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'capacity' => 'decimal:2',
        ];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class);
    }

    public function drivers(): HasMany
    {
        return $this->hasMany(Driver::class);
    }
}
