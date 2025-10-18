<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class BuildingController extends Controller
{
    /**
     * Get dashboard statistics for building reviews
     */
    public function getDashboardStats(): JsonResponse
    {
        try {
            // Using mock data for now - replace with actual model queries when building review system is implemented
            $stats = [
                'total_reviews' => 18,
                'under_review' => 6,
                'approved_reviews' => 10,
                'rejected_reviews' => 2,
                'high_priority' => 3,
                'medium_priority' => 8,
                'low_priority' => 7,
                'average_review_time' => 12.5, // days
                'recent_reviews' => 4, // last 7 days
                'reviews_this_month' => 8,
                'compliance_rate' => 85.2, // percentage
                'status_breakdown' => [
                    'pending' => 6,
                    'under_review' => 4,
                    'approved' => 10,
                    'rejected' => 2,
                    'on_hold' => 1
                ],
                'priority_breakdown' => [
                    'high' => 3,
                    'medium' => 8,
                    'low' => 7
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading building dashboard stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard statistics'
            ], 500);
        }
    }

    /**
     * Get recent building reviews
     */
    public function getRecentReviews(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 10);
            
            // Mock data for recent reviews - replace with actual model queries
            $reviews = [
                [
                    'id' => 1,
                    'project_name' => 'Office Complex A',
                    'contractor' => 'ABC Construction',
                    'status' => 'under_review',
                    'priority' => 'high',
                    'submitted_at' => now()->subDays(2)->toISOString(),
                    'reviewer' => 'John Smith',
                    'estimated_completion' => now()->addDays(5)->toISOString(),
                ],
                [
                    'id' => 2,
                    'project_name' => 'Residential Tower B',
                    'contractor' => 'XYZ Builders',
                    'status' => 'approved',
                    'priority' => 'medium',
                    'submitted_at' => now()->subDays(5)->toISOString(),
                    'reviewer' => 'Jane Doe',
                    'approved_at' => now()->subDays(1)->toISOString(),
                ],
                [
                    'id' => 3,
                    'project_name' => 'Shopping Mall C',
                    'contractor' => 'DEF Developers',
                    'status' => 'pending',
                    'priority' => 'low',
                    'submitted_at' => now()->subDays(1)->toISOString(),
                    'reviewer' => null,
                    'estimated_completion' => now()->addDays(10)->toISOString(),
                ],
                [
                    'id' => 4,
                    'project_name' => 'Industrial Plant D',
                    'contractor' => 'GHI Industries',
                    'status' => 'rejected',
                    'priority' => 'high',
                    'submitted_at' => now()->subDays(7)->toISOString(),
                    'reviewer' => 'Mike Johnson',
                    'rejected_at' => now()->subDays(3)->toISOString(),
                ],
                [
                    'id' => 5,
                    'project_name' => 'Hospital Extension',
                    'contractor' => 'Medical Builders',
                    'status' => 'under_review',
                    'priority' => 'high',
                    'submitted_at' => now()->subDays(3)->toISOString(),
                    'reviewer' => 'Sarah Wilson',
                    'estimated_completion' => now()->addDays(3)->toISOString(),
                ]
            ];

            // Simulate pagination
            $offset = ($request->get('page', 1) - 1) * $perPage;
            $paginatedReviews = array_slice($reviews, $offset, $perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedReviews,
                    'current_page' => $request->get('page', 1),
                    'per_page' => $perPage,
                    'total' => count($reviews),
                    'last_page' => ceil(count($reviews) / $perPage)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading recent building reviews: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load recent reviews'
            ], 500);
        }
    }
}
