<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed users first
        $this->call([
            UserSeeder::class,
            ZoneTypeSeeder::class,
            ZoneSeeder::class,
            ZoningApplicationSeeder::class,
            HousingStaffSeeder::class,
            HousingConfigSeeder::class,
            HousingApplicationSeeder::class,
        ]);
    }
}
