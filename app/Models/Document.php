<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'documentable_type',
        'documentable_id',
        'document_type',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'mime_type',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the parent documentable model
     */
    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who uploaded this document
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the full file URL
     */
    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get human readable file size
     */
    public function getHumanFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if document is an image
     */
    public function isImage(): bool
    {
        return in_array($this->file_type, ['jpg', 'jpeg', 'png', 'gif', 'webp']);
    }

    /**
     * Check if document is a PDF
     */
    public function isPdf(): bool
    {
        return $this->file_type === 'pdf';
    }

    /**
     * Get document type display name
     */
    public function getDocumentTypeDisplayAttribute(): string
    {
        return match($this->document_type) {
            'proof_of_ownership' => 'Proof of Ownership',
            'site_development_plan' => 'Site Development Plan',
            'vicinity_map' => 'Vicinity Map',
            'building_plan' => 'Building Plan',
            'environmental_clearance' => 'Environmental Clearance',
            'dpwh_clearance' => 'DPWH Clearance',
            'subdivision_permit' => 'Subdivision Permit',
            'business_permit' => 'Business Permit',
            'fire_safety_clearance' => 'Fire Safety Clearance',
            'signature_file' => 'Signature File',
            'tax_clearance' => 'Tax Clearance',
            default => ucwords(str_replace('_', ' ', $this->document_type))
        };
    }
}
