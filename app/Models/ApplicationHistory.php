<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationHistory extends Model
{
    protected $table = 'application_history';
    
    protected $fillable = [
        'zoning_application_id',
        'action',
        'old_value',
        'new_value',
        'remarks',
        'performed_by',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(ZoningApplication::class, 'zoning_application_id');
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
