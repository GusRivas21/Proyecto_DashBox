<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    protected $fillable = [
        'department',
        'municipality',
        'district',
    ];



    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }

    public function managers(): HasMany
    {
        return $this->hasMany(Manager::class);
    }

    public function drivers(): HasMany
    {
        return $this->hasMany(Driver::class);
    }
}
