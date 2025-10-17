<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('housing_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('housing_applications')->onDelete('cascade');
            $table->enum('document_type', [
                'government_id', 'income_proof', 'residency_proof', 'family_composition', 
                'affidavit_non_ownership', 'senior_pwd_id', 'solo_parent_id', 'ofw_docs', 
                'land_title', 'eviction_proof', 'barangay_endorsement', 'employment_cert'
            ]);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_hash');
            $table->string('mime_type');
            $table->bigInteger('file_size');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_documents');
    }
};
