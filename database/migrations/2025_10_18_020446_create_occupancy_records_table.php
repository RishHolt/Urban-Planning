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
        Schema::create('occupancy_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->nullable()->constrained('housing_applications');
            $table->string('beneficiary_name');
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->text('address');
            $table->string('barangay');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('unit_identifier'); // e.g., "Unit 101, Building A"
            $table->enum('program_type', ['socialized_housing', 'rental_subsidy', 'relocation'])->default('socialized_housing');
            $table->integer('household_size');
            $table->date('move_in_date');
            $table->date('move_out_date')->nullable();
            $table->date('lease_start_date');
            $table->date('lease_end_date')->nullable();
            $table->enum('status', ['active', 'ended', 'terminated', 'transferred'])->default('active');
            $table->text('termination_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occupancy_records');
    }
};