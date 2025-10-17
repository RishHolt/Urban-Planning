<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ZoningController;
use App\Http\Controllers\ZoneTypeController;
use App\Http\Controllers\ZoningApplicationController;
use App\Http\Controllers\HousingApplicationController;

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

// Application routes
Route::get('/zoning/applications', [ZoningApplicationController::class, 'index']);
Route::get('/zoning/applications/{id}', [ZoningApplicationController::class, 'show']);

// Application history routes
Route::get('/zoning/applications/{id}/history', [ZoningApplicationController::class, 'getApplicationHistory']);
Route::get('/application-history', [ZoningApplicationController::class, 'getAllApplicationHistory']);

// Technical review workflow routes
Route::post('/zoning/applications/{id}/start-technical-review', [ZoningApplicationController::class, 'startTechnicalReview']);

// Initial review workflow routes
Route::post('/zoning/applications/{id}/start-initial-review', [ZoningApplicationController::class, 'startInitialReview']);
Route::post('/zoning/applications/{id}/forward-to-technical', [ZoningApplicationController::class, 'forwardToTechnical']);
Route::post('/zoning/applications/{id}/return-to-zoning', [ZoningApplicationController::class, 'returnToZoning']);

// Housing Dashboard routes
Route::get('/housing/dashboard/stats', [HousingApplicationController::class, 'getDashboardStats']);

// Housing Application routes
Route::get('/housing/applications', [HousingApplicationController::class, 'index']);
Route::post('/housing/applications', [HousingApplicationController::class, 'store']);
Route::get('/housing/applications/{id}', [HousingApplicationController::class, 'show']);
Route::post('/housing/applications/{id}/submit', [HousingApplicationController::class, 'submit']);
Route::post('/housing/applications/{id}/check-eligibility', [HousingApplicationController::class, 'checkEligibility']);
Route::post('/housing/applications/{id}/verify-document', [HousingApplicationController::class, 'verifyDocument']);
Route::post('/housing/applications/{id}/request-info', [HousingApplicationController::class, 'requestInfo']);
Route::post('/housing/applications/{id}/schedule-inspection', [HousingApplicationController::class, 'scheduleInspection']);
Route::post('/housing/applications/{id}/upload-inspection', [HousingApplicationController::class, 'uploadInspectionReport']);
Route::post('/housing/applications/{id}/approve', [HousingApplicationController::class, 'approve']);
Route::post('/housing/applications/{id}/reject', [HousingApplicationController::class, 'reject']);
Route::post('/housing/applications/{id}/withdraw', [HousingApplicationController::class, 'withdraw']);
Route::post('/housing/applications/{id}/documents', [HousingApplicationController::class, 'uploadDocument']);
Route::get('/housing/applications/{id}/history', [HousingApplicationController::class, 'getHistory']);

// Housing Config routes
Route::get('/housing/config', [HousingApplicationController::class, 'getConfig']);
Route::post('/housing/config', [HousingApplicationController::class, 'updateConfig']);

// Housing Logs routes
Route::get('/housing/logs', [HousingApplicationController::class, 'getLogs']);
Route::get('/housing/logs/stats', [HousingApplicationController::class, 'getLogStats']);
Route::get('/housing/logs/export', [HousingApplicationController::class, 'exportLogs']);

// Housing Inspections routes
Route::get('/housing/inspections', [HousingApplicationController::class, 'getInspections']);
Route::post('/housing/inspections', [HousingApplicationController::class, 'createInspection']);
Route::put('/housing/inspections/{id}', [HousingApplicationController::class, 'updateInspection']);
