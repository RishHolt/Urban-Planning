<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZoneType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color',
        'city_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the zones for this zone type.
     */
    public function zones()
    {
        return $this->hasMany(Zone::class);
    }

    /**
     * Scope to get active zone types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get zone types for a specific city.
     */
    public function scopeForCity($query, $cityId)
    {
        return $query->where('city_id', $cityId);
    }
}