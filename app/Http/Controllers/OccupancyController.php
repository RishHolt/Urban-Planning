<?php

namespace App\Http\Controllers;

use App\Models\OccupancyRecord;
use App\Models\OccupancyInspection;
use App\Models\OccupancyAction;
use App\Models\HousingApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OccupancyController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): JsonResponse
    {
        try {
            // Use mock data for now since we don't have actual database records
            $stats = [
                'total_occupancies' => 156,
                'active_occupancies' => 142,
                'ended_occupancies' => 8,
                'terminated_occupancies' => 6,
                'inspections_due_this_month' => 23,
                'recent_moves' => 12,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting occupancy dashboard stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting dashboard statistics'
            ], 500);
        }
    }

    /**
     * Get list of occupancy records with filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Use mock data for now
            $mockRecords = $this->getMockOccupancyRecords();
            
            // Apply filters to mock data
            $filteredRecords = $mockRecords;
            
            if ($request->filled('status') && $request->status !== 'all') {
                $filteredRecords = array_filter($filteredRecords, function($record) use ($request) {
                    return $record['status'] === $request->status;
                });
            }

            if ($request->filled('program_type') && $request->program_type !== 'all') {
                $filteredRecords = array_filter($filteredRecords, function($record) use ($request) {
                    return $record['program_type'] === $request->program_type;
                });
            }

            if ($request->filled('barangay') && $request->barangay !== 'all') {
                $filteredRecords = array_filter($filteredRecords, function($record) use ($request) {
                    return $record['barangay'] === $request->barangay;
                });
            }

            if ($request->filled('search')) {
                $search = strtolower($request->search);
                $filteredRecords = array_filter($filteredRecords, function($record) use ($search) {
                    return stripos($record['beneficiary_name'], $search) !== false ||
                           stripos($record['unit_identifier'], $search) !== false ||
                           stripos($record['address'], $search) !== false;
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $currentPage = $request->get('page', 1);
            $total = count($filteredRecords);
            $offset = ($currentPage - 1) * $perPage;
            $paginatedRecords = array_slice($filteredRecords, $offset, $perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => array_values($paginatedRecords),
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $currentPage,
                    'last_page' => ceil($total / $perPage)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting occupancy records: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting occupancy records'
            ], 500);
        }
    }

    /**
     * Get single occupancy record details
     */
    public function show($id): JsonResponse
    {
        try {
            $occupancy = OccupancyRecord::with([
                'application',
                'inspections.inspector',
                'actions.actor'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $occupancy
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting occupancy record: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Occupancy record not found'
            ], 404);
        }
    }

    /**
     * Create new occupancy record
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Debug: Log the incoming request data
            Log::info('Occupancy store request data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'beneficiary_name' => 'required|string|max:255',
                'contact_number' => 'required|string|max:20',
                'email' => 'nullable|email|max:255',
                'address' => 'required|string',
                'barangay' => 'required|string|max:255',
                'unit_identifier' => 'required|string|max:255',
                'program_type' => 'required|in:socialized_housing,rental_subsidy,relocation',
                'household_size' => 'required|integer|min:1',
                'move_in_date' => 'required|date',
                'lease_start_date' => 'required|date',
                'lease_end_date' => 'nullable|date|after:lease_start_date',
                'notes' => 'nullable|string',
                'application_id' => 'nullable|exists:housing_applications,id'
            ]);

            if ($validator->fails()) {
                // Debug: Log validation errors
                Log::error('Occupancy validation failed:', $validator->errors()->toArray());
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $occupancy = OccupancyRecord::create($request->all());

            // Log action
            OccupancyAction::create([
                'occupancy_id' => $occupancy->id,
                'actor_id' => auth()->id() ?? 1,
                'action' => 'created',
                'new_status' => 'active',
                'note' => 'Occupancy record created'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Occupancy record created successfully',
                'data' => $occupancy->load(['application', 'inspections', 'actions'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating occupancy record: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating occupancy record'
            ], 500);
        }
    }

    /**
     * Update occupancy record
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $occupancy = OccupancyRecord::findOrFail($id);
            $oldStatus = $occupancy->status;

            $validator = Validator::make($request->all(), [
                'beneficiary_name' => 'required|string|max:255',
                'contact_number' => 'required|string|max:20',
                'email' => 'nullable|email|max:255',
                'address' => 'required|string',
                'barangay' => 'required|string|max:255',
                'unit_identifier' => 'required|string|max:255',
                'program_type' => 'required|in:socialized_housing,rental_subsidy,relocation',
                'household_size' => 'required|integer|min:1',
                'move_in_date' => 'required|date',
                'move_out_date' => 'nullable|date|after:move_in_date',
                'lease_start_date' => 'required|date',
                'lease_end_date' => 'nullable|date|after:lease_start_date',
                'status' => 'required|in:active,ended,terminated,transferred',
                'termination_reason' => 'nullable|string',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $occupancy->update($request->all());

            // Log action if status changed
            if ($oldStatus !== $occupancy->status) {
                OccupancyAction::create([
                    'occupancy_id' => $occupancy->id,
                    'actor_id' => auth()->id() ?? 1,
                    'action' => 'note_added',
                    'old_status' => $oldStatus,
                    'new_status' => $occupancy->status,
                    'note' => 'Status updated'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Occupancy record updated successfully',
                'data' => $occupancy->load(['application', 'inspections', 'actions'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating occupancy record: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating occupancy record'
            ], 500);
        }
    }

    /**
     * Record move-in date
     */
    public function recordMoveIn(Request $request, $id): JsonResponse
    {
        try {
            $occupancy = OccupancyRecord::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'move_in_date' => 'required|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $occupancy->update([
                'move_in_date' => $request->move_in_date,
                'status' => 'active'
            ]);

            // Log action
            OccupancyAction::create([
                'occupancy_id' => $occupancy->id,
                'actor_id' => auth()->id() ?? 1,
                'action' => 'move_in',
                'new_status' => 'active',
                'note' => 'Move-in recorded'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Move-in recorded successfully',
                'data' => $occupancy->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Error recording move-in: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error recording move-in'
            ], 500);
        }
    }

    /**
     * Record move-out date
     */
    public function recordMoveOut(Request $request, $id): JsonResponse
    {
        try {
            $occupancy = OccupancyRecord::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'move_out_date' => 'required|date|after:move_in_date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $occupancy->update([
                'move_out_date' => $request->move_out_date,
                'status' => 'ended'
            ]);

            // Log action
            OccupancyAction::create([
                'occupancy_id' => $occupancy->id,
                'actor_id' => auth()->id() ?? 1,
                'action' => 'move_out',
                'old_status' => 'active',
                'new_status' => 'ended',
                'note' => 'Move-out recorded'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Move-out recorded successfully',
                'data' => $occupancy->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Error recording move-out: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error recording move-out'
            ], 500);
        }
    }

    /**
     * Terminate occupancy
     */
    public function terminate(Request $request, $id): JsonResponse
    {
        try {
            $occupancy = OccupancyRecord::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'termination_reason' => 'required|string',
                'move_out_date' => 'required|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $occupancy->update([
                'move_out_date' => $request->move_out_date,
                'status' => 'terminated',
                'termination_reason' => $request->termination_reason
            ]);

            // Log action
            OccupancyAction::create([
                'occupancy_id' => $occupancy->id,
                'actor_id' => auth()->id() ?? 1,
                'action' => 'terminated',
                'old_status' => 'active',
                'new_status' => 'terminated',
                'note' => $request->termination_reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Occupancy terminated successfully',
                'data' => $occupancy->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Error terminating occupancy: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error terminating occupancy'
            ], 500);
        }
    }

    /**
     * Get inspections list
     */
    public function getInspections(Request $request): JsonResponse
    {
        try {
            $query = OccupancyInspection::with(['occupancy', 'inspector']);

            // Apply filters
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('type') && $request->type !== 'all') {
                $query->where('inspection_type', $request->type);
            }

            if ($request->filled('inspector') && $request->inspector !== 'all') {
                $query->where('inspector_id', $request->inspector);
            }

            if ($request->filled('date_from')) {
                $query->where('inspection_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('inspection_date', '<=', $request->date_to);
            }

            $perPage = $request->get('per_page', 15);
            $inspections = $query->orderBy('inspection_date', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $inspections
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting inspections: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting inspections'
            ], 500);
        }
    }

    /**
     * Schedule new inspection
     */
    public function scheduleInspection(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'occupancy_id' => 'required|exists:occupancy_records,id',
                'inspector_id' => 'nullable|exists:users,id',
                'inspection_date' => 'required|date|after_or_equal:today',
                'inspection_type' => 'required|in:routine,complaint,move_in,move_out,compliance',
                'recommendations' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $inspection = OccupancyInspection::create($request->all());

            // Log action
            OccupancyAction::create([
                'occupancy_id' => $inspection->occupancy_id,
                'actor_id' => auth()->id() ?? 1,
                'action' => 'inspection',
                'note' => 'Inspection scheduled for ' . $inspection->inspection_date->format('M d, Y')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inspection scheduled successfully',
                'data' => $inspection->load(['occupancy', 'inspector'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error scheduling inspection: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error scheduling inspection'
            ], 500);
        }
    }

    /**
     * Update inspection (record findings)
     */
    public function updateInspection(Request $request, $id): JsonResponse
    {
        try {
            $inspection = OccupancyInspection::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:scheduled,completed,cancelled',
                'findings' => 'nullable|string',
                'violations' => 'nullable|array',
                'recommendations' => 'nullable|string',
                'next_inspection_date' => 'nullable|date|after:today',
                'documents' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $inspection->update($request->all());

            // Log action
            OccupancyAction::create([
                'occupancy_id' => $inspection->occupancy_id,
                'actor_id' => auth()->id() ?? 1,
                'action' => 'inspection',
                'note' => 'Inspection ' . $inspection->status . ' - ' . $inspection->inspection_type
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inspection updated successfully',
                'data' => $inspection->load(['occupancy', 'inspector'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating inspection: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating inspection'
            ], 500);
        }
    }

    /**
     * Link approved application to occupancy
     */
    public function linkApplication($occupancyId, $applicationId): JsonResponse
    {
        try {
            $occupancy = OccupancyRecord::findOrFail($occupancyId);
            $application = HousingApplication::findOrFail($applicationId);

            if ($application->status !== 'approved' && $application->status !== 'beneficiary_assigned') {
                return response()->json([
                    'success' => false,
                    'message' => 'Application must be approved to link to occupancy'
                ], 400);
            }

            $occupancy->update(['application_id' => $applicationId]);

            // Update application with unit identifier
            $application->update(['housing_unit_id' => $occupancy->unit_identifier]);

            // Log action
            OccupancyAction::create([
                'occupancy_id' => $occupancy->id,
                'actor_id' => auth()->id() ?? 1,
                'action' => 'note_added',
                'note' => 'Linked to housing application: ' . $application->application_number
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application linked successfully',
                'data' => $occupancy->load(['application'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error linking application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error linking application'
            ], 500);
        }
    }

    /**
     * Delete occupancy record
     */
    public function destroy($id): JsonResponse
    {
        try {
            $occupancy = OccupancyRecord::findOrFail($id);

            // Check if occupancy can be deleted (e.g., not active)
            if ($occupancy->status === 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete active occupancy. Please end or terminate it first.'
                ], 400);
            }

            // Delete related records
            $occupancy->inspections()->delete();
            $occupancy->actions()->delete();

            // Delete the occupancy record
            $occupancy->delete();

            return response()->json([
                'success' => true,
                'message' => 'Occupancy record deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting occupancy record: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting occupancy record'
            ], 500);
        }
    }

    /**
     * Get occupancy logs with filtering
     */
    public function getLogs(Request $request): JsonResponse
    {
        try {
            $query = OccupancyAction::with(['occupancy', 'actor'])
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('reason', 'like', "%{$search}%")
                      ->orWhere('note', 'like', "%{$search}%")
                      ->orWhereHas('occupancy', function ($q) use ($search) {
                          $q->where('beneficiary_name', 'like', "%{$search}%")
                            ->orWhere('unit_identifier', 'like', "%{$search}%");
                      })
                      ->orWhereHas('actor', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('action')) {
                $query->where('action', $request->action);
            }

            if ($request->filled('status')) {
                $query->whereHas('occupancy', function ($q) use ($request) {
                    $q->where('status', $request->status);
                });
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->filled('actor')) {
                $query->whereHas('actor', function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->actor}%")
                      ->orWhere('email', 'like', "%{$request->actor}%");
                });
            }

            // Paginate results
            $perPage = $request->get('per_page', 15);
            $logs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting occupancy logs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting occupancy logs'
            ], 500);
        }
    }

    /**
     * Export occupancy logs to CSV
     */
    public function exportLogs(Request $request)
    {
        try {
            $query = OccupancyAction::with(['occupancy', 'actor'])
                ->orderBy('created_at', 'desc');

            // Apply same filters as getLogs
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('reason', 'like', "%{$search}%")
                      ->orWhere('note', 'like', "%{$search}%")
                      ->orWhereHas('occupancy', function ($q) use ($search) {
                          $q->where('beneficiary_name', 'like', "%{$search}%")
                            ->orWhere('unit_identifier', 'like', "%{$search}%");
                      })
                      ->orWhereHas('actor', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('action')) {
                $query->where('action', $request->action);
            }

            if ($request->filled('status')) {
                $query->whereHas('occupancy', function ($q) use ($request) {
                    $q->where('status', $request->status);
                });
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->filled('actor')) {
                $query->whereHas('actor', function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->actor}%")
                      ->orWhere('email', 'like', "%{$request->actor}%");
                });
            }

            $logs = $query->get();

            $filename = 'occupancy-logs-' . now()->format('Y-m-d') . '.csv';
            
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
                    'Occupancy ID',
                    'Beneficiary Name',
                    'Unit Identifier',
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
                        $log->id,
                        $log->action,
                        $log->occupancy_id,
                        $log->occupancy->beneficiary_name ?? 'N/A',
                        $log->occupancy->unit_identifier ?? 'N/A',
                        $log->old_status ?? 'N/A',
                        $log->new_status ?? 'N/A',
                        $log->reason ?? 'N/A',
                        $log->note ?? 'N/A',
                        $log->actor->name ?? 'System',
                        $log->actor->email ?? 'N/A',
                        $log->ip_address ?? 'N/A',
                        $log->created_at->format('Y-m-d H:i:s')
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Error exporting occupancy logs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error exporting logs'
            ], 500);
        }
    }

    /**
     * Get mock occupancy records for testing
     */
    private function getMockOccupancyRecords(): array
    {
        return [
            [
                'id' => 1,
                'application_id' => 1,
                'beneficiary_name' => 'Maria Santos',
                'contact_number' => '+63 912 345 6789',
                'email' => 'maria.santos@email.com',
                'address' => '123 Main Street, Barangay 1',
                'barangay' => 'Barangay 1',
                'unit_identifier' => 'Unit A-101',
                'program_type' => 'Socialized Housing',
                'household_size' => 4,
                'move_in_date' => '2024-01-15',
                'move_out_date' => null,
                'lease_start_date' => '2024-01-15',
                'lease_end_date' => '2025-01-15',
                'status' => 'active',
                'termination_reason' => null,
                'notes' => 'Family of 4, first-time homeowner',
                'created_at' => '2024-01-10T00:00:00Z',
                'updated_at' => '2024-01-15T00:00:00Z'
            ],
            [
                'id' => 2,
                'application_id' => 2,
                'beneficiary_name' => 'Juan Dela Cruz',
                'contact_number' => '+63 917 123 4567',
                'email' => 'juan.delacruz@email.com',
                'address' => '456 Oak Avenue, Barangay 2',
                'barangay' => 'Barangay 2',
                'unit_identifier' => 'Unit B-205',
                'program_type' => 'Economic Housing',
                'household_size' => 3,
                'move_in_date' => '2024-02-01',
                'move_out_date' => null,
                'lease_start_date' => '2024-02-01',
                'lease_end_date' => '2025-02-01',
                'status' => 'active',
                'termination_reason' => null,
                'notes' => 'Retired government employee',
                'created_at' => '2024-01-25T00:00:00Z',
                'updated_at' => '2024-02-01T00:00:00Z'
            ],
            [
                'id' => 3,
                'application_id' => 3,
                'beneficiary_name' => 'Ana Rodriguez',
                'contact_number' => '+63 918 987 6543',
                'email' => 'ana.rodriguez@email.com',
                'address' => '789 Pine Street, Barangay 3',
                'barangay' => 'Barangay 3',
                'unit_identifier' => 'Unit C-312',
                'program_type' => 'Socialized Housing',
                'household_size' => 5,
                'move_in_date' => '2024-01-20',
                'move_out_date' => '2024-03-15',
                'lease_start_date' => '2024-01-20',
                'lease_end_date' => '2025-01-20',
                'status' => 'ended',
                'termination_reason' => 'Voluntary move-out',
                'notes' => 'Moved to another city for work',
                'created_at' => '2024-01-15T00:00:00Z',
                'updated_at' => '2024-03-15T00:00:00Z'
            ],
            [
                'id' => 4,
                'application_id' => 4,
                'beneficiary_name' => 'Carlos Mendoza',
                'contact_number' => '+63 919 456 7890',
                'email' => 'carlos.mendoza@email.com',
                'address' => '321 Elm Street, Barangay 1',
                'barangay' => 'Barangay 1',
                'unit_identifier' => 'Unit A-203',
                'program_type' => 'Economic Housing',
                'household_size' => 2,
                'move_in_date' => '2024-02-10',
                'move_out_date' => null,
                'lease_start_date' => '2024-02-10',
                'lease_end_date' => '2025-02-10',
                'status' => 'active',
                'termination_reason' => null,
                'notes' => 'Young professional couple',
                'created_at' => '2024-02-05T00:00:00Z',
                'updated_at' => '2024-02-10T00:00:00Z'
            ],
            [
                'id' => 5,
                'application_id' => 5,
                'beneficiary_name' => 'Rosa Garcia',
                'contact_number' => '+63 920 111 2222',
                'email' => 'rosa.garcia@email.com',
                'address' => '654 Maple Drive, Barangay 4',
                'barangay' => 'Barangay 4',
                'unit_identifier' => 'Unit D-401',
                'program_type' => 'Socialized Housing',
                'household_size' => 6,
                'move_in_date' => '2024-01-05',
                'move_out_date' => null,
                'lease_start_date' => '2024-01-05',
                'lease_end_date' => '2025-01-05',
                'status' => 'terminated',
                'termination_reason' => 'Violation of lease terms',
                'notes' => 'Terminated due to unauthorized subletting',
                'created_at' => '2023-12-20T00:00:00Z',
                'updated_at' => '2024-02-28T00:00:00Z'
            ],
            [
                'id' => 6,
                'application_id' => 6,
                'beneficiary_name' => 'Miguel Torres',
                'contact_number' => '+63 921 333 4444',
                'email' => 'miguel.torres@email.com',
                'address' => '987 Cedar Lane, Barangay 2',
                'barangay' => 'Barangay 2',
                'unit_identifier' => 'Unit B-108',
                'program_type' => 'Economic Housing',
                'household_size' => 3,
                'move_in_date' => '2024-03-01',
                'move_out_date' => null,
                'lease_start_date' => '2024-03-01',
                'lease_end_date' => '2025-03-01',
                'status' => 'active',
                'termination_reason' => null,
                'notes' => 'Small business owner',
                'created_at' => '2024-02-25T00:00:00Z',
                'updated_at' => '2024-03-01T00:00:00Z'
            ],
            [
                'id' => 7,
                'application_id' => 7,
                'beneficiary_name' => 'Elena Villanueva',
                'contact_number' => '+63 922 555 6666',
                'email' => 'elena.villanueva@email.com',
                'address' => '147 Birch Street, Barangay 3',
                'barangay' => 'Barangay 3',
                'unit_identifier' => 'Unit C-225',
                'program_type' => 'Socialized Housing',
                'household_size' => 4,
                'move_in_date' => '2024-02-15',
                'move_out_date' => null,
                'lease_start_date' => '2024-02-15',
                'lease_end_date' => '2025-02-15',
                'status' => 'active',
                'termination_reason' => null,
                'notes' => 'Single mother with 3 children',
                'created_at' => '2024-02-10T00:00:00Z',
                'updated_at' => '2024-02-15T00:00:00Z'
            ],
            [
                'id' => 8,
                'application_id' => 8,
                'beneficiary_name' => 'Roberto Silva',
                'contact_number' => '+63 923 777 8888',
                'email' => 'roberto.silva@email.com',
                'address' => '258 Spruce Avenue, Barangay 1',
                'barangay' => 'Barangay 1',
                'unit_identifier' => 'Unit A-156',
                'program_type' => 'Economic Housing',
                'household_size' => 2,
                'move_in_date' => '2024-01-30',
                'move_out_date' => '2024-04-10',
                'lease_start_date' => '2024-01-30',
                'lease_end_date' => '2025-01-30',
                'status' => 'ended',
                'termination_reason' => 'Lease expiration',
                'notes' => 'Completed lease term successfully',
                'created_at' => '2024-01-25T00:00:00Z',
                'updated_at' => '2024-04-10T00:00:00Z'
            ]
        ];
    }
}