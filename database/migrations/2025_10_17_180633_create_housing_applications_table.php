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
        Schema::create('housing_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->foreignId('applicant_id')->constrained('users');
            $table->enum('status', [
                'draft', 'submitted', 'eligibility_check', 'document_verification', 
                'field_inspection', 'final_review', 'approved', 'rejected', 
                'info_requested', 'on_hold', 'appeal', 'withdrawn', 
                'offer_issued', 'beneficiary_assigned', 'closed'
            ])->default('draft');
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('eligibility_checked_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            
            // Personal Information
            $table->string('full_name');
            $table->date('birthdate');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('civil_status', ['single', 'married', 'widowed', 'divorced', 'separated']);
            $table->string('national_id')->nullable();
            $table->string('mobile')->nullable();
            $table->string('email')->nullable();
            $table->enum('preferred_contact', ['mobile', 'email', 'both'])->default('mobile');
            
            // Household
            $table->integer('household_size');
            
            // Address & Location
            $table->text('current_address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('years_at_address');
            $table->string('barangay');
            
            // Socioeconomic
            $table->enum('employment_status', ['employed', 'unemployed', 'self_employed', 'retired', 'student']);
            $table->string('employer_name')->nullable();
            $table->decimal('monthly_income', 10, 2);
            $table->enum('income_type', ['salary', 'business', 'pension', 'other']);
            $table->text('other_income_sources')->nullable();
            $table->decimal('total_household_income', 10, 2);
            
            // Current Housing
            $table->enum('housing_type', ['informal', 'owned', 'rented', 'paying_rent', 'squatting', 'evacuated']);
            $table->integer('rooms')->nullable();
            $table->decimal('floor_area', 8, 2)->nullable();
            $table->decimal('occupancy_density', 5, 2)->nullable();
            
            // Assistance Requested
            $table->enum('program_type', ['rental_subsidy', 'socialized_housing', 'in_city_relocation']);
            $table->integer('requested_units')->default(1);
            $table->string('preferred_project')->nullable();
            
            // Staff Assignment
            $table->foreignId('assigned_staff_id')->nullable()->constrained('users');
            $table->foreignId('inspector_id')->nullable()->constrained('users');
            
            // Eligibility & Decision
            $table->boolean('eligibility_passed')->nullable();
            $table->text('eligibility_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('approval_notes')->nullable();
            $table->text('offer_details')->nullable();
            $table->string('beneficiary_id')->nullable();
            $table->string('housing_unit_id')->nullable();
            
            // Audit
            $table->string('submission_channel')->default('online');
            $table->string('ip_address')->nullable();
            $table->text('device_info')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_applications');
    }
};
