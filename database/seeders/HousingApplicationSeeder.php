<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HousingApplication;
use App\Models\HouseholdMember;
use App\Models\HousingDocument;
use App\Models\HousingAction;
use App\Models\User;
use Illuminate\Support\Str;

class HousingApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some citizen users for applications
        $citizens = User::where('role', 'CITIZEN')->take(10)->get();
        $housingOfficer = User::where('role', 'HOUSING_OFFICER')->first();
        $housingInspector = User::where('role', 'HOUSING_INSPECTOR')->first();

        if ($citizens->isEmpty()) {
            $this->command->warn('No citizen users found. Please run UserSeeder first.');
            return;
        }

        $applications = [
            [
                'application_number' => 'HA-' . str_pad(1, 6, '0', STR_PAD_LEFT),
                'applicant_id' => $citizens->first()->id,
                'status' => 'submitted',
                'submitted_at' => now()->subDays(5),
                'full_name' => 'Maria Santos Cruz',
                'birthdate' => '1985-03-15',
                'gender' => 'female',
                'civil_status' => 'married',
                'national_id' => '1234567890123',
                'mobile' => '+63 917 123 4567',
                'email' => 'maria.cruz@email.com',
                'preferred_contact' => 'mobile',
                'household_size' => 4,
                'current_address' => '123 Barangay Street, Informal Settlement',
                'latitude' => 14.5995,
                'longitude' => 120.9842,
                'years_at_address' => 8,
                'barangay' => 'Barangay 1',
                'employment_status' => 'unemployed',
                'monthly_income' => 0,
                'income_type' => 'other',
                'other_income_sources' => 'Small sari-sari store, occasional laundry services',
                'total_household_income' => 12000,
                'housing_type' => 'informal',
                'rooms' => 1,
                'floor_area' => 20.5,
                'occupancy_density' => 4.0,
                'program_type' => 'socialized_housing',
                'requested_units' => 1,
                'preferred_project' => 'City Housing Project Phase 1',
                'assigned_staff_id' => $housingOfficer?->id,
                'submission_channel' => 'online',
                'ip_address' => '192.168.1.100'
            ],
            [
                'application_number' => 'HA-' . str_pad(2, 6, '0', STR_PAD_LEFT),
                'applicant_id' => $citizens->skip(1)->first()?->id ?? $citizens->first()->id,
                'status' => 'document_verification',
                'submitted_at' => now()->subDays(12),
                'full_name' => 'Juan Carlos Reyes',
                'birthdate' => '1978-11-22',
                'gender' => 'male',
                'civil_status' => 'married',
                'national_id' => '2345678901234',
                'mobile' => '+63 917 234 5678',
                'email' => 'juan.reyes@email.com',
                'preferred_contact' => 'mobile',
                'household_size' => 5,
                'current_address' => '456 Main Street, Rented House',
                'latitude' => 14.6000,
                'longitude' => 120.9850,
                'years_at_address' => 3,
                'barangay' => 'Barangay 2',
                'employment_status' => 'employed',
                'employer_name' => 'City Construction Company',
                'monthly_income' => 18000,
                'income_type' => 'salary',
                'total_household_income' => 25000,
                'housing_type' => 'rented',
                'rooms' => 2,
                'floor_area' => 45.0,
                'occupancy_density' => 2.5,
                'program_type' => 'rental_subsidy',
                'requested_units' => 1,
                'assigned_staff_id' => $housingOfficer?->id,
                'submission_channel' => 'online',
                'ip_address' => '192.168.1.101'
            ],
            [
                'application_number' => 'HA-' . str_pad(3, 6, '0', STR_PAD_LEFT),
                'applicant_id' => $citizens->skip(2)->first()?->id ?? $citizens->first()->id,
                'status' => 'field_inspection',
                'submitted_at' => now()->subDays(20),
                'full_name' => 'Ana Cristina Lopez',
                'birthdate' => '1990-07-08',
                'gender' => 'female',
                'civil_status' => 'single',
                'national_id' => '3456789012345',
                'mobile' => '+63 917 345 6789',
                'email' => 'ana.lopez@email.com',
                'preferred_contact' => 'email',
                'household_size' => 3,
                'current_address' => '789 Squatter Area, Near River',
                'latitude' => 14.6010,
                'longitude' => 120.9860,
                'years_at_address' => 5,
                'barangay' => 'Barangay 3',
                'employment_status' => 'self_employed',
                'monthly_income' => 8000,
                'income_type' => 'business',
                'other_income_sources' => 'Street food vending',
                'total_household_income' => 15000,
                'housing_type' => 'informal',
                'rooms' => 1,
                'floor_area' => 15.0,
                'occupancy_density' => 3.0,
                'program_type' => 'in_city_relocation',
                'requested_units' => 1,
                'preferred_project' => 'Riverbank Relocation Project',
                'assigned_staff_id' => $housingOfficer?->id,
                'inspector_id' => $housingInspector?->id,
                'submission_channel' => 'online',
                'ip_address' => '192.168.1.102'
            ],
            [
                'application_number' => 'HA-' . str_pad(4, 6, '0', STR_PAD_LEFT),
                'applicant_id' => $citizens->skip(3)->first()?->id ?? $citizens->first()->id,
                'status' => 'approved',
                'submitted_at' => now()->subDays(45),
                'approved_at' => now()->subDays(5),
                'full_name' => 'Roberto Garcia',
                'birthdate' => '1975-12-03',
                'gender' => 'male',
                'civil_status' => 'married',
                'national_id' => '4567890123456',
                'mobile' => '+63 917 456 7890',
                'email' => 'roberto.garcia@email.com',
                'preferred_contact' => 'mobile',
                'household_size' => 6,
                'current_address' => '321 Old District, Dilapidated House',
                'latitude' => 14.6020,
                'longitude' => 120.9870,
                'years_at_address' => 12,
                'barangay' => 'Barangay 4',
                'employment_status' => 'employed',
                'employer_name' => 'City Maintenance Department',
                'monthly_income' => 15000,
                'income_type' => 'salary',
                'total_household_income' => 22000,
                'housing_type' => 'owned',
                'rooms' => 2,
                'floor_area' => 35.0,
                'occupancy_density' => 3.0,
                'program_type' => 'socialized_housing',
                'requested_units' => 1,
                'preferred_project' => 'City Housing Project Phase 2',
                'assigned_staff_id' => $housingOfficer?->id,
                'approval_notes' => 'Application approved. Unit assignment pending.',
                'submission_channel' => 'online',
                'ip_address' => '192.168.1.103'
            ],
            [
                'application_number' => 'HA-' . str_pad(5, 6, '0', STR_PAD_LEFT),
                'applicant_id' => $citizens->skip(4)->first()?->id ?? $citizens->first()->id,
                'status' => 'rejected',
                'submitted_at' => now()->subDays(30),
                'rejected_at' => now()->subDays(25),
                'full_name' => 'Carmen Torres',
                'birthdate' => '1982-09-14',
                'gender' => 'female',
                'civil_status' => 'divorced',
                'national_id' => '5678901234567',
                'mobile' => '+63 917 567 8901',
                'email' => 'carmen.torres@email.com',
                'preferred_contact' => 'mobile',
                'household_size' => 2,
                'current_address' => '654 Middle Class Subdivision',
                'latitude' => 14.6030,
                'longitude' => 120.9880,
                'years_at_address' => 4,
                'barangay' => 'Barangay 5',
                'employment_status' => 'employed',
                'employer_name' => 'Private Company',
                'monthly_income' => 35000,
                'income_type' => 'salary',
                'total_household_income' => 40000,
                'housing_type' => 'owned',
                'rooms' => 3,
                'floor_area' => 80.0,
                'occupancy_density' => 0.67,
                'program_type' => 'rental_subsidy',
                'requested_units' => 1,
                'assigned_staff_id' => $housingOfficer?->id,
                'rejection_reason' => 'Income exceeds program limits. Monthly household income of PHP 40,000 is above the PHP 25,000 maximum for rental subsidy.',
                'submission_channel' => 'online',
                'ip_address' => '192.168.1.104'
            ]
        ];

        foreach ($applications as $appData) {
            $application = HousingApplication::create($appData);

            // Create household members
            $householdMembers = [
                [
                    'name' => $appData['full_name'],
                    'relation' => 'other', // applicant is not in enum, using 'other'
                    'birthdate' => $appData['birthdate'],
                    'id_type' => 'birth_certificate',
                    'id_number' => $appData['national_id']
                ]
            ];

            // Add family members based on household size
            if ($appData['household_size'] > 1) {
                $relations = ['spouse', 'child', 'child', 'parent', 'sibling'];
                for ($i = 1; $i < $appData['household_size']; $i++) {
                    $householdMembers[] = [
                        'name' => 'Family Member ' . $i,
                        'relation' => $relations[$i - 1] ?? 'other',
                        'birthdate' => now()->subYears(rand(5, 50))->format('Y-m-d'),
                        'id_type' => 'birth_certificate',
                        'id_number' => 'FAM' . str_pad($i, 10, '0', STR_PAD_LEFT)
                    ];
                }
            }

            foreach ($householdMembers as $member) {
                HouseholdMember::create([
                    'application_id' => $application->id,
                    ...$member
                ]);
            }

            // Create sample documents
            $documentTypes = ['government_id', 'income_proof', 'residency_proof', 'family_composition', 'affidavit_non_ownership'];
            foreach ($documentTypes as $docType) {
                HousingDocument::create([
                    'application_id' => $application->id,
                    'document_type' => $docType,
                    'file_name' => $docType . '_' . $application->application_number . '.pdf',
                    'file_path' => 'housing_documents/' . $application->id . '/' . $docType . '.pdf',
                    'file_hash' => Str::random(40),
                    'mime_type' => 'application/pdf',
                    'file_size' => rand(100000, 5000000),
                    'verification_status' => $application->status === 'rejected' ? 'rejected' : 'verified',
                    'verified_by' => $housingOfficer?->id,
                    'verified_at' => $application->status === 'rejected' ? null : now()->subDays(rand(1, 10)),
                    'rejection_reason' => $application->status === 'rejected' ? 'Document does not meet requirements' : null
                ]);
            }

            // Create action history
            $actions = [
                [
                    'action' => 'application_created',
                    'old_status' => null,
                    'new_status' => 'draft',
                    'reason' => 'Application created by applicant',
                    'note' => 'Initial application submission'
                ],
                [
                    'action' => 'submitted',
                    'old_status' => 'draft',
                    'new_status' => 'submitted',
                    'reason' => 'Application submitted for review',
                    'note' => 'All required documents uploaded'
                ]
            ];


            if (in_array($application->status, ['document_verification', 'field_inspection', 'final_review', 'approved', 'rejected'])) {
                $actions[] = [
                    'action' => 'document_verified',
                    'old_status' => 'submitted',
                    'new_status' => 'document_verification',
                    'reason' => 'Documents verified',
                    'note' => 'All required documents verified'
                ];
            }

            if (in_array($application->status, ['field_inspection', 'final_review', 'approved', 'rejected'])) {
                $actions[] = [
                    'action' => 'inspection_scheduled',
                    'old_status' => 'document_verification',
                    'new_status' => 'field_inspection',
                    'reason' => 'Field inspection scheduled',
                    'note' => 'Inspector assigned: ' . ($housingInspector?->name ?? 'TBD')
                ];
            }

            if ($application->status === 'approved') {
                $actions[] = [
                    'action' => 'approved',
                    'old_status' => 'final_review',
                    'new_status' => 'approved',
                    'reason' => 'Application approved',
                    'note' => 'All requirements met, application approved'
                ];
            }

            if ($application->status === 'rejected') {
                $actions[] = [
                    'action' => 'rejected',
                    'old_status' => 'submitted',
                    'new_status' => 'rejected',
                    'reason' => 'Application rejected',
                    'note' => $application->rejection_reason
                ];
            }

            foreach ($actions as $actionData) {
                HousingAction::create([
                    'application_id' => $application->id,
                    'actor_id' => $housingOfficer?->id ?? 1,
                    ...$actionData,
                    'ip_address' => '192.168.1.100',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ]);
            }
        }

        $this->command->info('Housing applications seeded successfully!');
    }
}