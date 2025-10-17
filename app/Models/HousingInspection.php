<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousingInspection extends Model
{
    protected $fillable = [
        'application_id',
        'inspector_id',
        'scheduled_date',
        'inspection_date',
        'report',
        'photos',
        'status',
        'notes',
        'dwelling_conditions',
        'occupancy_verified'
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'inspection_date' => 'datetime',
        'photos' => 'array',
        'dwelling_conditions' => 'array',
        'occupancy_verified' => 'boolean'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(HousingApplication::class, 'application_id');
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'completed' => 'green',
            'failed' => 'red',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }
}
