<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Zone;
use App\Models\ZoneType;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get zone types
        $residential = ZoneType::where('name', 'Residential')->first();
        $commercial = ZoneType::where('name', 'Commercial')->first();
        $industrial = ZoneType::where('name', 'Industrial')->first();
        $agricultural = ZoneType::where('name', 'Agricultural')->first();
        $mixedUse = ZoneType::where('name', 'Mixed Use')->first();
        $institutional = ZoneType::where('name', 'Institutional')->first();

        $zones = [
            [
                'name' => 'Residential Zone R-1',
                'area' => 'Residential Area 1',
                'description' => 'Low-density residential zone for single-family homes',
                'color' => '#4CAF50',
                'zone_type_id' => $residential->id,
                'city_id' => 'caloocan',
                'coordinates' => [
                    [14.651, 120.989],
                    [14.652, 120.989],
                    [14.652, 120.991],
                    [14.651, 120.991],
                    [14.651, 120.989]
                ],
                'area_sqm' => 10000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Commercial Zone C-1',
                'area' => 'Commercial District',
                'description' => 'General commercial zone for retail and business',
                'color' => '#2196F3',
                'zone_type_id' => $commercial->id,
                'city_id' => 'caloocan',
                'coordinates' => [
                    [14.652, 120.991],
                    [14.653, 120.991],
                    [14.653, 120.993],
                    [14.652, 120.993],
                    [14.652, 120.991]
                ],
                'area_sqm' => 15000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Industrial Zone I-1',
                'area' => 'Industrial Park',
                'description' => 'Light industrial zone for manufacturing',
                'color' => '#FF9800',
                'zone_type_id' => $industrial->id,
                'city_id' => 'caloocan',
                'coordinates' => [
                    [14.650, 120.987],
                    [14.651, 120.987],
                    [14.651, 120.989],
                    [14.650, 120.989],
                    [14.650, 120.987]
                ],
                'area_sqm' => 25000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Agricultural Zone A-1',
                'area' => 'Agricultural Land',
                'description' => 'Agricultural and farming zone',
                'color' => '#8BC34A',
                'zone_type_id' => $agricultural->id,
                'city_id' => 'caloocan',
                'coordinates' => [
                    [14.653, 120.985],
                    [14.654, 120.985],
                    [14.654, 120.987],
                    [14.653, 120.987],
                    [14.653, 120.985]
                ],
                'area_sqm' => 50000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Mixed Use Zone MU-1',
                'area' => 'Mixed Use District',
                'description' => 'Mixed-use zone allowing residential and commercial',
                'color' => '#9C27B0',
                'zone_type_id' => $mixedUse->id,
                'city_id' => 'caloocan',
                'coordinates' => [
                    [14.654, 120.988],
                    [14.655, 120.988],
                    [14.655, 120.990],
                    [14.654, 120.990],
                    [14.654, 120.988]
                ],
                'area_sqm' => 20000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Institutional Zone I-1',
                'area' => 'Government Center',
                'description' => 'Institutional zone for government buildings',
                'color' => '#607D8B',
                'zone_type_id' => $institutional->id,
                'city_id' => 'caloocan',
                'coordinates' => [
                    [14.651, 120.993],
                    [14.652, 120.993],
                    [14.652, 120.995],
                    [14.651, 120.995],
                    [14.651, 120.993]
                ],
                'area_sqm' => 30000.00,
                'is_active' => true,
            ],
        ];

        foreach ($zones as $zone) {
            Zone::create($zone);
        }
    }
}