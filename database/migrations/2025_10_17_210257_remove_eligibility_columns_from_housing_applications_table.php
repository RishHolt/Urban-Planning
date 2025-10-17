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
        Schema::table('housing_applications', function (Blueprint $table) {
            // Remove eligibility-related columns
            $table->dropColumn([
                'score',
                'eligibility_checked_at',
                'eligibility_passed',
                'eligibility_notes'
            ]);
            
            // Remove eligibility_check from status enum
            $table->enum('status', [
                'draft', 'submitted', 'document_verification', 
                'field_inspection', 'final_review', 'approved', 'rejected', 
                'info_requested', 'on_hold', 'appeal', 'withdrawn', 
                'offer_issued', 'beneficiary_assigned', 'closed'
            ])->default('draft')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('housing_applications', function (Blueprint $table) {
            // Add back eligibility columns
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamp('eligibility_checked_at')->nullable();
            $table->boolean('eligibility_passed')->nullable();
            $table->text('eligibility_notes')->nullable();
            
            // Add back eligibility_check to status enum
            $table->enum('status', [
                'draft', 'submitted', 'eligibility_check', 'document_verification', 
                'field_inspection', 'final_review', 'approved', 'rejected', 
                'info_requested', 'on_hold', 'appeal', 'withdrawn', 
                'offer_issued', 'beneficiary_assigned', 'closed'
            ])->default('draft')->change();
        });
    }
};