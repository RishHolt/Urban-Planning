<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class InfrastructureController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_projects' => 45,
                'active_projects' => 12,
                'in_bidding' => 5,
                'in_construction' => 8,
                'completed' => 18,
                'cancelled' => 2,
                'total_budget' => 125000000,
                'budget_utilized' => 78000000,
                'delayed_projects' => 3,
                'total_contractors' => 10,
                'budget_utilization_percentage' => 62.4,
                'average_completion_time' => 180,
                'projects_this_month' => 7
            ]
        ]);
    }

    /**
     * Get projects list with filters
     */
    public function index(Request $request): JsonResponse
    {
        $projects = $this->getMockProjects();
        
        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $projects = array_filter($projects, fn($p) => $p['status'] === $request->status);
        }
        
        if ($request->filled('type') && $request->type !== 'all') {
            $projects = array_filter($projects, fn($p) => $p['project_type'] === $request->type);
        }
        
        if ($request->filled('category') && $request->category !== 'all') {
            $projects = array_filter($projects, fn($p) => $p['category'] === $request->category);
        }
        
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $projects = array_filter($projects, fn($p) => 
                strpos(strtolower($p['title']), $search) !== false ||
                strpos(strtolower($p['project_number']), $search) !== false ||
                strpos(strtolower($p['address']), $search) !== false
            );
        }

        // Pagination
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);
        $total = count($projects);
        $offset = ($page - 1) * $perPage;
        $paginatedProjects = array_slice($projects, $offset, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'data' => array_values($paginatedProjects),
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total
            ]
        ]);
    }

    /**
     * Get single project details
     */
    public function show($id): JsonResponse
    {
        $projects = $this->getMockProjects();
        $project = collect($projects)->firstWhere('id', $id);
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Add additional details
        $project['milestones'] = $this->getMockMilestones($id);
        $project['contractor'] = $this->getMockContractor($project['contractor_id'] ?? null);
        $project['actions'] = $this->getMockActions($id);
        $project['public_announcements'] = $this->getMockAnnouncements($id);

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }

    /**
     * Create new project
     */
    public function store(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'project_type' => 'required|in:general,housing_related',
            'category' => 'required|in:road,bridge,water,sewage,electrical,building,other',
            'address' => 'required|string',
            'barangay' => 'required|string',
            'estimated_budget' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'completion_date' => 'required|date|after:start_date',
            'priority' => 'required|in:low,medium,high,critical'
        ]);

        // Generate new project ID
        $newId = 999;
        $project = array_merge($validator, [
            'id' => $newId,
            'project_number' => 'INF-' . str_pad($newId, 4, '0', STR_PAD_LEFT),
            'status' => 'proposal',
            'approved_budget' => null,
            'actual_cost' => 0,
            'progress_percentage' => 0,
            'contractor_id' => null,
            'housing_application_id' => $request->housing_application_id ?? null,
            'latitude' => $request->latitude ?? 14.5995,
            'longitude' => $request->longitude ?? 120.9842,
            'notes' => $request->notes ?? '',
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully',
            'data' => $project
        ]);
    }

    /**
     * Update project
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'project_type' => 'required|in:general,housing_related',
            'category' => 'required|in:road,bridge,water,sewage,electrical,building,other',
            'address' => 'required|string',
            'barangay' => 'required|string',
            'estimated_budget' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'completion_date' => 'required|date|after:start_date',
            'priority' => 'required|in:low,medium,high,critical'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully',
            'data' => array_merge($validator, ['id' => $id, 'updated_at' => now()->toISOString()])
        ]);
    }

    /**
     * Delete project
     */
    public function destroy($id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully'
        ]);
    }

    /**
     * Workflow: Submit for budget approval
     */
    public function submitForBudgetApproval($id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Project submitted for budget approval',
            'data' => ['status' => 'budget_approval']
        ]);
    }

    /**
     * Workflow: Approve budget
     */
    public function approveBudget(Request $request, $id): JsonResponse
    {
        $request->validate([
            'approved_budget' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Budget approved successfully',
            'data' => [
                'status' => 'bidding',
                'approved_budget' => $request->approved_budget
            ]
        ]);
    }

    /**
     * Workflow: Reject budget
     */
    public function rejectBudget(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Budget rejected',
            'data' => ['status' => 'proposal']
        ]);
    }

    /**
     * Workflow: Award contract
     */
    public function awardContract(Request $request, $id): JsonResponse
    {
        $request->validate([
            'contractor_id' => 'required|integer',
            'contract_amount' => 'required|numeric|min:0',
            'award_date' => 'required|date'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contract awarded successfully',
            'data' => [
                'status' => 'construction',
                'contractor_id' => $request->contractor_id,
                'contract_amount' => $request->contract_amount
            ]
        ]);
    }

    /**
     * Workflow: Start construction
     */
    public function startConstruction(Request $request, $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Construction started',
            'data' => ['status' => 'construction']
        ]);
    }

    /**
     * Workflow: Submit for inspection
     */
    public function submitForInspection(Request $request, $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Project submitted for inspection',
            'data' => ['status' => 'inspection']
        ]);
    }

    /**
     * Workflow: Complete inspection
     */
    public function completeInspection(Request $request, $id): JsonResponse
    {
        $request->validate([
            'findings' => 'required|string',
            'passed' => 'required|boolean',
            'recommendations' => 'nullable|string'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inspection completed',
            'data' => ['status' => 'handover']
        ]);
    }

    /**
     * Workflow: Handover
     */
    public function handover(Request $request, $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Project handed over successfully',
            'data' => ['status' => 'completed']
        ]);
    }

    /**
     * Workflow: Cancel project
     */
    public function cancelProject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project cancelled',
            'data' => ['status' => 'cancelled']
        ]);
    }

    /**
     * Get contractors list
     */
    public function getContractors(Request $request): JsonResponse
    {
        $contractors = $this->getMockContractors();
        
        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $contractors = array_filter($contractors, fn($c) => $c['status'] === $request->status);
        }
        
        if ($request->filled('rating') && $request->rating !== 'all') {
            $contractors = array_filter($contractors, fn($c) => $c['rating'] >= $request->rating);
        }

        return response()->json([
            'success' => true,
            'data' => array_values($contractors)
        ]);
    }

    /**
     * Create contractor
     */
    public function storeContractor(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string',
            'business_permit_number' => 'required|string|max:50',
            'tin_number' => 'required|string|max:20',
            'rating' => 'required|integer|min:1|max:5',
            'status' => 'required|in:active,inactive'
        ]);

        $contractor = array_merge($validator, [
            'id' => 999,
            'total_projects_completed' => 0,
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contractor created successfully',
            'data' => $contractor
        ]);
    }

    /**
     * Update contractor
     */
    public function updateContractor(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string',
            'business_permit_number' => 'required|string|max:50',
            'tin_number' => 'required|string|max:20',
            'rating' => 'required|integer|min:1|max:5',
            'status' => 'required|in:active,inactive'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contractor updated successfully',
            'data' => array_merge($validator, ['id' => $id, 'updated_at' => now()->toISOString()])
        ]);
    }

    /**
     * Get inspections
     */
    public function getInspections(Request $request): JsonResponse
    {
        $inspections = $this->getMockInspections();
        
        // Apply filters
        if ($request->has('search')) {
            $search = $request->get('search');
            $inspections = array_filter($inspections, function($inspection) use ($search) {
                return stripos($inspection['inspection_number'], $search) !== false ||
                       stripos($inspection['project_title'], $search) !== false ||
                       stripos($inspection['inspector_name'], $search) !== false;
            });
        }

        if ($request->has('status') && $request->get('status') !== 'all') {
            $status = $request->get('status');
            $inspections = array_filter($inspections, function($inspection) use ($status) {
                return $inspection['status'] === $status;
            });
        }

        if ($request->has('type') && $request->get('type') !== 'all') {
            $type = $request->get('type');
            $inspections = array_filter($inspections, function($inspection) use ($type) {
                return $inspection['inspection_type'] === $type;
            });
        }

        return response()->json([
            'success' => true,
            'data' => [
                'data' => array_values($inspections),
                'total' => count($inspections),
                'per_page' => 15,
                'current_page' => 1,
                'last_page' => 1
            ]
        ]);
    }

    /**
     * Create inspection
     */
    public function storeInspection(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'project_id' => 'required|integer',
            'inspection_type' => 'required|string|in:initial,progress,final,quality,safety,compliance',
            'scheduled_date' => 'required|date',
            'inspector_name' => 'required|string|max:255',
            'notes' => 'nullable|string'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inspection created successfully',
            'data' => array_merge($validator, [
                'id' => rand(1000, 9999),
                'inspection_number' => 'INS-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'status' => 'scheduled',
                'created_at' => now()->toISOString()
            ])
        ]);
    }

    /**
     * Get inspection details
     */
    public function showInspection($id): JsonResponse
    {
        $inspections = $this->getMockInspections();
        $inspection = collect($inspections)->firstWhere('id', (int)$id);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $inspection
        ]);
    }

    /**
     * Update inspection
     */
    public function updateInspection(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'status' => 'required|in:scheduled,in_progress,completed,failed,cancelled',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'passed' => 'nullable|boolean',
            'completed_date' => 'nullable|date'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inspection updated successfully',
            'data' => array_merge($validator, ['id' => $id, 'updated_at' => now()->toISOString()])
        ]);
    }

    /**
     * Delete inspection
     */
    public function destroyInspection($id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Inspection deleted successfully'
        ]);
    }

    /**
     * Export inspections
     */
    public function exportInspections(Request $request): JsonResponse
    {
        $inspections = $this->getMockInspections();
        
        return response()->json([
            'success' => true,
            'message' => 'Inspections exported successfully',
            'data' => $inspections
        ]);
    }

    /**
     * Get project milestones
     */
    public function getMilestones($projectId): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->getMockMilestones($projectId)
        ]);
    }

    /**
     * Create milestone
     */
    public function storeMilestone(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'project_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_date' => 'required|date',
            'budget_allocation' => 'required|numeric|min:0',
            'status' => 'required|in:pending,in_progress,completed,delayed'
        ]);

        $milestone = array_merge($validator, [
            'id' => 999,
            'completion_date' => null,
            'progress_percentage' => 0,
            'actual_cost' => 0,
            'deliverables' => $request->deliverables ?? '',
            'notes' => $request->notes ?? '',
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Milestone created successfully',
            'data' => $milestone
        ]);
    }

    /**
     * Update milestone
     */
    public function updateMilestone(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_date' => 'required|date',
            'completion_date' => 'nullable|date',
            'budget_allocation' => 'required|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'progress_percentage' => 'required|integer|min:0|max:100',
            'status' => 'required|in:pending,in_progress,completed,delayed',
            'deliverables' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Milestone updated successfully',
            'data' => array_merge($validator, ['id' => $id, 'updated_at' => now()->toISOString()])
        ]);
    }

    /**
     * Generate progress report
     */
    public function generateProgressReport($id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'project_id' => $id,
                'report_type' => 'progress',
                'generated_at' => now()->toISOString(),
                'executive_summary' => 'Project is progressing well with 75% completion rate.',
                'status' => 'construction',
                'budget_utilization' => 78.5,
                'timeline_status' => 'on_track',
                'key_issues' => ['Weather delays in week 3', 'Material delivery delayed'],
                'recommendations' => ['Accelerate work in good weather', 'Source alternative suppliers']
            ]
        ]);
    }

    /**
     * Generate technical report
     */
    public function generateTechnicalReport($id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'project_id' => $id,
                'report_type' => 'technical',
                'generated_at' => now()->toISOString(),
                'specifications' => 'Concrete grade M25, Steel grade Fe415',
                'quality_control' => 'All tests passed',
                'inspections' => ['Foundation inspection passed', 'Structural inspection pending'],
                'technical_issues' => ['Minor crack in foundation', 'Steel reinforcement needs adjustment'],
                'recommendations' => ['Repair crack before proceeding', 'Adjust reinforcement as per design']
            ]
        ]);
    }

    /**
     * Export projects
     */
    public function exportProjects(Request $request)
    {
        $projects = $this->getMockProjects();
        
        $filename = 'infrastructure-projects-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($projects) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'Project Number',
                'Title',
                'Type',
                'Category',
                'Status',
                'Budget',
                'Progress %',
                'Contractor',
                'Start Date',
                'Completion Date'
            ]);

            // CSV data
            foreach ($projects as $project) {
                fputcsv($file, [
                    $project['project_number'],
                    $project['title'],
                    $project['project_type'],
                    $project['category'],
                    $project['status'],
                    $project['estimated_budget'],
                    $project['progress_percentage'],
                    $project['contractor']['company_name'] ?? 'N/A',
                    $project['start_date'],
                    $project['completion_date']
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get activity logs
     */
    public function getLogs(Request $request): JsonResponse
    {
        $logs = $this->getMockLogs();
        
        // Apply filters
        if ($request->filled('action') && $request->action !== 'all') {
            $logs = array_filter($logs, fn($l) => $l['action'] === $request->action);
        }
        
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $logs = array_filter($logs, fn($l) => $l['project_id'] == $request->project_id);
        }

        // Pagination
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);
        $total = count($logs);
        $offset = ($page - 1) * $perPage;
        $paginatedLogs = array_slice($logs, $offset, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'data' => array_values($paginatedLogs),
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total
            ]
        ]);
    }

    /**
     * Export logs
     */
    public function exportLogs(Request $request)
    {
        $logs = $this->getMockLogs();
        
        $filename = 'infrastructure-logs-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'ID',
                'Action',
                'Project ID',
                'Project Title',
                'Old Status',
                'New Status',
                'Reason',
                'Note',
                'Actor Name',
                'Actor Email',
                'IP Address',
                'Created At'
            ]);

            // CSV data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log['id'],
                    $log['action'],
                    $log['project_id'],
                    $log['project']['title'] ?? 'N/A',
                    $log['old_status'] ?? 'N/A',
                    $log['new_status'] ?? 'N/A',
                    $log['reason'] ?? 'N/A',
                    $log['note'] ?? 'N/A',
                    $log['actor']['name'] ?? 'System',
                    $log['actor']['email'] ?? 'N/A',
                    $log['ip_address'] ?? 'N/A',
                    $log['created_at']
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // Public API Methods

    /**
     * Get public projects (filtered for citizen portal)
     */
    public function getPublicProjects(Request $request): JsonResponse
    {
        $projects = $this->getMockProjects();
        
        // Filter out sensitive projects
        $publicProjects = array_filter($projects, fn($p) => 
            !in_array($p['status'], ['proposal', 'cancelled'])
        );
        
        // Remove sensitive fields
        $publicProjects = array_map(function($project) {
            return [
                'id' => $project['id'],
                'project_number' => $project['project_number'],
                'title' => $project['title'],
                'description' => $project['description'],
                'project_type' => $project['project_type'],
                'category' => $project['category'],
                'status' => $project['status'],
                'address' => $project['address'],
                'barangay' => $project['barangay'],
                'latitude' => $project['latitude'],
                'longitude' => $project['longitude'],
                'start_date' => $project['start_date'],
                'completion_date' => $project['completion_date'],
                'approved_budget' => $project['approved_budget'],
                'progress_percentage' => $project['progress_percentage'],
                'priority' => $project['priority']
            ];
        }, $publicProjects);

        return response()->json([
            'success' => true,
            'data' => array_values($publicProjects)
        ]);
    }

    /**
     * Get public project details
     */
    public function getPublicProjectDetails($id): JsonResponse
    {
        $projects = $this->getMockProjects();
        $project = collect($projects)->firstWhere('id', $id);
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Return only public-safe fields
        $publicProject = [
            'id' => $project['id'],
            'project_number' => $project['project_number'],
            'title' => $project['title'],
            'description' => $project['description'],
            'project_type' => $project['project_type'],
            'category' => $project['category'],
            'status' => $project['status'],
            'address' => $project['address'],
            'barangay' => $project['barangay'],
            'latitude' => $project['latitude'],
            'longitude' => $project['longitude'],
            'start_date' => $project['start_date'],
            'completion_date' => $project['completion_date'],
            'approved_budget' => $project['approved_budget'],
            'progress_percentage' => $project['progress_percentage'],
            'priority' => $project['priority'],
            'public_announcements' => $this->getMockAnnouncements($id)
        ];

        return response()->json([
            'success' => true,
            'data' => $publicProject
        ]);
    }

    /**
     * Get public stats
     */
    public function getPublicStats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_projects' => 35,
                'in_progress' => 8,
                'completed' => 18,
                'total_budget' => 95000000,
                'projects_this_year' => 12
            ]
        ]);
    }

    /**
     * Get public announcements
     */
    public function getPublicAnnouncements($projectId): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->getMockAnnouncements($projectId)
        ]);
    }

    // Mock Data Methods

    private function getMockProjects(): array
    {
        return [
            [
                'id' => 1,
                'project_number' => 'INF-0001',
                'title' => 'Main Street Road Repaving',
                'description' => 'Complete repaving of Main Street from Barangay A to Barangay B including drainage improvements.',
                'project_type' => 'general',
                'category' => 'road',
                'status' => 'construction',
                'address' => 'Main Street, Barangay A',
                'barangay' => 'Barangay A',
                'latitude' => 14.5995,
                'longitude' => 120.9842,
                'estimated_budget' => 2500000,
                'approved_budget' => 2400000,
                'actual_cost' => 1800000,
                'start_date' => '2024-01-15',
                'completion_date' => '2024-06-15',
                'progress_percentage' => 75,
                'priority' => 'high',
                'contractor_id' => 1,
                'housing_application_id' => null,
                'notes' => 'Weather delays in February',
                'created_at' => '2024-01-01T00:00:00Z',
                'updated_at' => '2024-03-15T10:30:00Z'
            ],
            [
                'id' => 2,
                'project_number' => 'INF-0002',
                'title' => 'Housing Development Water System',
                'description' => 'Installation of water distribution system for new housing development in Barangay C.',
                'project_type' => 'housing_related',
                'category' => 'water',
                'status' => 'bidding',
                'address' => 'Housing Site, Barangay C',
                'barangay' => 'Barangay C',
                'latitude' => 14.6010,
                'longitude' => 120.9860,
                'estimated_budget' => 5000000,
                'approved_budget' => 4800000,
                'actual_cost' => 0,
                'start_date' => '2024-04-01',
                'completion_date' => '2024-08-01',
                'progress_percentage' => 0,
                'priority' => 'critical',
                'contractor_id' => null,
                'housing_application_id' => 123,
                'notes' => 'Linked to housing application #HA-2024-001',
                'created_at' => '2024-02-15T00:00:00Z',
                'updated_at' => '2024-03-10T14:20:00Z'
            ],
            [
                'id' => 3,
                'project_number' => 'INF-0003',
                'title' => 'Bridge Repair - River Crossing',
                'description' => 'Structural repair and reinforcement of the main bridge crossing the city river.',
                'project_type' => 'general',
                'category' => 'bridge',
                'status' => 'completed',
                'address' => 'River Bridge, Barangay D',
                'barangay' => 'Barangay D',
                'latitude' => 14.5950,
                'longitude' => 120.9800,
                'estimated_budget' => 8000000,
                'approved_budget' => 7500000,
                'actual_cost' => 7200000,
                'start_date' => '2023-10-01',
                'completion_date' => '2024-02-28',
                'progress_percentage' => 100,
                'priority' => 'critical',
                'contractor_id' => 2,
                'housing_application_id' => null,
                'notes' => 'Completed ahead of schedule',
                'created_at' => '2023-09-15T00:00:00Z',
                'updated_at' => '2024-02-28T16:45:00Z'
            ],
            [
                'id' => 4,
                'project_number' => 'INF-0004',
                'title' => 'Sewage Treatment Plant Upgrade',
                'description' => 'Upgrade and expansion of the main sewage treatment plant to handle increased capacity.',
                'project_type' => 'general',
                'category' => 'sewage',
                'status' => 'inspection',
                'address' => 'Treatment Plant, Barangay E',
                'barangay' => 'Barangay E',
                'latitude' => 14.5900,
                'longitude' => 120.9750,
                'estimated_budget' => 15000000,
                'approved_budget' => 14500000,
                'actual_cost' => 14200000,
                'start_date' => '2023-12-01',
                'completion_date' => '2024-05-01',
                'progress_percentage' => 95,
                'priority' => 'high',
                'contractor_id' => 3,
                'housing_application_id' => null,
                'notes' => 'Final inspection pending',
                'created_at' => '2023-11-15T00:00:00Z',
                'updated_at' => '2024-03-20T09:15:00Z'
            ],
            [
                'id' => 5,
                'project_number' => 'INF-0005',
                'title' => 'Electrical Grid Expansion',
                'description' => 'Expansion of electrical distribution network to serve new residential areas.',
                'project_type' => 'general',
                'category' => 'electrical',
                'status' => 'budget_approval',
                'address' => 'Multiple locations',
                'barangay' => 'Various',
                'latitude' => 14.6000,
                'longitude' => 120.9850,
                'estimated_budget' => 12000000,
                'approved_budget' => null,
                'actual_cost' => 0,
                'start_date' => '2024-06-01',
                'completion_date' => '2024-12-01',
                'progress_percentage' => 0,
                'priority' => 'medium',
                'contractor_id' => null,
                'housing_application_id' => null,
                'notes' => 'Awaiting budget approval',
                'created_at' => '2024-03-01T00:00:00Z',
                'updated_at' => '2024-03-15T11:00:00Z'
            ]
        ];
    }

    private function getMockContractors(): array
    {
        return [
            [
                'id' => 1,
                'company_name' => 'ABC Construction Corp.',
                'contact_person' => 'John Smith',
                'contact_number' => '+63 912 345 6789',
                'email' => 'john@abcconstruction.com',
                'address' => '123 Construction St., Metro Manila',
                'business_permit_number' => 'BP-2024-001',
                'tin_number' => '123-456-789-000',
                'rating' => 4,
                'total_projects_completed' => 15,
                'status' => 'active',
                'created_at' => '2023-01-15T00:00:00Z',
                'updated_at' => '2024-03-01T10:00:00Z'
            ],
            [
                'id' => 2,
                'company_name' => 'XYZ Engineering Services',
                'contact_person' => 'Maria Garcia',
                'contact_number' => '+63 917 234 5678',
                'email' => 'maria@xyzengineering.com',
                'address' => '456 Engineering Ave., Quezon City',
                'business_permit_number' => 'BP-2024-002',
                'tin_number' => '234-567-890-000',
                'rating' => 5,
                'total_projects_completed' => 28,
                'status' => 'active',
                'created_at' => '2022-06-10T00:00:00Z',
                'updated_at' => '2024-02-15T14:30:00Z'
            ],
            [
                'id' => 3,
                'company_name' => 'Metro Infrastructure Ltd.',
                'contact_person' => 'Robert Johnson',
                'contact_number' => '+63 918 345 6789',
                'email' => 'robert@metroinfra.com',
                'address' => '789 Infrastructure Blvd., Makati',
                'business_permit_number' => 'BP-2024-003',
                'tin_number' => '345-678-901-000',
                'rating' => 3,
                'total_projects_completed' => 8,
                'status' => 'active',
                'created_at' => '2023-03-20T00:00:00Z',
                'updated_at' => '2024-01-30T16:45:00Z'
            ]
        ];
    }

    private function getMockContractor($contractorId): ?array
    {
        if (!$contractorId) return null;
        
        $contractors = $this->getMockContractors();
        return collect($contractors)->firstWhere('id', $contractorId);
    }

    private function getMockInspections(): array
    {
        return [
            [
                'id' => 1,
                'inspection_number' => 'INS-0001',
                'project_id' => 1,
                'project_title' => 'Main Street Road Repaving',
                'inspection_type' => 'initial',
                'status' => 'completed',
                'scheduled_date' => '2024-01-15',
                'completed_date' => '2024-01-15',
                'inspector_name' => 'John Doe',
                'findings' => 'Site preparation completed according to specifications. All safety measures in place.',
                'recommendations' => 'Proceed with construction phase. Monitor weather conditions.',
                'passed' => true,
                'created_at' => '2024-01-10T00:00:00Z'
            ],
            [
                'id' => 2,
                'inspection_number' => 'INS-0002',
                'project_id' => 1,
                'project_title' => 'Main Street Road Repaving',
                'inspection_type' => 'progress',
                'status' => 'completed',
                'scheduled_date' => '2024-02-15',
                'completed_date' => '2024-02-15',
                'inspector_name' => 'Jane Smith',
                'findings' => 'Asphalt laying completed for 60% of the project. Quality meets standards.',
                'recommendations' => 'Continue with remaining sections. Ensure proper compaction.',
                'passed' => true,
                'created_at' => '2024-02-10T00:00:00Z'
            ],
            [
                'id' => 3,
                'inspection_number' => 'INS-0003',
                'project_id' => 2,
                'project_title' => 'City Bridge Renovation',
                'inspection_type' => 'safety',
                'status' => 'in_progress',
                'scheduled_date' => '2024-03-20',
                'completed_date' => null,
                'inspector_name' => 'Mike Wilson',
                'findings' => 'Safety inspection in progress. Checking structural integrity.',
                'recommendations' => null,
                'passed' => null,
                'created_at' => '2024-03-15T00:00:00Z'
            ],
            [
                'id' => 4,
                'inspection_number' => 'INS-0004',
                'project_id' => 3,
                'project_title' => 'Water Treatment Plant Upgrade',
                'inspection_type' => 'final',
                'status' => 'scheduled',
                'scheduled_date' => '2024-04-10',
                'completed_date' => null,
                'inspector_name' => 'Sarah Johnson',
                'findings' => null,
                'recommendations' => null,
                'passed' => null,
                'created_at' => '2024-03-25T00:00:00Z'
            ],
            [
                'id' => 5,
                'inspection_number' => 'INS-0005',
                'project_id' => 4,
                'project_title' => 'Public Park Development',
                'inspection_type' => 'quality',
                'status' => 'failed',
                'scheduled_date' => '2024-02-28',
                'completed_date' => '2024-02-28',
                'inspector_name' => 'David Brown',
                'findings' => 'Landscaping does not meet quality standards. Soil preparation inadequate.',
                'recommendations' => 'Re-prepare soil and redo landscaping. Schedule re-inspection.',
                'passed' => false,
                'created_at' => '2024-02-20T00:00:00Z'
            ],
            [
                'id' => 6,
                'inspection_number' => 'INS-0006',
                'project_id' => 5,
                'project_title' => 'Sewage System Expansion',
                'inspection_type' => 'compliance',
                'status' => 'completed',
                'scheduled_date' => '2024-03-05',
                'completed_date' => '2024-03-05',
                'inspector_name' => 'Lisa Garcia',
                'findings' => 'All environmental compliance requirements met. Proper waste disposal procedures followed.',
                'recommendations' => 'Maintain compliance standards throughout project duration.',
                'passed' => true,
                'created_at' => '2024-02-28T00:00:00Z'
            ]
        ];
    }

    private function getMockMilestones($projectId): array
    {
        $milestones = [
            1 => [
                [
                    'id' => 1,
                    'project_id' => 1,
                    'title' => 'Site Preparation',
                    'description' => 'Clear site and prepare for construction',
                    'target_date' => '2024-01-30',
                    'completion_date' => '2024-01-28',
                    'budget_allocation' => 300000,
                    'actual_cost' => 280000,
                    'progress_percentage' => 100,
                    'status' => 'completed',
                    'deliverables' => 'Site cleared, equipment mobilized',
                    'notes' => 'Completed ahead of schedule',
                    'created_at' => '2024-01-01T00:00:00Z',
                    'updated_at' => '2024-01-28T17:00:00Z'
                ],
                [
                    'id' => 2,
                    'project_id' => 1,
                    'title' => 'Foundation Work',
                    'description' => 'Excavate and pour foundation',
                    'target_date' => '2024-03-15',
                    'completion_date' => null,
                    'budget_allocation' => 800000,
                    'actual_cost' => 600000,
                    'progress_percentage' => 75,
                    'status' => 'in_progress',
                    'deliverables' => 'Foundation excavation, concrete pouring',
                    'notes' => 'Weather delays affecting progress',
                    'created_at' => '2024-01-15T00:00:00Z',
                    'updated_at' => '2024-03-10T14:30:00Z'
                ]
            ],
            2 => [
                [
                    'id' => 3,
                    'project_id' => 2,
                    'title' => 'Design and Planning',
                    'description' => 'Complete engineering design and obtain permits',
                    'target_date' => '2024-03-31',
                    'completion_date' => null,
                    'budget_allocation' => 500000,
                    'actual_cost' => 0,
                    'progress_percentage' => 60,
                    'status' => 'in_progress',
                    'deliverables' => 'Engineering drawings, permit applications',
                    'notes' => 'Design phase in progress',
                    'created_at' => '2024-02-15T00:00:00Z',
                    'updated_at' => '2024-03-15T09:00:00Z'
                ]
            ]
        ];

        return $milestones[$projectId] ?? [];
    }

    private function getMockActions($projectId): array
    {
        return [
            [
                'id' => 1,
                'project_id' => $projectId,
                'action' => 'created',
                'old_status' => null,
                'new_status' => 'proposal',
                'reason' => 'Project created',
                'note' => 'Initial project creation',
                'actor' => [
                    'id' => 1,
                    'name' => 'Admin User',
                    'email' => 'admin@example.com'
                ],
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0...',
                'created_at' => '2024-01-01T10:00:00Z'
            ],
            [
                'id' => 2,
                'project_id' => $projectId,
                'action' => 'status_changed',
                'old_status' => 'proposal',
                'new_status' => 'budget_approval',
                'reason' => 'Submitted for budget approval',
                'note' => 'Project submitted for budget review',
                'actor' => [
                    'id' => 2,
                    'name' => 'Project Manager',
                    'email' => 'pm@example.com'
                ],
                'ip_address' => '192.168.1.2',
                'user_agent' => 'Mozilla/5.0...',
                'created_at' => '2024-01-15T14:30:00Z'
            ]
        ];
    }

    private function getMockAnnouncements($projectId): array
    {
        $announcements = [
            1 => [
                [
                    'id' => 1,
                    'project_id' => 1,
                    'title' => 'Road Closure Notice',
                    'description' => 'Main Street will be closed from Oct 20-25 for road repaving work. Please use alternate routes.',
                    'announcement_type' => 'closure',
                    'published_date' => '2024-03-10T00:00:00Z',
                    'effective_date' => '2024-03-20T00:00:00Z',
                    'end_date' => '2024-03-25T23:59:59Z'
                ],
                [
                    'id' => 2,
                    'project_id' => 1,
                    'title' => 'Progress Update',
                    'description' => 'Road repaving is 75% complete. Expected completion by end of March.',
                    'announcement_type' => 'update',
                    'published_date' => '2024-03-15T00:00:00Z',
                    'effective_date' => '2024-03-15T00:00:00Z'
                ]
            ],
            2 => [
                [
                    'id' => 3,
                    'project_id' => 2,
                    'title' => 'Bidding Process Started',
                    'description' => 'Water system project is now open for bidding. Interested contractors may submit proposals.',
                    'announcement_type' => 'info',
                    'published_date' => '2024-03-01T00:00:00Z',
                    'effective_date' => '2024-03-01T00:00:00Z'
                ]
            ]
        ];

        return $announcements[$projectId] ?? [];
    }

    private function getMockLogs(): array
    {
        return [
            [
                'id' => 1,
                'project_id' => 1,
                'action' => 'created',
                'old_status' => null,
                'new_status' => 'proposal',
                'reason' => 'Project created',
                'note' => 'Initial project creation',
                'actor' => [
                    'id' => 1,
                    'name' => 'Admin User',
                    'email' => 'admin@example.com'
                ],
                'project' => [
                    'id' => 1,
                    'title' => 'Main Street Road Repaving'
                ],
                'ip_address' => '192.168.1.1',
                'created_at' => '2024-01-01T10:00:00Z'
            ],
            [
                'id' => 2,
                'project_id' => 1,
                'action' => 'status_changed',
                'old_status' => 'proposal',
                'new_status' => 'budget_approval',
                'reason' => 'Submitted for budget approval',
                'note' => 'Project submitted for budget review',
                'actor' => [
                    'id' => 2,
                    'name' => 'Project Manager',
                    'email' => 'pm@example.com'
                ],
                'project' => [
                    'id' => 1,
                    'title' => 'Main Street Road Repaving'
                ],
                'ip_address' => '192.168.1.2',
                'created_at' => '2024-01-15T14:30:00Z'
            ]
        ];
    }
}
