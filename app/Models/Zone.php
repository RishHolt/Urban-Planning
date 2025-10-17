<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'area',
        'description',
        'color',
        'zone_type_id',
        'city_id',
        'coordinates',
        'area_sqm',
        'is_active',
        'regulations'
    ];

    protected $casts = [
        'coordinates' => 'array',
        'is_active' => 'boolean',
        'area_sqm' => 'decimal:2',
        'regulations' => 'array',
    ];

    /**
     * Get the zone type that owns the zone.
     */
    public function zoneType()
    {
        return $this->belongsTo(ZoneType::class);
    }

    /**
     * Scope to get active zones.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get zones for a specific city.
     */
    public function scopeForCity($query, $cityId)
    {
        return $query->where('city_id', $cityId);
    }

    /**
     * Scope to get zones for a specific zone type.
     */
    public function scopeForZoneType($query, $zoneTypeId)
    {
        return $query->where('zone_type_id', $zoneTypeId);
    }
}