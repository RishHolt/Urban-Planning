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
        Schema::create('housing_config', function (Blueprint $table) {
            $table->id();
            $table->string('config_key')->unique();
            $table->text('config_value');
            $table->text('description')->nullable();
            $table->string('data_type')->default('string'); // string, number, boolean, json
            $table->boolean('is_public')->default(false); // Can be viewed by non-admin users
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_config');
    }
};
