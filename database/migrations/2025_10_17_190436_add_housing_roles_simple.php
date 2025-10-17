<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we'll use a different approach
        // We'll add a check constraint to validate the new roles
        // This is a workaround since SQLite doesn't support MODIFY COLUMN for enums
        
        // First, let's add a temporary column with the new enum values
        Schema::table('users', function (Blueprint $table) {
            $table->string('role_new')->nullable()->after('role');
        });
        
        // Copy existing role values to the new column
        DB::statement('UPDATE users SET role_new = role');
        
        // Drop the old role column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
        
        // Add the new role column with expanded enum values
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'CITIZEN', 
                'IT_ADMIN', 
                'ZONING_ADMIN', 
                'BUILDING_OFFICER', 
                'ZONING_OFFICER',
                'HOUSING_ADMIN',
                'HOUSING_OFFICER', 
                'HOUSING_INSPECTOR',
                'HOUSING_CLERK'
            ])->default('CITIZEN')->after('email');
        });
        
        // Copy values back from the temporary column
        DB::statement('UPDATE users SET role = role_new');
        
        // Drop the temporary column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role_new');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        Schema::table('users', function (Blueprint $table) {
            $table->string('role_old')->nullable()->after('role');
        });
        
        // Copy existing role values to the old column (only valid ones)
        DB::statement("UPDATE users SET role_old = role WHERE role IN ('CITIZEN', 'IT_ADMIN', 'ZONING_ADMIN', 'BUILDING_OFFICER', 'ZONING_OFFICER')");
        
        // Set invalid roles to CITIZEN
        DB::statement("UPDATE users SET role_old = 'CITIZEN' WHERE role NOT IN ('CITIZEN', 'IT_ADMIN', 'ZONING_ADMIN', 'BUILDING_OFFICER', 'ZONING_OFFICER')");
        
        // Drop the current role column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
        
        // Add the original role column
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'CITIZEN', 
                'IT_ADMIN', 
                'ZONING_ADMIN', 
                'BUILDING_OFFICER', 
                'ZONING_OFFICER'
            ])->default('CITIZEN')->after('email');
        });
        
        // Copy values back
        DB::statement('UPDATE users SET role = role_old');
        
        // Drop the temporary column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role_old');
        });
    }
};