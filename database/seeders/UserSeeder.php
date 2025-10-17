<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin users
        User::firstOrCreate(
            ['email' => 'admin@urbanplanning.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@urbanplanning.com',
                'password' => Hash::make('admin123'),
                'role' => 'IT_ADMIN',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '+63 912 345 6789',
                'address' => 'Caloocan City Hall, Metro Manila',
                'barangay' => 'Barangay 1',
                'birth_date' => '1985-01-15',
                'gender' => 'Male',
                'status' => 'active',
                'citizen_id' => 'ADMIN001',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'zoning@urbanplanning.com'],
            [
                'name' => 'Zoning Admin',
                'email' => 'zoning@urbanplanning.com',
                'password' => Hash::make('zoning123'),
                'role' => 'ZONING_ADMIN',
                'first_name' => 'Zoning',
                'last_name' => 'Admin',
                'phone' => '+63 912 345 6790',
                'address' => 'Zoning Office, Caloocan City',
                'barangay' => 'Barangay 2',
                'birth_date' => '1980-03-20',
                'gender' => 'Female',
                'status' => 'active',
                'citizen_id' => 'ZONING001',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'building@urbanplanning.com'],
            [
                'name' => 'Building Officer',
                'email' => 'building@urbanplanning.com',
                'password' => Hash::make('building123'),
                'role' => 'BUILDING_OFFICER',
                'first_name' => 'Building',
                'last_name' => 'Officer',
                'phone' => '+63 912 345 6791',
                'address' => 'Building Office, Caloocan City',
                'barangay' => 'Barangay 3',
                'birth_date' => '1982-07-10',
                'gender' => 'Male',
                'status' => 'active',
                'citizen_id' => 'BUILDING001',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'housing@urbanplanning.com'],
            [
                'name' => 'Housing Officer',
                'email' => 'housing@urbanplanning.com',
                'password' => Hash::make('housing123'),
                'role' => 'ZONING_OFFICER',
                'first_name' => 'Housing',
                'last_name' => 'Officer',
                'phone' => '+63 912 345 6792',
                'address' => 'Housing Office, Caloocan City',
                'barangay' => 'Barangay 4',
                'birth_date' => '1988-11-25',
                'gender' => 'Female',
                'status' => 'active',
                'citizen_id' => 'HOUSING001',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create citizen user
        User::firstOrCreate(
            ['email' => 'test@citizen.com'],
            [
                'name' => 'Test User',
                'email' => 'test@citizen.com',
                'password' => Hash::make('citizen123'),
                'role' => 'CITIZEN',
                'first_name' => 'Test',
                'last_name' => 'User',
                'phone' => '+63 912 345 6793',
                'address' => '123 Main Street, Caloocan City',
                'barangay' => 'Barangay 5',
                'birth_date' => '1990-05-15',
                'gender' => 'Male',
                'status' => 'active',
                'citizen_id' => 'CITIZEN001',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create additional citizen users
        User::firstOrCreate(
            ['email' => 'maria.santos@email.com'],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@email.com',
                'password' => Hash::make('password123'),
                'role' => 'CITIZEN',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'phone' => '+63 912 345 6794',
                'address' => '456 Oak Avenue, Caloocan City',
                'barangay' => 'Barangay 6',
                'birth_date' => '1985-08-12',
                'gender' => 'Female',
                'status' => 'active',
                'citizen_id' => 'CITIZEN002',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'juan.delacruz@email.com'],
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.delacruz@email.com',
                'password' => Hash::make('password123'),
                'role' => 'CITIZEN',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'phone' => '+63 912 345 6795',
                'address' => '789 Pine Street, Caloocan City',
                'barangay' => 'Barangay 7',
                'birth_date' => '1992-12-03',
                'gender' => 'Male',
                'status' => 'active',
                'citizen_id' => 'CITIZEN003',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}