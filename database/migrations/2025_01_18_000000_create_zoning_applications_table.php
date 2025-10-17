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
        Schema::create('zoning_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected', 'requires_changes'])->default('pending');
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('contact_number');
            $table->text('address');
            $table->string('business_name')->nullable();
            $table->enum('type_of_applicant', ['Individual', 'Corporation', 'Government Entity']);
            
            // Project Details
            $table->string('project_type');
            $table->text('project_description');
            $table->text('project_location');
            $table->decimal('total_lot_area_sqm', 10, 2);
            $table->decimal('total_floor_area_sqm', 10, 2);
            
            // Location Coordinates
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('location_confirmed_at')->nullable();
            $table->foreignId('location_confirmed_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Land Ownership
            $table->enum('land_ownership', ['Owned', 'Leased', 'Others']);
            $table->string('name_of_owner')->nullable();
            $table->string('tct_no');
            $table->string('tax_declaration_no');
            $table->string('lot_block_survey_no');
            $table->string('barangay_clearance_id');
            
            // Payment Information
            $table->string('or_reference_number')->nullable();
            $table->date('or_date')->nullable();
            $table->enum('payment_status', ['pending', 'confirmed'])->default('pending');
            
            // Fees
            $table->decimal('application_fee', 10, 2)->default(250.00);
            $table->decimal('base_fee', 10, 2)->default(400.00);
            $table->decimal('processing_fee', 10, 2);
            $table->decimal('total_fee', 10, 2);
            
            // Staff Assignment
            $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            
            // Additional Notes
            $table->text('additional_notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zoning_applications');
    }
};

