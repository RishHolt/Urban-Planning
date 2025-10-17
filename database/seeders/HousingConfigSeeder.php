<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HousingConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configs = [
            // Income Thresholds
            [
                'config_key' => 'max_monthly_income_rental_subsidy',
                'config_value' => '25000',
                'description' => 'Maximum monthly income for rental subsidy program (PHP)',
                'data_type' => 'number',
                'is_public' => true
            ],
            [
                'config_key' => 'max_monthly_income_socialized_housing',
                'config_value' => '20000',
                'description' => 'Maximum monthly income for socialized housing program (PHP)',
                'data_type' => 'number',
                'is_public' => true
            ],
            [
                'config_key' => 'max_monthly_income_relocation',
                'config_value' => '30000',
                'description' => 'Maximum monthly income for in-city relocation program (PHP)',
                'data_type' => 'number',
                'is_public' => true
            ],

            // Household Requirements
            [
                'config_key' => 'min_household_size',
                'config_value' => '2',
                'description' => 'Minimum household size for eligibility',
                'data_type' => 'number',
                'is_public' => true
            ],
            [
                'config_key' => 'max_household_size',
                'config_value' => '8',
                'description' => 'Maximum household size for eligibility',
                'data_type' => 'number',
                'is_public' => true
            ],

            // Residency Requirements
            [
                'config_key' => 'min_residency_years',
                'config_value' => '2',
                'description' => 'Minimum years of residency in the city',
                'data_type' => 'number',
                'is_public' => true
            ],

            // Asset Ceiling
            [
                'config_key' => 'max_asset_value',
                'config_value' => '100000',
                'description' => 'Maximum total asset value (excluding primary residence)',
                'data_type' => 'number',
                'is_public' => true
            ],

            // Scoring Weights
            [
                'config_key' => 'income_weight',
                'config_value' => '0.40',
                'description' => 'Weight for income factor in eligibility scoring (0-1)',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'household_size_weight',
                'config_value' => '0.20',
                'description' => 'Weight for household size factor in eligibility scoring (0-1)',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'vulnerability_weight',
                'config_value' => '0.25',
                'description' => 'Weight for vulnerability factors in eligibility scoring (0-1)',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'residency_weight',
                'config_value' => '0.10',
                'description' => 'Weight for residency duration in eligibility scoring (0-1)',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'housing_condition_weight',
                'config_value' => '0.05',
                'description' => 'Weight for current housing condition in eligibility scoring (0-1)',
                'data_type' => 'number',
                'is_public' => false
            ],

            // Processing Timeouts
            [
                'config_key' => 'info_request_timeout_days',
                'config_value' => '45',
                'description' => 'Days before auto-rejecting applications with info requests',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'eligibility_check_timeout_days',
                'config_value' => '7',
                'description' => 'Days to complete eligibility check',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'document_verification_timeout_days',
                'config_value' => '14',
                'description' => 'Days to complete document verification',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'inspection_timeout_days',
                'config_value' => '21',
                'description' => 'Days to complete field inspection',
                'data_type' => 'number',
                'is_public' => false
            ],

            // Program Limits
            [
                'config_key' => 'max_units_per_application',
                'config_value' => '2',
                'description' => 'Maximum number of units per application',
                'data_type' => 'number',
                'is_public' => true
            ],
            [
                'config_key' => 'annual_application_limit',
                'config_value' => '500',
                'description' => 'Maximum applications processed per year',
                'data_type' => 'number',
                'is_public' => false
            ],

            // Priority Groups
            [
                'config_key' => 'senior_citizen_bonus',
                'config_value' => '10',
                'description' => 'Bonus points for senior citizens (60+)',
                'data_type' => 'number',
                'is_public' => true
            ],
            [
                'config_key' => 'pwd_bonus',
                'config_value' => '15',
                'description' => 'Bonus points for persons with disabilities',
                'data_type' => 'number',
                'is_public' => true
            ],
            [
                'config_key' => 'solo_parent_bonus',
                'config_value' => '10',
                'description' => 'Bonus points for solo parents',
                'data_type' => 'number',
                'is_public' => true
            ],
            [
                'config_key' => 'ofw_bonus',
                'config_value' => '5',
                'description' => 'Bonus points for overseas Filipino workers',
                'data_type' => 'number',
                'is_public' => true
            ],

            // Housing Condition Scoring
            [
                'config_key' => 'informal_settlement_points',
                'config_value' => '20',
                'description' => 'Points for living in informal settlements',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'overcrowded_points',
                'config_value' => '15',
                'description' => 'Points for overcrowded conditions (>4 people per room)',
                'data_type' => 'number',
                'is_public' => false
            ],
            [
                'config_key' => 'unsafe_housing_points',
                'config_value' => '25',
                'description' => 'Points for unsafe housing conditions',
                'data_type' => 'number',
                'is_public' => false
            ],

            // Notification Settings
            [
                'config_key' => 'email_notifications_enabled',
                'config_value' => 'true',
                'description' => 'Enable email notifications for status changes',
                'data_type' => 'boolean',
                'is_public' => false
            ],
            [
                'config_key' => 'sms_notifications_enabled',
                'config_value' => 'true',
                'description' => 'Enable SMS notifications for status changes',
                'data_type' => 'boolean',
                'is_public' => false
            ],

            // Application Requirements
            [
                'config_key' => 'required_documents',
                'config_value' => '["government_id", "income_proof", "residency_proof", "family_composition", "affidavit_non_ownership"]',
                'description' => 'Required documents for all applications (JSON array)',
                'data_type' => 'json',
                'is_public' => true
            ],
            [
                'config_key' => 'optional_documents',
                'config_value' => '["senior_pwd_id", "solo_parent_id", "ofw_docs", "land_title", "eviction_proof", "barangay_endorsement", "employment_cert"]',
                'description' => 'Optional supporting documents (JSON array)',
                'data_type' => 'json',
                'is_public' => true
            ],

            // System Settings
            [
                'config_key' => 'application_number_prefix',
                'config_value' => 'HA',
                'description' => 'Prefix for housing application numbers',
                'data_type' => 'string',
                'is_public' => false
            ],
            [
                'config_key' => 'auto_assign_staff',
                'config_value' => 'true',
                'description' => 'Automatically assign staff to new applications',
                'data_type' => 'boolean',
                'is_public' => false
            ],
            [
                'config_key' => 'require_inspection',
                'config_value' => 'true',
                'description' => 'Require field inspection for all applications',
                'data_type' => 'boolean',
                'is_public' => false
            ]
        ];

        foreach ($configs as $config) {
            DB::table('housing_config')->updateOrInsert(
                ['config_key' => $config['config_key']],
                $config
            );
        }

        $this->command->info('Housing configuration seeded successfully!');
    }
}