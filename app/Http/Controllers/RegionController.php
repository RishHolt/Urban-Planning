<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class RegionController extends Controller
{
    /**
     * Get all regions for a city
     */
    public function getRegions(Request $request): JsonResponse
    {
        $cityId = $request->query('cityId', 'caloocan');
        
        // Return some default regions for Caloocan
        $regions = [
            [
                'id' => 'north-caloocan',
                'name' => 'North Caloocan',
                'latitude' => 14.7597,
                'longitude' => 121.0408,
                'zoom_level' => 12,
                'cityId' => $cityId
            ],
            [
                'id' => 'south-caloocan',
                'name' => 'South Caloocan',
                'latitude' => 14.6511,
                'longitude' => 120.9900,
                'zoom_level' => 12,
                'cityId' => $cityId
            ],
            [
                'id' => 'city-center',
                'name' => 'City Center',
                'latitude' => 14.7054,
                'longitude' => 121.0154,
                'zoom_level' => 14,
                'cityId' => $cityId
            ]
        ];

        return response()->json($regions);
    }

    /**
     * Create a new region
     */
    public function createRegion(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'zoomLevel' => 'required|integer|between:1,20',
            'cityId' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For now, return a mock response
        $region = [
            'id' => uniqid(),
            'name' => $request->name,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'zoomLevel' => $request->zoomLevel,
            'cityId' => $request->cityId,
            'created_at' => now(),
            'updated_at' => now()
        ];

        return response()->json($region, 201);
    }

    /**
     * Update a region
     */
    public function updateRegion(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'zoomLevel' => 'required|integer|between:1,20'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For now, return success
        return response()->json(['message' => 'Region updated successfully']);
    }

    /**
     * Delete a region
     */
    public function deleteRegion(string $id): JsonResponse
    {
        // For now, return success
        return response()->json(['message' => 'Region deleted successfully']);
    }
}
