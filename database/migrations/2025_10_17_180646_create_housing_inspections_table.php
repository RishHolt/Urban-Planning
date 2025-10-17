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
        Schema::create('housing_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('housing_applications')->onDelete('cascade');
            $table->foreignId('inspector_id')->constrained('users');
            $table->timestamp('scheduled_date');
            $table->timestamp('inspection_date')->nullable();
            $table->text('report')->nullable();
            $table->json('photos')->nullable(); // Array of photo paths
            $table->enum('status', ['scheduled', 'completed', 'failed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->json('dwelling_conditions')->nullable(); // Structured data about dwelling
            $table->boolean('occupancy_verified')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_inspections');
    }
};
