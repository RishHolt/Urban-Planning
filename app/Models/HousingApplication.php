<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HousingApplication extends Model
{
    protected $fillable = [
        'application_number',
        'applicant_id',
        'status',
        'score',
        'submitted_at',
        'eligibility_checked_at',
        'approved_at',
        'rejected_at',
        'full_name',
        'birthdate',
        'gender',
        'civil_status',
        'national_id',
        'mobile',
        'email',
        'preferred_contact',
        'household_size',
        'current_address',
        'latitude',
        'longitude',
        'years_at_address',
        'barangay',
        'employment_status',
        'employer_name',
        'monthly_income',
        'income_type',
        'other_income_sources',
        'total_household_income',
        'housing_type',
        'rooms',
        'floor_area',
        'occupancy_density',
        'program_type',
        'requested_units',
        'preferred_project',
        'assigned_staff_id',
        'inspector_id',
        'eligibility_passed',
        'eligibility_notes',
        'rejection_reason',
        'approval_notes',
        'offer_details',
        'beneficiary_id',
        'housing_unit_id',
        'submission_channel',
        'ip_address',
        'device_info'
    ];

    protected $casts = [
        'birthdate' => 'date',
        'submitted_at' => 'datetime',
        'eligibility_checked_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'monthly_income' => 'decimal:2',
        'total_household_income' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'floor_area' => 'decimal:2',
        'occupancy_density' => 'decimal:2',
        'score' => 'decimal:2',
        'eligibility_passed' => 'boolean'
    ];

    // Relationships
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function householdMembers(): HasMany
    {
        return $this->hasMany(HouseholdMember::class, 'application_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(HousingDocument::class, 'application_id');
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(HousingInspection::class, 'application_id');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(HousingAction::class, 'application_id');
    }

    // Helper methods
    public function isEligible(): bool
    {
        return $this->eligibility_passed === true;
    }

    public function calculateScore(): float
    {
        // This would implement the scoring formula
        // For now, return a placeholder
        return 0.0;
    }

    public function canTransitionTo(string $newStatus): bool
    {
        $allowedTransitions = [
            'draft' => ['submitted'],
            'submitted' => ['eligibility_check', 'withdrawn'],
            'eligibility_check' => ['document_verification', 'rejected', 'info_requested'],
            'document_verification' => ['field_inspection', 'info_requested'],
            'field_inspection' => ['final_review'],
            'final_review' => ['approved', 'rejected'],
            'info_requested' => ['submitted'],
            'approved' => ['offer_issued'],
            'offer_issued' => ['beneficiary_assigned'],
            'beneficiary_assigned' => ['closed'],
            'rejected' => ['appeal'],
            'appeal' => ['final_review'],
            'on_hold' => ['draft', 'submitted', 'eligibility_check', 'document_verification', 'field_inspection', 'final_review']
        ];

        return in_array($newStatus, $allowedTransitions[$this->status] ?? []);
    }

    public function getStatusBadgeColor(): string
    {
        return match($this->status) {
            'draft' => 'gray',
            'submitted' => 'blue',
            'eligibility_check' => 'yellow',
            'document_verification' => 'orange',
            'field_inspection' => 'purple',
            'final_review' => 'indigo',
            'approved' => 'green',
            'rejected' => 'red',
            'info_requested' => 'amber',
            'on_hold' => 'slate',
            'appeal' => 'pink',
            'withdrawn' => 'gray',
            'offer_issued' => 'emerald',
            'beneficiary_assigned' => 'teal',
            'closed' => 'gray',
            default => 'gray'
        };
    }
}
