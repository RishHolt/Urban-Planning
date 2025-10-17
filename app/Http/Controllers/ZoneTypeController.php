<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Models\ZoneType;

class ZoneTypeController extends Controller
{
    /**
     * Get all zone types for a city
     */
    public function getZoneTypes(Request $request): JsonResponse
    {
        $cityId = $request->query('cityId', 'caloocan');
        
        $zoneTypes = ZoneType::active()
            ->forCity($cityId)
            ->get()
            ->map(function ($zoneType) {
                return [
                    'id' => $zoneType->id,
                    'name' => $zoneType->name,
                    'color' => $zoneType->color,
                    'description' => $zoneType->description,
                    'cityId' => $zoneType->city_id
                ];
            });

        return response()->json($zoneTypes);
    }

    /**
     * Store a newly created zone type.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|max:7',
            'cityId' => 'required|string|max:255'
        ]);

        $zoneType = ZoneType::create([
            'name' => $request->name,
            'description' => $request->description ?? '',
            'color' => $request->color,
            'city_id' => $request->cityId,
            'is_active' => true
        ]);

        return response()->json([
            'id' => $zoneType->id,
            'name' => $zoneType->name,
            'description' => $zoneType->description,
            'color' => $zoneType->color,
            'cityId' => $zoneType->city_id
        ], 201);
    }

    /**
     * Update the specified zone type.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $zoneType = ZoneType::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'sometimes|required|string|max:7'
        ]);

        $zoneType->update($request->only(['name', 'description', 'color']));

        return response()->json([
            'id' => $zoneType->id,
            'name' => $zoneType->name,
            'description' => $zoneType->description,
            'color' => $zoneType->color,
            'cityId' => $zoneType->city_id
        ]);
    }

    /**
     * Remove the specified zone type.
     */
    public function destroy($id): JsonResponse
    {
        $zoneType = ZoneType::findOrFail($id);
        $zoneType->delete();

        return response()->json(['message' => 'Zone type deleted successfully']);
    }
}
