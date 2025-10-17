<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousingDocument extends Model
{
    protected $fillable = [
        'application_id',
        'document_type',
        'file_name',
        'file_path',
        'file_hash',
        'mime_type',
        'file_size',
        'verification_status',
        'verified_by',
        'verified_at',
        'rejection_reason'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'file_size' => 'integer'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(HousingApplication::class, 'application_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getDocumentTypeLabel(): string
    {
        return match($this->document_type) {
            'government_id' => 'Government ID',
            'income_proof' => 'Income Proof',
            'residency_proof' => 'Residency Proof',
            'family_composition' => 'Family Composition',
            'affidavit_non_ownership' => 'Affidavit of Non-Ownership',
            'senior_pwd_id' => 'Senior/PWD ID',
            'solo_parent_id' => 'Solo Parent ID',
            'ofw_docs' => 'OFW Documents',
            'land_title' => 'Land Title',
            'eviction_proof' => 'Eviction Proof',
            'barangay_endorsement' => 'Barangay Endorsement',
            'employment_cert' => 'Employment Certificate',
            default => ucwords(str_replace('_', ' ', $this->document_type))
        };
    }

    public function getVerificationStatusColor(): string
    {
        return match($this->verification_status) {
            'pending' => 'yellow',
            'verified' => 'green',
            'rejected' => 'red',
            default => 'gray'
        };
    }
}
