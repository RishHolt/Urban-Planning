<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ZoneType;

class ZoneTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zoneTypes = [
            [
                'name' => 'Residential',
                'description' => 'Residential zones for housing and related uses',
                'color' => '#4CAF50',
                'city_id' => 'caloocan',
                'is_active' => true,
            ],
            [
                'name' => 'Commercial',
                'description' => 'Commercial zones for business and retail',
                'color' => '#2196F3',
                'city_id' => 'caloocan',
                'is_active' => true,
            ],
            [
                'name' => 'Industrial',
                'description' => 'Industrial zones for manufacturing and production',
                'color' => '#FF9800',
                'city_id' => 'caloocan',
                'is_active' => true,
            ],
            [
                'name' => 'Agricultural',
                'description' => 'Agricultural zones for farming and related activities',
                'color' => '#8BC34A',
                'city_id' => 'caloocan',
                'is_active' => true,
            ],
            [
                'name' => 'Mixed Use',
                'description' => 'Mixed-use zones allowing multiple types of development',
                'color' => '#9C27B0',
                'city_id' => 'caloocan',
                'is_active' => true,
            ],
            [
                'name' => 'Institutional',
                'description' => 'Institutional zones for schools, hospitals, and government buildings',
                'color' => '#607D8B',
                'city_id' => 'caloocan',
                'is_active' => true,
            ],
        ];

        foreach ($zoneTypes as $zoneType) {
            ZoneType::create($zoneType);
        }
    }
}