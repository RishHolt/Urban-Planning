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
        Schema::table('zoning_applications', function (Blueprint $table) {
            $table->string('or_reference_number')->nullable()->change();
            $table->date('or_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zoning_applications', function (Blueprint $table) {
            $table->string('or_reference_number')->nullable(false)->change();
            $table->date('or_date')->nullable(false)->change();
        });
    }
};
