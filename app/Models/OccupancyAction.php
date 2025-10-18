<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OccupancyAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'occupancy_id',
        'actor_id',
        'action',
        'old_status',
        'new_status',
        'note'
    ];

    // Relationships
    public function occupancy()
    {
        return $this->belongsTo(OccupancyRecord::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    // Scopes
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }
}