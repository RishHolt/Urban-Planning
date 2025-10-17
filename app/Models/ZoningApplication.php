<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ZoningApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'application_number',
        'status',
        'first_name',
        'last_name',
        'email',
        'contact_number',
        'address',
        'business_name',
        'type_of_applicant',
        'project_type',
        'project_description',
        'project_location',
        'total_lot_area_sqm',
        'total_floor_area_sqm',
        'latitude',
        'longitude',
        'location_confirmed_at',
        'location_confirmed_by',
        'land_ownership',
        'name_of_owner',
        'tct_no',
        'tax_declaration_no',
        'lot_block_survey_no',
        'barangay_clearance_id',
        'or_reference_number',
        'or_date',
        'payment_status',
        'application_fee',
        'base_fee',
        'processing_fee',
        'total_fee',
        'assigned_staff_id',
        'technical_staff_id',
        'forwarded_to_technical_at',
        'returned_from_technical_at',
        'technical_review_started',
        'reviewed_at',
        'additional_notes',
    ];

    protected $casts = [
        'or_date' => 'date',
        'location_confirmed_at' => 'datetime',
        'forwarded_to_technical_at' => 'datetime',
        'returned_from_technical_at' => 'datetime',
        'technical_review_started' => 'boolean',
        'reviewed_at' => 'datetime',
        'total_lot_area_sqm' => 'decimal:2',
        'total_floor_area_sqm' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'application_fee' => 'decimal:2',
        'base_fee' => 'decimal:2',
        'processing_fee' => 'decimal:2',
        'total_fee' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($application) {
            if (empty($application->application_number)) {
                $application->application_number = $application->generateApplicationNumber();
            }
            
            // Auto-calculate fees
            $application->calculateFees();
        });

        static::updating(function ($application) {
            // Recalculate fees if floor area changed
            if ($application->isDirty('total_floor_area_sqm')) {
                $application->calculateFees();
            }
        });
    }

    /**
     * Generate unique application number
     */
    public function generateApplicationNumber(): string
    {
        $year = date('Y');
        $lastApplication = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastApplication ? 
            (int) substr($lastApplication->application_number, -4) + 1 : 1;

        return 'ZC-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate fees based on floor area
     */
    public function calculateFees(): void
    {
        $this->application_fee = 250.00;
        $this->base_fee = 400.00;
        $this->processing_fee = $this->total_floor_area_sqm * 3.00;
        $this->total_fee = $this->application_fee + $this->base_fee + $this->processing_fee;
    }

    /**
     * Get the assigned staff member
     */
    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    /**
     * Get the technical staff member
     */
    public function technicalStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technical_staff_id');
    }

    /**
     * Get the user who confirmed the location
     */
    public function locationConfirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'location_confirmed_by');
    }

    /**
     * Get all documents for this application
     */
    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function history()
    {
        return $this->hasMany(ApplicationHistory::class, 'zoning_application_id');
    }

    /**
     * Get applicant's full name
     */
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * Check if location is confirmed
     */
    public function isLocationConfirmed(): bool
    {
        return !is_null($this->location_confirmed_at);
    }

    /**
     * Check if application is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if application is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if payment is confirmed
     */
    public function isPaymentConfirmed(): bool
    {
        return $this->payment_status === 'confirmed';
    }

    /**
     * Get current department handling application
     */
    public function getCurrentDepartment(): string
    {
        return match($this->status) {
            'pending', 'initial_review', 'awaiting_approval', 'approved', 'rejected' => 'zoning',
            'technical_review' => 'technical',
            'requires_changes' => 'citizen',
            default => 'zoning'
        };
    }
}
