<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Administrator extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'id',
        'first_name',
        'last_name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id');
    }

    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }

    public function managers(): HasMany
    {
        return $this->hasMany(Manager::class);
    }
}
