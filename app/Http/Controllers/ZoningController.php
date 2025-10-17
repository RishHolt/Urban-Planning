<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Zone;
use App\Models\ZoneType;

class ZoningController extends Controller
{
    /**
     * Get all zones for a city
     */
    public function getZones(Request $request): JsonResponse
    {
        $cityId = $request->query('cityId', 'caloocan');
        
        $zones = Zone::with('zoneType')
            ->active()
            ->forCity($cityId)
            ->get()
            ->map(function ($zone) {
                // Convert coordinates array to GeoJSON format
                $coordinates = $zone->coordinates;
                if (is_array($coordinates) && count($coordinates) > 0 && isset($coordinates[0])) {
                    // Ensure the polygon is closed (first and last coordinates are the same)
                    if ($coordinates[0] !== end($coordinates)) {
                        $coordinates[] = $coordinates[0];
                    }
                    
                    // Ensure coordinates are numbers, not strings
                    $coordinates = array_map(function($coord) {
                        return [
                            (float) $coord[0],
                            (float) $coord[1]
                        ];
                    }, $coordinates);
                    
                    $geoJson = [
                        'type' => 'Feature',
                        'geometry' => [
                            'type' => 'Polygon',
                            'coordinates' => [$coordinates]
                        ],
                        'properties' => [
                            'name' => $zone->name,
                            'area' => $zone->area,
                            'description' => $zone->description
                        ]
                    ];
                } else {
                    $geoJson = null;
                }
                
                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'typeId' => $zone->zoneType->id,
                    'color' => $zone->color,
                    'coordinates' => $geoJson,
                    'area' => $zone->area,
                    'cityId' => $zone->city_id,
                    'description' => $zone->description
                ];
            });
        
        return response()->json($zones);
    }

    /**
     * Store a newly created zone.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'typeId' => 'required|exists:zone_types,id',
            'color' => 'required|string|max:7',
            'coordinates' => 'required|array',
            'area' => 'required|string|max:255',
            'cityId' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000'
        ]);

        // Extract coordinates from GeoJSON format
        $coordinates = $request->coordinates;
        if (isset($coordinates['geometry']['coordinates'][0])) {
            // Extract the polygon coordinates from GeoJSON
            $coordinates = $coordinates['geometry']['coordinates'][0];
        }

        $zone = Zone::create([
            'name' => $request->name,
            'zone_type_id' => $request->typeId,
            'color' => $request->color,
            'coordinates' => $coordinates,
            'area' => $request->area,
            'city_id' => $request->cityId,
            'description' => $request->description ?? '',
            'area_sqm' => 0, // Will be calculated later if needed
            'is_active' => true
        ]);

        return response()->json([
            'id' => $zone->id,
            'name' => $zone->name,
            'typeId' => $zone->zone_type_id,
            'color' => $zone->color,
            'coordinates' => $zone->coordinates,
            'area' => $zone->area,
            'cityId' => $zone->city_id,
            'description' => $zone->description
        ], 201);
    }

    /**
     * Update the specified zone.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $zone = Zone::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'typeId' => 'sometimes|required|exists:zone_types,id',
            'color' => 'sometimes|required|string|max:7',
            'coordinates' => 'sometimes|required|array',
            'area' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000'
        ]);

        $updateData = $request->only(['name', 'color', 'coordinates', 'area', 'description']);
        if ($request->has('typeId')) {
            $updateData['zone_type_id'] = $request->typeId;
        }

        $zone->update($updateData);

        return response()->json([
            'id' => $zone->id,
            'name' => $zone->name,
            'typeId' => $zone->zone_type_id,
            'color' => $zone->color,
            'coordinates' => $zone->coordinates,
            'area' => $zone->area,
            'cityId' => $zone->city_id,
            'description' => $zone->description
        ]);
    }

    /**
     * Remove the specified zone.
     */
    public function destroy($id): JsonResponse
    {
        $zone = Zone::findOrFail($id);
        $zone->delete();

        return response()->json(['message' => 'Zone deleted successfully']);
    }

    /**
     * Clear all zones for a specific city.
     */
    public function clearCityZones($cityId): JsonResponse
    {
        Zone::where('city_id', $cityId)->delete();

        return response()->json(['message' => "All zones for city {$cityId} have been cleared"]);
    }
}
