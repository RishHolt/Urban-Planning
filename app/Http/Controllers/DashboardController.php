<?php

namespace App\Http\Controllers;

use App\Models\ZoningApplication;
use App\Models\HousingApplication;
use App\Models\OccupancyRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get aggregated dashboard statistics from all modules
     */
    public function getDashboardStats(): JsonResponse
    {
        try {
            $stats = [
                // System Overview
                'total_users' => User::count(),
                'active_modules' => 5,
                
                // Zoning Module
                'zoning' => [
                    'total_applications' => ZoningApplication::count(),
                    'pending_review' => ZoningApplication::whereIn('status', ['submitted', 'initial_review', 'technical_review'])->count(),
                    'approved' => ZoningApplication::where('status', 'approved')->count(),
                    'rejected' => ZoningApplication::where('status', 'rejected')->count(),
                ],
                
                // Housing Module
                'housing' => [
                    'total_applications' => HousingApplication::count(),
                    'pending_review' => HousingApplication::whereIn('status', ['draft', 'submitted', 'eligibility_check', 'document_verification'])->count(),
                    'approved' => HousingApplication::where('status', 'approved')->count(),
                    'rejected' => HousingApplication::where('status', 'rejected')->count(),
                ],
                
                // Occupancy Module
                'occupancy' => [
                    'total_occupancies' => OccupancyRecord::count(),
                    'active_occupancies' => OccupancyRecord::where('status', 'active')->count(),
                    'ended_occupancies' => OccupancyRecord::where('status', 'ended')->count(),
                    'terminated_occupancies' => OccupancyRecord::where('status', 'terminated')->count(),
                ],
                
                // Infrastructure Module (using mock data for now)
                'infrastructure' => [
                    'total_projects' => 45,
                    'active_projects' => 12,
                    'completed_projects' => 18,
                    'delayed_projects' => 3,
                ],
                
                // Building Module (using mock data for now)
                'building' => [
                    'total_reviews' => 18,
                    'under_review' => 6,
                    'approved_reviews' => 10,
                    'high_priority' => 3,
                ],
                
                // System Health
                'system_health' => [
                    'total_applications' => ZoningApplication::count() + HousingApplication::count(),
                    'pending_actions' => ZoningApplication::whereIn('status', ['submitted', 'initial_review', 'technical_review'])->count() + 
                                       HousingApplication::whereIn('status', ['draft', 'submitted', 'eligibility_check', 'document_verification'])->count(),
                    'completed_this_month' => ZoningApplication::where('status', 'approved')
                        ->whereMonth('updated_at', now()->month)
                        ->whereYear('updated_at', now()->year)
                        ->count() + 
                        HousingApplication::where('status', 'approved')
                        ->whereMonth('updated_at', now()->month)
                        ->whereYear('updated_at', now()->year)
                        ->count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading dashboard stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard statistics'
            ], 500);
        }
    }

    /**
     * Get recent activity from all modules
     */
    public function getRecentActivity(): JsonResponse
    {
        try {
            $activities = [];
            
            // Get recent zoning applications
            $zoningApplications = ZoningApplication::latest()
                ->limit(5)
                ->get()
                ->map(function ($app) {
                    return [
                        'id' => $app->id,
                        'module' => 'Zoning Clearance',
                        'action' => 'Application ' . ucfirst(str_replace('_', ' ', $app->status)),
                        'title' => $app->project_name ?? 'Zoning Application #' . $app->id,
                        'status' => $app->status,
                        'actor' => $app->first_name . ' ' . $app->last_name,
                        'created_at' => $app->created_at,
                        'icon' => 'Map',
                        'color' => 'blue'
                    ];
                });
            
            // Get recent housing applications
            $housingApplications = HousingApplication::latest()
                ->limit(5)
                ->get()
                ->map(function ($app) {
                    return [
                        'id' => $app->id,
                        'module' => 'Housing Registry',
                        'action' => 'Application ' . ucfirst(str_replace('_', ' ', $app->status)),
                        'title' => $app->full_name ?? 'Housing Application #' . $app->id,
                        'status' => $app->status,
                        'actor' => $app->full_name,
                        'created_at' => $app->created_at,
                        'icon' => 'Home',
                        'color' => 'green'
                    ];
                });
            
            // Get recent occupancy records
            $occupancyRecords = OccupancyRecord::latest()
                ->limit(5)
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'module' => 'Occupancy Monitoring',
                        'action' => 'Status: ' . ucfirst($record->status),
                        'title' => $record->beneficiary_name ?? 'Occupancy Record #' . $record->id,
                        'status' => $record->status,
                        'actor' => $record->beneficiary_name ?? 'Unknown',
                        'created_at' => $record->created_at,
                        'icon' => 'Building',
                        'color' => 'purple'
                    ];
                });
            
            // Combine and sort all activities
            $allActivities = collect()
                ->merge($zoningApplications)
                ->merge($housingApplications)
                ->merge($occupancyRecords)
                ->sortByDesc('created_at')
                ->take(10)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $allActivities
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading recent activity: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load recent activity'
            ], 500);
        }
    }
}
