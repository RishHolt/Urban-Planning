<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OccupancyInspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'occupancy_id',
        'inspector_id',
        'inspection_date',
        'inspection_type',
        'status',
        'findings',
        'violations',
        'recommendations',
        'next_inspection_date',
        'documents'
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'next_inspection_date' => 'date',
        'violations' => 'array',
        'documents' => 'array',
    ];

    // Relationships
    public function occupancy()
    {
        return $this->belongsTo(OccupancyRecord::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    // Scopes
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeRoutine($query)
    {
        return $query->where('inspection_type', 'routine');
    }

    public function scopeComplaint($query)
    {
        return $query->where('inspection_type', 'complaint');
    }
}