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
        Schema::table('users', function (Blueprint $table) {
            // Add role-based authentication
            $table->enum('role', ['CITIZEN', 'IT_ADMIN', 'ZONING_ADMIN', 'BUILDING_OFFICER', 'ZONING_OFFICER'])
                  ->default('CITIZEN')
                  ->after('email');
            
            // Add user profile information
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('phone')->nullable()->after('last_name');
            $table->text('address')->nullable()->after('phone');
            $table->string('barangay')->nullable()->after('address');
            $table->date('birth_date')->nullable()->after('barangay');
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable()->after('birth_date');
            
            // Add account status
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('gender');
            $table->timestamp('last_login_at')->nullable()->after('status');
            
            // Add citizen-specific fields
            $table->string('citizen_id')->nullable()->unique()->after('last_login_at');
            $table->boolean('is_verified')->default(false)->after('citizen_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'first_name',
                'last_name', 
                'phone',
                'address',
                'barangay',
                'birth_date',
                'gender',
                'status',
                'last_login_at',
                'citizen_id',
                'is_verified'
            ]);
        });
    }
};