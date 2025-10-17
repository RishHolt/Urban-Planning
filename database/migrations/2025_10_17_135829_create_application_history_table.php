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
        Schema::create('application_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zoning_application_id')->constrained()->onDelete('cascade');
            $table->string('action'); // status_changed, document_verified, document_rejected, forwarded, returned, payment_confirmed, view_opened, etc.
            $table->string('old_value')->nullable();
            $table->string('new_value')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('zoning_application_id');
            $table->index('action');
            $table->index('performed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_history');
    }
};
