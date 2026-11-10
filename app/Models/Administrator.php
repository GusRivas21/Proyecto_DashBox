<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class Administrator extends Model
{
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'first_name',
        'last_name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id', 'id');
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
