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
        Schema::create('occupancy_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('occupancy_id')->constrained('occupancy_records');
            $table->foreignId('inspector_id')->nullable()->constrained('users');
            $table->date('inspection_date');
            $table->enum('inspection_type', ['routine', 'complaint', 'move_in', 'move_out', 'compliance'])->default('routine');
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->text('findings')->nullable();
            $table->json('violations')->nullable(); // array of violation descriptions
            $table->text('recommendations')->nullable();
            $table->date('next_inspection_date')->nullable();
            $table->json('documents')->nullable(); // array of file paths
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occupancy_inspections');
    }
};