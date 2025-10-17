<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HouseholdMember extends Model
{
    protected $fillable = [
        'application_id',
        'name',
        'relation',
        'birthdate',
        'id_type',
        'id_number'
    ];

    protected $casts = [
        'birthdate' => 'date'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(HousingApplication::class, 'application_id');
    }
}
