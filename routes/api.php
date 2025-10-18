<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ZoningController;
use App\Http\Controllers\ZoneTypeController;
use App\Http\Controllers\ZoningApplicationController;
use App\Http\Controllers\HousingApplicationController;
use App\Http\Controllers\InfrastructureController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\UserController;

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
Route::post('/housing/applications/{id}/start-review', [HousingApplicationController::class, 'startReview']);
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

// Occupancy Monitoring routes
Route::get('/occupancy/dashboard', [App\Http\Controllers\OccupancyController::class, 'getDashboardStats']);
Route::get('/occupancy/records', [App\Http\Controllers\OccupancyController::class, 'index']);
Route::get('/occupancy/records/{id}', [App\Http\Controllers\OccupancyController::class, 'show']);
Route::post('/occupancy/records', [App\Http\Controllers\OccupancyController::class, 'store']);
Route::put('/occupancy/records/{id}', [App\Http\Controllers\OccupancyController::class, 'update']);
Route::post('/occupancy/records/{id}/move-in', [App\Http\Controllers\OccupancyController::class, 'recordMoveIn']);
Route::post('/occupancy/records/{id}/move-out', [App\Http\Controllers\OccupancyController::class, 'recordMoveOut']);
Route::post('/occupancy/records/{id}/terminate', [App\Http\Controllers\OccupancyController::class, 'terminate']);
Route::delete('/occupancy/records/{id}', [App\Http\Controllers\OccupancyController::class, 'destroy']);
Route::get('/occupancy/inspections', [App\Http\Controllers\OccupancyController::class, 'getInspections']);
Route::post('/occupancy/inspections', [App\Http\Controllers\OccupancyController::class, 'scheduleInspection']);
Route::put('/occupancy/inspections/{id}', [App\Http\Controllers\OccupancyController::class, 'updateInspection']);

// Occupancy logs routes
Route::get('/occupancy/logs', [App\Http\Controllers\OccupancyController::class, 'getLogs']);
Route::get('/occupancy/logs/export', [App\Http\Controllers\OccupancyController::class, 'exportLogs']);

// Infrastructure Project Coordination routes
Route::get('/infrastructure/dashboard', [InfrastructureController::class, 'getDashboardStats']);

// Projects CRUD
Route::get('/infrastructure/projects', [InfrastructureController::class, 'index']);
Route::post('/infrastructure/projects', [InfrastructureController::class, 'store']);
Route::get('/infrastructure/projects/{id}', [InfrastructureController::class, 'show']);
Route::put('/infrastructure/projects/{id}', [InfrastructureController::class, 'update']);
Route::delete('/infrastructure/projects/{id}', [InfrastructureController::class, 'destroy']);

// Workflow transitions
Route::post('/infrastructure/projects/{id}/submit-budget', [InfrastructureController::class, 'submitForBudgetApproval']);
Route::post('/infrastructure/projects/{id}/approve-budget', [InfrastructureController::class, 'approveBudget']);
Route::post('/infrastructure/projects/{id}/reject-budget', [InfrastructureController::class, 'rejectBudget']);
Route::post('/infrastructure/projects/{id}/award-contract', [InfrastructureController::class, 'awardContract']);
Route::post('/infrastructure/projects/{id}/start-construction', [InfrastructureController::class, 'startConstruction']);
Route::post('/infrastructure/projects/{id}/submit-inspection', [InfrastructureController::class, 'submitForInspection']);
Route::post('/infrastructure/projects/{id}/complete-inspection', [InfrastructureController::class, 'completeInspection']);
Route::post('/infrastructure/projects/{id}/handover', [InfrastructureController::class, 'handover']);
Route::post('/infrastructure/projects/{id}/cancel', [InfrastructureController::class, 'cancelProject']);

// Contractors
Route::get('/infrastructure/contractors', [InfrastructureController::class, 'getContractors']);
Route::post('/infrastructure/contractors', [InfrastructureController::class, 'storeContractor']);
Route::put('/infrastructure/contractors/{id}', [InfrastructureController::class, 'updateContractor']);

// Inspections
Route::get('/infrastructure/inspections', [InfrastructureController::class, 'getInspections']);
Route::post('/infrastructure/inspections', [InfrastructureController::class, 'storeInspection']);
Route::get('/infrastructure/inspections/{id}', [InfrastructureController::class, 'showInspection']);
Route::put('/infrastructure/inspections/{id}', [InfrastructureController::class, 'updateInspection']);
Route::delete('/infrastructure/inspections/{id}', [InfrastructureController::class, 'destroyInspection']);
Route::get('/infrastructure/inspections/export', [InfrastructureController::class, 'exportInspections']);

// Milestones
Route::get('/infrastructure/projects/{id}/milestones', [InfrastructureController::class, 'getMilestones']);
Route::post('/infrastructure/milestones', [InfrastructureController::class, 'storeMilestone']);
Route::put('/infrastructure/milestones/{id}', [InfrastructureController::class, 'updateMilestone']);

// Reports & Logs
Route::get('/infrastructure/reports/progress/{id}', [InfrastructureController::class, 'generateProgressReport']);
Route::get('/infrastructure/reports/technical/{id}', [InfrastructureController::class, 'generateTechnicalReport']);
Route::get('/infrastructure/projects/export', [InfrastructureController::class, 'exportProjects']);
Route::get('/infrastructure/logs', [InfrastructureController::class, 'getLogs']);
Route::get('/infrastructure/logs/export', [InfrastructureController::class, 'exportLogs']);

// Public Infrastructure Projects (no auth required)
Route::get('/public/infrastructure/projects', [InfrastructureController::class, 'getPublicProjects']);
Route::get('/public/infrastructure/projects/{id}', [InfrastructureController::class, 'getPublicProjectDetails']);
Route::get('/public/infrastructure/stats', [InfrastructureController::class, 'getPublicStats']);
Route::get('/public/infrastructure/announcements/{projectId}', [InfrastructureController::class, 'getPublicAnnouncements']);

// Main Dashboard routes
Route::get('/dashboard/stats', [DashboardController::class, 'getDashboardStats']);
Route::get('/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity']);

// Zoning Dashboard routes
Route::get('/zoning/dashboard/stats', [ZoningApplicationController::class, 'getDashboardStats']);

// Building Dashboard routes
Route::get('/building/dashboard/stats', [BuildingController::class, 'getDashboardStats']);
Route::get('/building/reviews', [BuildingController::class, 'getRecentReviews']);

// User Management routes
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/stats', [UserController::class, 'stats']);
