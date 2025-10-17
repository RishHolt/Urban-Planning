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
        Schema::create('housing_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('housing_applications')->onDelete('cascade');
            $table->foreignId('actor_id')->constrained('users');
            $table->string('action'); // e.g., 'submitted', 'document_verified', 'approved', etc.
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('reason')->nullable();
            $table->text('note')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_actions');
    }
};
