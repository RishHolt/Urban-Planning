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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            
            // Polymorphic relationship - can belong to any model
            $table->morphs('documentable');
            
            // Document information
            $table->string('document_type'); // e.g., 'proof_of_ownership', 'site_plan', 'vicinity_map', etc.
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type'); // e.g., 'pdf', 'jpg', 'png'
            $table->integer('file_size'); // in bytes
            $table->string('mime_type')->nullable();
            
            // Tracking
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index('document_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};

