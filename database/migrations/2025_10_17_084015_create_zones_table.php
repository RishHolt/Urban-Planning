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
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('area')->nullable();
            $table->text('description')->nullable();
            $table->string('color', 7); // Hex color code
            $table->foreignId('zone_type_id')->constrained('zone_types')->onDelete('cascade');
            $table->string('city_id')->default('caloocan');
            $table->json('coordinates'); // Store polygon coordinates as JSON
            $table->decimal('area_sqm', 15, 2)->nullable(); // Calculated area in square meters
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['city_id', 'is_active']);
            $table->index('zone_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};