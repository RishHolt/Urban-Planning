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
        // For SQLite, we need to recreate the table to change the enum
        if (DB::getDriverName() === 'sqlite') {
            // Create new table with updated schema
            Schema::create('zoning_applications_new', function (Blueprint $table) {
                $table->id();
                $table->string('application_number')->unique();
                $table->enum('status', ['pending', 'initial_review', 'technical_review', 'awaiting_approval', 'approved', 'rejected', 'requires_changes'])->default('pending');
                $table->string('first_name');
                $table->string('last_name');
                $table->string('email');
                $table->string('contact_number');
                $table->text('address');
                $table->string('business_name')->nullable();
                $table->string('type_of_applicant');
                $table->string('project_type');
                $table->text('project_description');
                $table->string('project_location');
                $table->decimal('total_lot_area_sqm', 10, 2);
                $table->decimal('total_floor_area_sqm', 10, 2);
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->timestamp('location_confirmed_at')->nullable();
                $table->foreignId('location_confirmed_by')->nullable()->constrained('users')->onDelete('set null');
                $table->string('land_ownership');
                $table->string('name_of_owner')->nullable();
                $table->string('tct_no');
                $table->string('tax_declaration_no');
                $table->string('lot_block_survey_no');
                $table->string('barangay_clearance_id');
                $table->string('or_reference_number')->nullable();
                $table->date('or_date')->nullable();
                $table->enum('payment_status', ['pending', 'confirmed'])->default('pending');
                $table->decimal('application_fee', 10, 2)->default(250.00);
                $table->decimal('base_fee', 10, 2)->default(400.00);
                $table->decimal('processing_fee', 10, 2)->default(0.00);
                $table->decimal('total_fee', 10, 2)->default(0.00);
                $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->onDelete('set null');
                $table->foreignId('technical_staff_id')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('forwarded_to_technical_at')->nullable();
                $table->timestamp('returned_from_technical_at')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->text('additional_notes')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });

            // Copy data from old table to new table, mapping old status values to new ones
            DB::statement('INSERT INTO zoning_applications_new SELECT id, application_number, CASE status WHEN "under_review" THEN "initial_review" ELSE status END as status, first_name, last_name, email, contact_number, address, business_name, type_of_applicant, project_type, project_description, project_location, total_lot_area_sqm, total_floor_area_sqm, latitude, longitude, location_confirmed_at, location_confirmed_by, land_ownership, name_of_owner, tct_no, tax_declaration_no, lot_block_survey_no, barangay_clearance_id, or_reference_number, or_date, payment_status, application_fee, base_fee, processing_fee, total_fee, assigned_staff_id, NULL as technical_staff_id, NULL as forwarded_to_technical_at, NULL as returned_from_technical_at, reviewed_at, additional_notes, created_at, updated_at, deleted_at FROM zoning_applications');

            // Drop old table and rename new table
            Schema::dropIfExists('zoning_applications');
            Schema::rename('zoning_applications_new', 'zoning_applications');
        } else {
            // For MySQL/PostgreSQL, use MODIFY COLUMN
            Schema::table('zoning_applications', function (Blueprint $table) {
                DB::statement("ALTER TABLE zoning_applications MODIFY COLUMN status ENUM('pending', 'initial_review', 'technical_review', 'awaiting_approval', 'approved', 'rejected', 'requires_changes') DEFAULT 'pending'");
                
                // Add technical review staff assignment
                $table->foreignId('technical_staff_id')->nullable()->after('assigned_staff_id')->constrained('users')->onDelete('set null');
                $table->timestamp('forwarded_to_technical_at')->nullable()->after('technical_staff_id');
                $table->timestamp('returned_from_technical_at')->nullable()->after('forwarded_to_technical_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, recreate table with original schema
            Schema::create('zoning_applications_old', function (Blueprint $table) {
                $table->id();
                $table->string('application_number')->unique();
                $table->enum('status', ['pending', 'under_review', 'approved', 'rejected'])->default('pending');
                $table->string('first_name');
                $table->string('last_name');
                $table->string('email');
                $table->string('contact_number');
                $table->text('address');
                $table->string('business_name')->nullable();
                $table->string('type_of_applicant');
                $table->string('project_type');
                $table->text('project_description');
                $table->string('project_location');
                $table->decimal('total_lot_area_sqm', 10, 2);
                $table->decimal('total_floor_area_sqm', 10, 2);
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->timestamp('location_confirmed_at')->nullable();
                $table->foreignId('location_confirmed_by')->nullable()->constrained('users')->onDelete('set null');
                $table->string('land_ownership');
                $table->string('name_of_owner')->nullable();
                $table->string('tct_no');
                $table->string('tax_declaration_no');
                $table->string('lot_block_survey_no');
                $table->string('barangay_clearance_id');
                $table->string('or_reference_number')->nullable();
                $table->date('or_date')->nullable();
                $table->enum('payment_status', ['pending', 'confirmed'])->default('pending');
                $table->decimal('application_fee', 10, 2)->default(250.00);
                $table->decimal('base_fee', 10, 2)->default(400.00);
                $table->decimal('processing_fee', 10, 2)->default(0.00);
                $table->decimal('total_fee', 10, 2)->default(0.00);
                $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('reviewed_at')->nullable();
                $table->text('additional_notes')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });

            // Copy data back (excluding new fields)
            DB::statement('INSERT INTO zoning_applications_old SELECT id, application_number, status, first_name, last_name, email, contact_number, address, business_name, type_of_applicant, project_type, project_description, project_location, total_lot_area_sqm, total_floor_area_sqm, latitude, longitude, location_confirmed_at, location_confirmed_by, land_ownership, name_of_owner, tct_no, tax_declaration_no, lot_block_survey_no, barangay_clearance_id, or_reference_number, or_date, payment_status, application_fee, base_fee, processing_fee, total_fee, assigned_staff_id, reviewed_at, additional_notes, created_at, updated_at, deleted_at FROM zoning_applications');

            // Drop current table and rename old table
            Schema::dropIfExists('zoning_applications');
            Schema::rename('zoning_applications_old', 'zoning_applications');
        } else {
            // For MySQL/PostgreSQL, use MODIFY COLUMN
            Schema::table('zoning_applications', function (Blueprint $table) {
                // Revert status enum to original
                DB::statement("ALTER TABLE zoning_applications MODIFY COLUMN status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending'");
                
                // Remove technical review fields
                $table->dropForeign(['technical_staff_id']);
                $table->dropColumn(['technical_staff_id', 'forwarded_to_technical_at', 'returned_from_technical_at']);
            });
        }
    }
};
