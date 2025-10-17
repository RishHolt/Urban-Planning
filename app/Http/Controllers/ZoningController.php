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
                
                \Log::info('Retrieved zone coordinates:', [
                    'zone_id' => $zone->id,
                    'zone_name' => $zone->name,
                    'coordinates' => $coordinates,
                    'type' => gettype($coordinates),
                    'is_array' => is_array($coordinates),
                    'count' => is_array($coordinates) ? count($coordinates) : 'N/A'
                ]);
                
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
                    'type' => $zone->zoneType->name ?? 'Unknown',
                    'zone_type' => $zone->zoneType,
                    'color' => $zone->color,
                    'coordinates' => $coordinates, // Return raw coordinates array instead of GeoJSON
                    'area' => $zone->area,
                    'cityId' => $zone->city_id,
                    'description' => $zone->description,
                    'regulations' => $zone->regulations ?? []
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

        // Extract coordinates from request
        $coordinates = $request->coordinates;
        
        // Debug: Log the received coordinates
        \Log::info('Received coordinates:', [
            'raw' => $coordinates,
            'type' => gettype($coordinates),
            'is_array' => is_array($coordinates),
            'count' => is_array($coordinates) ? count($coordinates) : 'N/A'
        ]);
        
        // Handle different coordinate formats
        if (isset($coordinates['geometry']['coordinates'][0])) {
            // Check if it's a Point geometry (single coordinate pair)
            if ($coordinates['geometry']['type'] === 'Point') {
                // Convert Point to a small square polygon
                $point = $coordinates['geometry']['coordinates'];
                $lng = $point[0];
                $lat = $point[1];
                $offset = 0.0001; // Small offset to create a tiny square
                $coordinates = [
                    [$lng - $offset, $lat - $offset],
                    [$lng + $offset, $lat - $offset],
                    [$lng + $offset, $lat + $offset],
                    [$lng - $offset, $lat + $offset],
                    [$lng - $offset, $lat - $offset] // Close the polygon
                ];
                \Log::info('Converted Point to Polygon');
            } else {
                // Full GeoJSON Feature format (Polygon)
                $coordinates = $coordinates['geometry']['coordinates'][0];
                \Log::info('Extracted from geometry.coordinates[0]');
            }
        } elseif (isset($coordinates['coordinates'][0])) {
            // Direct Polygon format
            $coordinates = $coordinates['coordinates'][0];
            \Log::info('Extracted from coordinates[0]');
        } elseif (is_array($coordinates) && count($coordinates) > 0 && is_array($coordinates[0])) {
            // Already in coordinate array format
            $coordinates = $coordinates;
            \Log::info('Using coordinates as-is');
        } else {
            // Fallback: try to extract from any nested structure
            $coordinates = $this->extractCoordinatesFromNested($coordinates);
            \Log::info('Extracted using fallback method');
        }
        
        // Validate that we have valid coordinates
        if (!is_array($coordinates) || count($coordinates) < 3) {
            \Log::error('Invalid coordinates after extraction:', [
                'coordinates' => $coordinates,
                'is_array' => is_array($coordinates),
                'count' => is_array($coordinates) ? count($coordinates) : 'N/A'
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid coordinates format. Expected polygon coordinates array.'
            ], 422);
        }

        \Log::info('Final coordinates to store:', [
            'coordinates' => $coordinates,
            'count' => count($coordinates)
        ]);

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

        $updateData = $request->only(['name', 'color', 'area', 'description']);
        if ($request->has('typeId')) {
            $updateData['zone_type_id'] = $request->typeId;
        }

        // Handle coordinates extraction if coordinates are being updated
        if ($request->has('coordinates')) {
            $coordinates = $request->coordinates;
            
            // Debug: Log the received coordinates for update
            \Log::info('Received coordinates for update:', [
                'zone_id' => $id,
                'raw' => $coordinates,
                'type' => gettype($coordinates),
                'is_array' => is_array($coordinates),
                'count' => is_array($coordinates) ? count($coordinates) : 'N/A'
            ]);
            
            // Handle different coordinate formats (same logic as store method)
            if (isset($coordinates['geometry']['coordinates'][0])) {
                // Check if it's a Point geometry (single coordinate pair)
                if ($coordinates['geometry']['type'] === 'Point') {
                    // Convert Point to a small square polygon
                    $point = $coordinates['geometry']['coordinates'];
                    $lng = $point[0];
                    $lat = $point[1];
                    $offset = 0.0001; // Small offset to create a tiny square
                    $coordinates = [
                        [$lng - $offset, $lat - $offset],
                        [$lng + $offset, $lat - $offset],
                        [$lng + $offset, $lat + $offset],
                        [$lng - $offset, $lat + $offset],
                        [$lng - $offset, $lat - $offset] // Close the polygon
                    ];
                    \Log::info('Converted Point to Polygon for update');
                } else {
                    // Full GeoJSON Feature format (Polygon)
                    $coordinates = $coordinates['geometry']['coordinates'][0];
                    \Log::info('Extracted from geometry.coordinates[0] for update');
                }
            } elseif (isset($coordinates['coordinates'][0])) {
                // Direct Polygon format
                $coordinates = $coordinates['coordinates'][0];
                \Log::info('Extracted from coordinates[0] for update');
            } elseif (is_array($coordinates) && count($coordinates) > 0 && is_array($coordinates[0])) {
                // Already in coordinate array format
                $coordinates = $coordinates;
                \Log::info('Using coordinates as-is for update');
            } else {
                // Fallback: try to extract from any nested structure
                $coordinates = $this->extractCoordinatesFromNested($coordinates);
                \Log::info('Extracted using fallback method for update');
            }
            
            // Validate that we have valid coordinates
            if (!is_array($coordinates) || count($coordinates) < 3) {
                \Log::error('Invalid coordinates after extraction for update:', [
                    'zone_id' => $id,
                    'coordinates' => $coordinates,
                    'is_array' => is_array($coordinates),
                    'count' => is_array($coordinates) ? count($coordinates) : 'N/A'
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid coordinates format. Expected polygon coordinates array.'
                ], 422);
            }

            \Log::info('Final coordinates to update:', [
                'zone_id' => $id,
                'coordinates' => $coordinates,
                'count' => count($coordinates)
            ]);

            $updateData['coordinates'] = $coordinates;
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

    /**
     * Extract coordinates from nested array structures
     */
    private function extractCoordinatesFromNested($data)
    {
        if (!is_array($data)) {
            return null;
        }

        // Look for coordinate arrays in common GeoJSON structures
        $paths = [
            ['geometry', 'coordinates', 0],
            ['coordinates', 0],
            ['coordinates'],
            ['geometry', 'coordinates'],
        ];

        foreach ($paths as $path) {
            $current = $data;
            foreach ($path as $key) {
                if (isset($current[$key])) {
                    $current = $current[$key];
                } else {
                    $current = null;
                    break;
                }
            }
            
            if (is_array($current) && count($current) > 0 && is_array($current[0])) {
                return $current;
            }
        }

        return null;
    }
}
