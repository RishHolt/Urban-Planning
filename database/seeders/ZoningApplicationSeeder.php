<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ZoningApplication;
use App\Models\Document;
use App\Models\User;

class ZoningApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample applications
        $applications = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@email.com',
                'contact_number' => '+63 912 345 6789',
                'address' => '123 Main Street, Barangay 1, Caloocan City',
                'business_name' => 'Doe Construction',
                'type_of_applicant' => 'Individual',
                'project_type' => 'Residential',
                'project_description' => 'Construction of a 2-story residential building',
                'project_location' => '123 Main Street, Barangay 1, Caloocan City',
                'total_lot_area_sqm' => 150.00,
                'total_floor_area_sqm' => 120.00,
                'latitude' => 14.6511,
                'longitude' => 120.9900,
                'land_ownership' => 'Owned',
                'name_of_owner' => 'John Doe',
                'tct_no' => 'TCT-123456',
                'tax_declaration_no' => 'TD-123456',
                'lot_block_survey_no' => 'Lot 1, Block 2, Survey No. 123',
                'barangay_clearance_id' => 'BC-2024-001',
                'or_reference_number' => 'OR-2024-001234',
                'or_date' => '2024-01-15',
                'payment_status' => 'confirmed',
                'status' => 'pending',
                'additional_notes' => 'Standard residential construction project',
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@email.com',
                'contact_number' => '+63 917 123 4567',
                'address' => '456 Oak Avenue, Barangay 2, Caloocan City',
                'business_name' => 'Smith Enterprises',
                'type_of_applicant' => 'Corporation',
                'project_type' => 'Commercial',
                'project_description' => 'Construction of a commercial building for retail business',
                'project_location' => '456 Oak Avenue, Barangay 2, Caloocan City',
                'total_lot_area_sqm' => 300.00,
                'total_floor_area_sqm' => 250.00,
                'latitude' => 14.6520,
                'longitude' => 120.9910,
                'land_ownership' => 'Owned',
                'name_of_owner' => 'Smith Enterprises',
                'tct_no' => 'TCT-789012',
                'tax_declaration_no' => 'TD-789012',
                'lot_block_survey_no' => 'Lot 3, Block 1, Survey No. 456',
                'barangay_clearance_id' => 'BC-2024-002',
                'or_reference_number' => 'OR-2024-001235',
                'or_date' => '2024-01-14',
                'payment_status' => 'confirmed',
                'status' => 'under_review',
                'additional_notes' => 'Commercial retail space development',
            ],
            [
                'first_name' => 'Bob',
                'last_name' => 'Johnson',
                'email' => 'bob.johnson@email.com',
                'contact_number' => '+63 918 765 4321',
                'address' => '789 Pine Road, Barangay 3, Caloocan City',
                'business_name' => 'Johnson Industries',
                'type_of_applicant' => 'Corporation',
                'project_type' => 'Industrial',
                'project_description' => 'Construction of an industrial facility for manufacturing',
                'project_location' => '789 Pine Road, Barangay 3, Caloocan City',
                'total_lot_area_sqm' => 500.00,
                'total_floor_area_sqm' => 400.00,
                'latitude' => 14.6530,
                'longitude' => 120.9920,
                'land_ownership' => 'Leased',
                'name_of_owner' => 'ABC Property Corp',
                'tct_no' => 'TCT-345678',
                'tax_declaration_no' => 'TD-345678',
                'lot_block_survey_no' => 'Lot 5, Block 3, Survey No. 789',
                'barangay_clearance_id' => 'BC-2024-003',
                'or_reference_number' => 'OR-2024-001236',
                'or_date' => '2024-01-13',
                'payment_status' => 'pending',
                'status' => 'requires_changes',
                'additional_notes' => 'Industrial manufacturing facility',
            ],
            [
                'first_name' => 'Alice',
                'last_name' => 'Brown',
                'email' => 'alice.brown@email.com',
                'contact_number' => '+63 919 876 5432',
                'address' => '321 Elm Street, Barangay 4, Caloocan City',
                'business_name' => 'Brown Development',
                'type_of_applicant' => 'Individual',
                'project_type' => 'Residential',
                'project_description' => 'Construction of a single-family residential house',
                'project_location' => '321 Elm Street, Barangay 4, Caloocan City',
                'total_lot_area_sqm' => 200.00,
                'total_floor_area_sqm' => 150.00,
                'latitude' => 14.6540,
                'longitude' => 120.9930,
                'land_ownership' => 'Owned',
                'name_of_owner' => 'Alice Brown',
                'tct_no' => 'TCT-901234',
                'tax_declaration_no' => 'TD-901234',
                'lot_block_survey_no' => 'Lot 2, Block 4, Survey No. 012',
                'barangay_clearance_id' => 'BC-2024-004',
                'or_reference_number' => 'OR-2024-001237',
                'or_date' => '2024-01-12',
                'payment_status' => 'confirmed',
                'status' => 'approved',
                'additional_notes' => 'Single-family residential construction',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Wilson',
                'email' => 'michael.wilson@email.com',
                'contact_number' => '+63 920 123 4567',
                'address' => '555 Cedar Lane, Barangay 5, Caloocan City',
                'business_name' => 'Wilson Properties',
                'type_of_applicant' => 'Corporation',
                'project_type' => 'Residential',
                'project_description' => 'Construction of a high-rise residential building',
                'project_location' => '555 Cedar Lane, Barangay 5, Caloocan City',
                'total_lot_area_sqm' => 800.00,
                'total_floor_area_sqm' => 2000.00,
                'latitude' => 14.6550,
                'longitude' => 120.9940,
                'land_ownership' => 'Owned',
                'name_of_owner' => 'Wilson Properties',
                'tct_no' => 'TCT-567890',
                'tax_declaration_no' => 'TD-567890',
                'lot_block_survey_no' => 'Lot 7, Block 5, Survey No. 345',
                'barangay_clearance_id' => 'BC-2024-005',
                'or_reference_number' => 'OR-2024-001238',
                'or_date' => '2024-01-11',
                'payment_status' => 'confirmed',
                'status' => 'rejected',
                'additional_notes' => 'High-rise residential development - rejected due to zoning restrictions',
            ],
        ];

        foreach ($applications as $applicationData) {
            $application = ZoningApplication::create($applicationData);
            
            // Create sample documents for each application
            $documentTypes = [
                'proof_of_ownership',
                'site_development_plan',
                'vicinity_map',
                'building_plan',
                'environmental_clearance',
                'dpwh_clearance',
                'business_permit',
                'fire_safety_clearance',
            ];

            foreach ($documentTypes as $docType) {
                Document::create([
                    'documentable_type' => ZoningApplication::class,
                    'documentable_id' => $application->id,
                    'document_type' => $docType,
                    'file_name' => $docType . '_' . $application->application_number . '.pdf',
                    'file_path' => 'zoning-clearance/' . $docType . '/' . $docType . '_' . $application->application_number . '.pdf',
                    'file_type' => 'pdf',
                    'file_size' => rand(100000, 2000000), // Random file size between 100KB and 2MB
                    'mime_type' => 'application/pdf',
                    'uploaded_by' => null, // No user context in seeder
                ]);
            }
        }
    }
}
