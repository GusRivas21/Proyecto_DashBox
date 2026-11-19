<?php

namespace App\Models;

use App\Enums\ContractStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    public const STATUSES = ['active', 'expired', 'cancelled'];

    protected $fillable = [
        'company_id',
        'start_date',
        'end_date',
        'amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
            'amount'     => 'decimal:2',
            'status'     => ContractStatus::class,
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function effectiveStatus(): ContractStatus
    {
        if ($this->status === ContractStatus::Active && $this->end_date->lt(today())) {
            return ContractStatus::Expired;
        }

        return $this->status;
    }
}