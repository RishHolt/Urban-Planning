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
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending')->after('uploaded_by');
            $table->foreignId('reviewed_by')->nullable()->after('verification_status')->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('review_remarks')->nullable()->after('reviewed_at');
            
            // Document category for workflow routing
            $table->enum('document_category', ['initial_review', 'technical_review'])->default('initial_review')->after('document_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['verification_status', 'reviewed_by', 'reviewed_at', 'review_remarks', 'document_category']);
        });
    }
};
