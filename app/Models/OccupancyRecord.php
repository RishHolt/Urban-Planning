<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OccupancyRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'beneficiary_name',
        'contact_number',
        'email',
        'address',
        'barangay',
        'unit_identifier',
        'program_type',
        'household_size',
        'move_in_date',
        'move_out_date',
        'lease_start_date',
        'lease_end_date',
        'status',
        'termination_reason',
        'notes'
    ];

    protected $casts = [
        'move_in_date' => 'date',
        'move_out_date' => 'date',
        'lease_start_date' => 'date',
        'lease_end_date' => 'date',
    ];

    // Relationships
    public function application()
    {
        return $this->belongsTo(HousingApplication::class, 'application_id');
    }

    public function inspections()
    {
        return $this->hasMany(OccupancyInspection::class, 'occupancy_id');
    }

    public function actions()
    {
        return $this->hasMany(OccupancyAction::class, 'occupancy_id');
    }


    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeEnded($query)
    {
        return $query->where('status', 'ended');
    }

    public function scopeTerminated($query)
    {
        return $query->where('status', 'terminated');
    }
}