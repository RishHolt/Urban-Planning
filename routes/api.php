<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ZoningController;
use App\Http\Controllers\ZoneTypeController;

// Zone management routes (for ZoningMap component)
Route::get('/zones', [ZoningController::class, 'getZones']);
Route::post('/zones', [ZoningController::class, 'store']);
Route::put('/zones/{id}', [ZoningController::class, 'update']);
Route::delete('/zones/{id}', [ZoningController::class, 'destroy']);
Route::delete('/zones/clear/{cityId}', [ZoningController::class, 'clearCityZones']);

// Zone type management routes (for ZoningMap component)
Route::get('/zone-types', [ZoneTypeController::class, 'getZoneTypes']);
Route::post('/zone-types', [ZoneTypeController::class, 'store']);
Route::put('/zone-types/{id}', [ZoneTypeController::class, 'update']);
Route::delete('/zone-types/{id}', [ZoneTypeController::class, 'destroy']);
