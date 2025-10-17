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
        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('housing_applications')->onDelete('cascade');
            $table->string('name');
            $table->enum('relation', [
                'spouse', 'child', 'parent', 'sibling', 'grandparent', 
                'grandchild', 'uncle', 'aunt', 'nephew', 'niece', 
                'cousin', 'in_law', 'other'
            ]);
            $table->date('birthdate');
            $table->enum('id_type', ['birth_certificate', 'passport', 'drivers_license', 'voters_id', 'other'])->nullable();
            $table->string('id_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }
};
