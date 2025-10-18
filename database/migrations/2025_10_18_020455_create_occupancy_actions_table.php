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
        Schema::create('occupancy_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('occupancy_id')->constrained('occupancy_records');
            $table->foreignId('actor_id')->nullable()->constrained('users');
            $table->enum('action', ['created', 'move_in', 'inspection', 'violation', 'resolved', 'move_out', 'terminated', 'note_added'])->default('created');
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occupancy_actions');
    }
};