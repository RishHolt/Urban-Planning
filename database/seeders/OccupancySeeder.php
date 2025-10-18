<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OccupancyRecord;
use App\Models\OccupancyInspection;
use App\Models\OccupancyAction;
use App\Models\HousingApplication;
use App\Models\User;
use Carbon\Carbon;

class OccupancySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users for inspectors and actors
        $users = User::take(3)->get();
        $inspector = $users->first();
        $actor = $users->first();

        // Get some approved housing applications to link
        $approvedApplications = HousingApplication::whereIn('status', ['approved', 'beneficiary_assigned'])->take(5)->get();

        // Create occupancy records
        $occupancies = [
            [
                'beneficiary_name' => 'Maria Santos',
                'contact_number' => '+63 912 345 6789',
                'email' => 'maria.santos@email.com',
                'address' => '123 Main Street, Caloocan City',
                'barangay' => 'Barangay 1',
                'unit_identifier' => 'Unit 101, Building A',
                'program_type' => 'socialized_housing',
                'household_size' => 4,
                'move_in_date' => '2024-01-15',
                'lease_start_date' => '2024-01-15',
                'lease_end_date' => '2025-01-15',
                'status' => 'active',
                'notes' => 'Family with 2 children, very cooperative'
            ],
            [
                'beneficiary_name' => 'Juan Cruz',
                'contact_number' => '+63 912 345 6790',
                'email' => 'juan.cruz@email.com',
                'address' => '456 Oak Avenue, Caloocan City',
                'barangay' => 'Barangay 2',
                'unit_identifier' => 'Unit 102, Building A',
                'program_type' => 'rental_subsidy',
                'household_size' => 3,
                'move_in_date' => '2024-02-01',
                'lease_start_date' => '2024-02-01',
                'lease_end_date' => '2025-02-01',
                'status' => 'active',
                'notes' => 'Single parent with 2 children'
            ],
            [
                'beneficiary_name' => 'Ana Rodriguez',
                'contact_number' => '+63 912 345 6791',
                'email' => 'ana.rodriguez@email.com',
                'address' => '789 Pine Street, Caloocan City',
                'barangay' => 'Barangay 3',
                'unit_identifier' => 'Unit 201, Building B',
                'program_type' => 'relocation',
                'household_size' => 5,
                'move_in_date' => '2024-01-20',
                'move_out_date' => '2024-06-15',
                'lease_start_date' => '2024-01-20',
                'lease_end_date' => '2024-06-15',
                'status' => 'ended',
                'notes' => 'Moved out due to job transfer'
            ],
            [
                'beneficiary_name' => 'Carlos Mendoza',
                'contact_number' => '+63 912 345 6792',
                'email' => 'carlos.mendoza@email.com',
                'address' => '321 Elm Street, Caloocan City',
                'barangay' => 'Barangay 1',
                'unit_identifier' => 'Unit 103, Building A',
                'program_type' => 'socialized_housing',
                'household_size' => 2,
                'move_in_date' => '2024-03-10',
                'lease_start_date' => '2024-03-10',
                'lease_end_date' => '2025-03-10',
                'status' => 'active',
                'notes' => 'Elderly couple, very clean unit'
            ],
            [
                'beneficiary_name' => 'Luz Garcia',
                'contact_number' => '+63 912 345 6793',
                'email' => 'luz.garcia@email.com',
                'address' => '654 Maple Drive, Caloocan City',
                'barangay' => 'Barangay 2',
                'unit_identifier' => 'Unit 202, Building B',
                'program_type' => 'rental_subsidy',
                'household_size' => 6,
                'move_in_date' => '2024-02-15',
                'lease_start_date' => '2024-02-15',
                'lease_end_date' => '2025-02-15',
                'status' => 'terminated',
                'termination_reason' => 'Violation of lease terms - unauthorized subletting',
                'notes' => 'Terminated due to lease violations'
            ],
            [
                'beneficiary_name' => 'Roberto Silva',
                'contact_number' => '+63 912 345 6794',
                'email' => 'roberto.silva@email.com',
                'address' => '987 Cedar Lane, Caloocan City',
                'barangay' => 'Barangay 3',
                'unit_identifier' => 'Unit 104, Building A',
                'program_type' => 'socialized_housing',
                'household_size' => 3,
                'move_in_date' => '2024-04-01',
                'lease_start_date' => '2024-04-01',
                'lease_end_date' => '2025-04-01',
                'status' => 'active',
                'notes' => 'Recently moved in, still settling'
            ],
            [
                'beneficiary_name' => 'Elena Torres',
                'contact_number' => '+63 912 345 6795',
                'email' => 'elena.torres@email.com',
                'address' => '147 Birch Street, Caloocan City',
                'barangay' => 'Barangay 1',
                'unit_identifier' => 'Unit 203, Building B',
                'program_type' => 'relocation',
                'household_size' => 4,
                'move_in_date' => '2024-01-05',
                'move_out_date' => '2024-08-20',
                'lease_start_date' => '2024-01-05',
                'lease_end_date' => '2024-08-20',
                'status' => 'ended',
                'notes' => 'Completed relocation program successfully'
            ],
            [
                'beneficiary_name' => 'Miguel Ramos',
                'contact_number' => '+63 912 345 6796',
                'email' => 'miguel.ramos@email.com',
                'address' => '258 Spruce Avenue, Caloocan City',
                'barangay' => 'Barangay 2',
                'unit_identifier' => 'Unit 105, Building A',
                'program_type' => 'rental_subsidy',
                'household_size' => 2,
                'move_in_date' => '2024-03-25',
                'lease_start_date' => '2024-03-25',
                'lease_end_date' => '2025-03-25',
                'status' => 'active',
                'notes' => 'Young professional couple'
            ]
        ];

        foreach ($occupancies as $index => $occupancyData) {
            // Link some occupancies to approved applications
            if ($index < count($approvedApplications)) {
                $occupancyData['application_id'] = $approvedApplications[$index]->id;
            }

            $occupancy = OccupancyRecord::create($occupancyData);

            // Create actions for each occupancy
            OccupancyAction::create([
                'occupancy_id' => $occupancy->id,
                'actor_id' => $actor?->id ?? 1,
                'action' => 'created',
                'new_status' => $occupancy->status,
                'note' => 'Occupancy record created',
                'created_at' => $occupancy->created_at
            ]);

            if ($occupancy->status === 'active') {
                OccupancyAction::create([
                    'occupancy_id' => $occupancy->id,
                    'actor_id' => $actor?->id ?? 1,
                    'action' => 'move_in',
                    'new_status' => 'active',
                    'note' => 'Move-in recorded',
                    'created_at' => $occupancy->move_in_date
                ]);
            } elseif ($occupancy->status === 'ended') {
                OccupancyAction::create([
                    'occupancy_id' => $occupancy->id,
                    'actor_id' => $actor?->id ?? 1,
                    'action' => 'move_out',
                    'old_status' => 'active',
                    'new_status' => 'ended',
                    'note' => 'Move-out recorded',
                    'created_at' => $occupancy->move_out_date
                ]);
            } elseif ($occupancy->status === 'terminated') {
                OccupancyAction::create([
                    'occupancy_id' => $occupancy->id,
                    'actor_id' => $actor?->id ?? 1,
                    'action' => 'terminated',
                    'old_status' => 'active',
                    'new_status' => 'terminated',
                    'note' => $occupancy->termination_reason,
                    'created_at' => $occupancy->updated_at
                ]);
            }
        }

        // Create inspections
        $inspections = [
            [
                'occupancy_id' => 1,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-02-15',
                'inspection_type' => 'move_in',
                'status' => 'completed',
                'findings' => 'Unit in excellent condition, all appliances working properly',
                'violations' => [],
                'recommendations' => 'Continue maintaining cleanliness standards',
                'next_inspection_date' => '2024-08-15'
            ],
            [
                'occupancy_id' => 1,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-08-15',
                'inspection_type' => 'routine',
                'status' => 'completed',
                'findings' => 'Unit well maintained, minor wear and tear observed',
                'violations' => ['Minor paint chipping on bathroom wall'],
                'recommendations' => 'Touch up paint in bathroom area',
                'next_inspection_date' => '2025-02-15'
            ],
            [
                'occupancy_id' => 2,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-02-20',
                'inspection_type' => 'move_in',
                'status' => 'completed',
                'findings' => 'Unit clean and ready for occupancy',
                'violations' => [],
                'recommendations' => 'Regular maintenance schedule established',
                'next_inspection_date' => '2024-08-20'
            ],
            [
                'occupancy_id' => 3,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-06-10',
                'inspection_type' => 'move_out',
                'status' => 'completed',
                'findings' => 'Unit left in good condition, minor cleaning needed',
                'violations' => ['Kitchen counter needs deep cleaning'],
                'recommendations' => 'Unit ready for next occupant after cleaning',
                'next_inspection_date' => null
            ],
            [
                'occupancy_id' => 4,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-03-20',
                'inspection_type' => 'move_in',
                'status' => 'completed',
                'findings' => 'Unit in pristine condition, elderly couple very neat',
                'violations' => [],
                'recommendations' => 'Model tenant for other occupants',
                'next_inspection_date' => '2024-09-20'
            ],
            [
                'occupancy_id' => 5,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-03-01',
                'inspection_type' => 'complaint',
                'status' => 'completed',
                'findings' => 'Confirmed unauthorized subletting, lease violation',
                'violations' => ['Unauthorized subletting', 'Exceeding maximum occupancy'],
                'recommendations' => 'Immediate termination of lease',
                'next_inspection_date' => null
            ],
            [
                'occupancy_id' => 6,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-05-15',
                'inspection_type' => 'routine',
                'status' => 'scheduled',
                'findings' => null,
                'violations' => null,
                'recommendations' => null,
                'next_inspection_date' => '2024-05-15'
            ],
            [
                'occupancy_id' => 7,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-08-15',
                'inspection_type' => 'move_out',
                'status' => 'completed',
                'findings' => 'Unit left in excellent condition, relocation successful',
                'violations' => [],
                'recommendations' => 'Unit ready for immediate re-occupancy',
                'next_inspection_date' => null
            ],
            [
                'occupancy_id' => 8,
                'inspector_id' => $inspector?->id ?? 1,
                'inspection_date' => '2024-04-10',
                'inspection_type' => 'move_in',
                'status' => 'completed',
                'findings' => 'Unit clean and functional, young couple very responsible',
                'violations' => [],
                'recommendations' => 'Regular check-ins recommended',
                'next_inspection_date' => '2024-10-10'
            ]
        ];

        foreach ($inspections as $inspectionData) {
            $inspection = OccupancyInspection::create($inspectionData);

            // Create action for inspection
            OccupancyAction::create([
                'occupancy_id' => $inspection->occupancy_id,
                'actor_id' => $inspection->inspector_id ?? 1,
                'action' => 'inspection',
                'note' => "Inspection {$inspection->status} - {$inspection->inspection_type}",
                'created_at' => $inspection->created_at
            ]);
        }

        $this->command->info('Occupancy monitoring data seeded successfully!');
        $this->command->info('Created ' . count($occupancies) . ' occupancy records');
        $this->command->info('Created ' . count($inspections) . ' inspections');
    }
}