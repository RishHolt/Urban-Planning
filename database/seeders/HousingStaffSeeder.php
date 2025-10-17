<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class HousingStaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Housing Admin
        User::firstOrCreate(
            ['email' => 'housing.admin@city.gov.ph'],
            [
                'name' => 'Housing Administrator',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'email' => 'housing.admin@city.gov.ph',
                'password' => Hash::make('password'),
                'role' => 'HOUSING_ADMIN',
                'phone' => '+63 917 123 4567',
                'address' => 'City Hall, Housing Division',
                'barangay' => 'City Center',
                'birth_date' => '1980-05-15',
                'gender' => 'Female',
                'status' => 'active',
                'is_verified' => true,
                'citizen_id' => 'HOUSING-ADMIN-001'
            ]
        );

        // Create Housing Officers
        User::firstOrCreate(
            ['email' => 'housing.officer1@city.gov.ph'],
            [
                'name' => 'John Michael Reyes',
                'first_name' => 'John Michael',
                'last_name' => 'Reyes',
                'email' => 'housing.officer1@city.gov.ph',
                'password' => Hash::make('password'),
                'role' => 'HOUSING_OFFICER',
                'phone' => '+63 917 234 5678',
                'address' => 'City Hall, Housing Division',
                'barangay' => 'City Center',
                'birth_date' => '1985-08-22',
                'gender' => 'Male',
                'status' => 'active',
                'is_verified' => true,
                'citizen_id' => 'HOUSING-OFF-001'
            ]
        );

        User::firstOrCreate(
            ['email' => 'housing.officer2@city.gov.ph'],
            [
                'name' => 'Ana Cristina Lopez',
                'first_name' => 'Ana Cristina',
                'last_name' => 'Lopez',
                'email' => 'housing.officer2@city.gov.ph',
                'password' => Hash::make('password'),
                'role' => 'HOUSING_OFFICER',
                'phone' => '+63 917 345 6789',
                'address' => 'City Hall, Housing Division',
                'barangay' => 'City Center',
                'birth_date' => '1988-12-10',
                'gender' => 'Female',
                'status' => 'active',
                'is_verified' => true,
                'citizen_id' => 'HOUSING-OFF-002'
            ]
        );

        // Create Housing Inspectors
        User::firstOrCreate(
            ['email' => 'housing.inspector1@city.gov.ph'],
            [
                'name' => 'Roberto Carlos Garcia',
                'first_name' => 'Roberto Carlos',
                'last_name' => 'Garcia',
                'email' => 'housing.inspector1@city.gov.ph',
                'password' => Hash::make('password'),
                'role' => 'HOUSING_INSPECTOR',
                'phone' => '+63 917 456 7890',
                'address' => 'City Hall, Housing Division',
                'barangay' => 'City Center',
                'birth_date' => '1982-03-18',
                'gender' => 'Male',
                'status' => 'active',
                'is_verified' => true,
                'citizen_id' => 'HOUSING-INS-001'
            ]
        );

        User::firstOrCreate(
            ['email' => 'housing.inspector2@city.gov.ph'],
            [
                'name' => 'Carmen Elena Torres',
                'first_name' => 'Carmen Elena',
                'last_name' => 'Torres',
                'email' => 'housing.inspector2@city.gov.ph',
                'password' => Hash::make('password'),
                'role' => 'HOUSING_INSPECTOR',
                'phone' => '+63 917 567 8901',
                'address' => 'City Hall, Housing Division',
                'barangay' => 'City Center',
                'birth_date' => '1987-07-25',
                'gender' => 'Female',
                'status' => 'active',
                'is_verified' => true,
                'citizen_id' => 'HOUSING-INS-002'
            ]
        );

        // Create Housing Clerks
        User::firstOrCreate(
            ['email' => 'housing.clerk1@city.gov.ph'],
            [
                'name' => 'Miguel Angel Cruz',
                'first_name' => 'Miguel Angel',
                'last_name' => 'Cruz',
                'email' => 'housing.clerk1@city.gov.ph',
                'password' => Hash::make('password'),
                'role' => 'HOUSING_CLERK',
                'phone' => '+63 917 678 9012',
                'address' => 'City Hall, Housing Division',
                'barangay' => 'City Center',
                'birth_date' => '1990-11-12',
                'gender' => 'Male',
                'status' => 'active',
                'is_verified' => true,
                'citizen_id' => 'HOUSING-CLK-001'
            ]
        );

        User::firstOrCreate(
            ['email' => 'housing.clerk2@city.gov.ph'],
            [
                'name' => 'Patricia Rose Mendoza',
                'first_name' => 'Patricia Rose',
                'last_name' => 'Mendoza',
                'email' => 'housing.clerk2@city.gov.ph',
                'password' => Hash::make('password'),
                'role' => 'HOUSING_CLERK',
                'phone' => '+63 917 789 0123',
                'address' => 'City Hall, Housing Division',
                'barangay' => 'City Center',
                'birth_date' => '1992-04-30',
                'gender' => 'Female',
                'status' => 'active',
                'is_verified' => true,
                'citizen_id' => 'HOUSING-CLK-002'
            ]
        );

        $this->command->info('Housing staff users created successfully!');
    }
}