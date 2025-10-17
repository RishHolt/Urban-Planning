<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousingAction extends Model
{
    protected $fillable = [
        'application_id',
        'actor_id',
        'action',
        'old_status',
        'new_status',
        'reason',
        'note',
        'ip_address',
        'user_agent'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(HousingApplication::class, 'application_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function getActionLabel(): string
    {
        return match($this->action) {
            'submitted' => 'Application Submitted',
            'eligibility_checked' => 'Eligibility Checked',
            'document_verified' => 'Document Verified',
            'document_rejected' => 'Document Rejected',
            'inspection_scheduled' => 'Inspection Scheduled',
            'inspection_completed' => 'Inspection Completed',
            'approved' => 'Application Approved',
            'rejected' => 'Application Rejected',
            'info_requested' => 'Additional Info Requested',
            'on_hold' => 'Application On Hold',
            'appeal' => 'Appeal Filed',
            'withdrawn' => 'Application Withdrawn',
            'offer_issued' => 'Offer Issued',
            'beneficiary_assigned' => 'Beneficiary Assigned',
            'closed' => 'Application Closed',
            default => ucwords(str_replace('_', ' ', $this->action))
        };
    }
}
