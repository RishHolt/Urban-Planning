<?php

namespace App\Http\Controllers;

use App\Models\HousingApplication;
use App\Models\HousingDocument;
use App\Models\HousingInspection;
use App\Models\HousingAction;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HousingApplicationController extends Controller
{
    /**
     * Display a listing of applications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = HousingApplication::with(['applicant', 'assignedStaff', 'documents', 'actions'])
                ->orderBy('created_at', 'desc');

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by assigned staff
            if ($request->has('assigned_staff_id')) {
                $query->where('assigned_staff_id', $request->assigned_staff_id);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('application_number', 'like', "%{$search}%")
                      ->orWhere('full_name', 'like', "%{$search}%")
                      ->orWhere('current_address', 'like', "%{$search}%");
                });
            }

            // Date range filter
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $applications = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $applications
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching housing applications: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching applications'
            ], 500);
        }
    }

    /**
     * Store a newly created application
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'birthdate' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'civil_status' => 'required|in:single,married,widowed,divorced,separated',
                'national_id' => 'nullable|string',
                'mobile' => 'nullable|string',
                'email' => 'nullable|email',
                'preferred_contact' => 'required|in:mobile,email,both',
                'household_size' => 'required|integer|min:1',
                'current_address' => 'required|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'years_at_address' => 'required|integer|min:0',
                'barangay' => 'required|string',
                'employment_status' => 'required|in:employed,unemployed,self_employed,retired,student',
                'employer_name' => 'nullable|string',
                'monthly_income' => 'required|numeric|min:0',
                'income_type' => 'required|in:salary,business,pension,other',
                'other_income_sources' => 'nullable|string',
                'total_household_income' => 'required|numeric|min:0',
                'housing_type' => 'required|in:informal,owned,rented,paying_rent,squatting,evacuated',
                'rooms' => 'nullable|integer|min:0',
                'floor_area' => 'nullable|numeric|min:0',
                'occupancy_density' => 'nullable|numeric|min:0',
                'program_type' => 'required|in:rental_subsidy,socialized_housing,in_city_relocation',
                'requested_units' => 'required|integer|min:1',
                'preferred_project' => 'nullable|string',
                'household_members' => 'required|array|min:1',
                'household_members.*.name' => 'required|string',
                'household_members.*.relation' => 'required|in:spouse,child,parent,sibling,grandparent,grandchild,uncle,aunt,nephew,niece,cousin,in_law,other',
                'household_members.*.birthdate' => 'required|date',
                'household_members.*.id_type' => 'nullable|in:birth_certificate,passport,drivers_license,voters_id,other',
                'household_members.*.id_number' => 'nullable|string'
            ]);

            // Generate application number
            $applicationNumber = 'HA-' . date('Y') . '-' . str_pad(HousingApplication::count() + 1, 6, '0', STR_PAD_LEFT);

            $application = HousingApplication::create([
                'application_number' => $applicationNumber,
                'applicant_id' => auth()->id() ?? null, // Allow null for testing
                'status' => 'submitted',
                'submitted_at' => now(),
                'submission_channel' => 'online',
                'ip_address' => $request->ip(),
                'device_info' => $request->userAgent(),
                ...$validated
            ]);

            // Create household members
            foreach ($validated['household_members'] as $member) {
                HouseholdMember::create([
                    'application_id' => $application->id,
                    ...$member
                ]);
            }

            // Log action
            HousingAction::create([
                'application_id' => $application->id,
                'actor_id' => auth()->id() ?? null, // Allow null for testing
                'action' => 'submitted',
                'note' => 'Application submitted for review'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => $application->load(['householdMembers', 'documents'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating housing application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating application'
            ], 500);
        }
    }

    /**
     * Display the specified application
     */
    public function show($id): JsonResponse
    {
        try {
            $application = HousingApplication::with([
                'applicant', 'assignedStaff', 'inspector', 'householdMembers', 
                'documents', 'inspections', 'actions.actor'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $application
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching housing application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }
    }

    /**
     * Submit application for review
     */
    public function submit($id): JsonResponse
    {
        try {
            $application = HousingApplication::findOrFail($id);
            
            if ($application->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Application cannot be submitted'
                ], 400);
            }

            $application->update([
                'status' => 'submitted',
                'submitted_at' => now()
            ]);

            // Log action
            HousingAction::create([
                'application_id' => $application->id,
                'actor_id' => auth()->id(),
                'action' => 'submitted',
                'old_status' => 'draft',
                'new_status' => 'submitted',
                'note' => 'Application submitted for review'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error submitting housing application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error submitting application'
            ], 500);
        }
    }

    /**
     * Start review of housing application
     */
    public function startReview($id): JsonResponse
    {
        try {
            $application = HousingApplication::findOrFail($id);
            $userId = auth()->id() ?? 1; // Use default user ID if not authenticated
            
            if ($application->status !== 'submitted') {
                return response()->json([
                    'success' => false,
                    'message' => 'Application is not in submitted status'
                ], 400);
            }

            $application->update([
                'status' => 'under_review',
                'assigned_staff_id' => $userId,
            ]);

            // Log action
            HousingAction::create([
                'application_id' => $application->id,
                'actor_id' => $userId,
                'action' => 'review_started',
                'old_status' => 'submitted',
                'new_status' => 'under_review',
                'note' => 'Review started by housing officer'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review started successfully',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Error starting housing application review: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error starting review'
            ], 500);
        }
    }

    /**
     * Check eligibility
     */
    public function checkEligibility($id): JsonResponse
    {
        try {
            $application = HousingApplication::findOrFail($id);
            
            // Implement eligibility logic here
            $eligibilityPassed = $this->runEligibilityCheck($application);
            $score = $this->calculateScore($application);

            $application->update([
                'status' => $eligibilityPassed ? 'document_verification' : 'rejected',
                'eligibility_passed' => $eligibilityPassed,
                'score' => $score,
                'eligibility_checked_at' => now()
            ]);

            // Log action
            HousingAction::create([
                'application_id' => $application->id,
                'actor_id' => auth()->id() ?? 1, // Default to admin user if not authenticated
                'action' => 'eligibility_checked',
                'old_status' => 'submitted',
                'new_status' => $eligibilityPassed ? 'document_verification' : 'rejected',
                'note' => $eligibilityPassed ? 'Eligibility check passed' : 'Eligibility check failed'
            ]);

            return response()->json([
                'success' => true,
                'message' => $eligibilityPassed ? 'Eligibility check passed' : 'Eligibility check failed',
                'data' => [
                    'eligibility_passed' => $eligibilityPassed,
                    'score' => $score
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking eligibility: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error checking eligibility'
            ], 500);
        }
    }

    /**
     * Verify document
     */
    public function verifyDocument(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'document_id' => 'required|exists:housing_documents,id',
                'verification_status' => 'required|in:verified,rejected',
                'rejection_reason' => 'required_if:verification_status,rejected|string'
            ]);

            $document = HousingDocument::findOrFail($validated['document_id']);
            
            $document->update([
                'verification_status' => $validated['verification_status'],
                'verified_by' => auth()->id(),
                'verified_at' => now(),
                'rejection_reason' => $validated['rejection_reason'] ?? null
            ]);

            // Log action
            HousingAction::create([
                'application_id' => $id,
                'actor_id' => auth()->id(),
                'action' => $validated['verification_status'] === 'verified' ? 'document_verified' : 'document_rejected',
                'note' => $validated['verification_status'] === 'verified' 
                    ? 'Document verified' 
                    : 'Document rejected: ' . $validated['rejection_reason']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document verification updated'
            ]);
        } catch (\Exception $e) {
            Log::error('Error verifying document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error verifying document'
            ], 500);
        }
    }

    /**
     * Request additional information
     */
    public function requestInfo(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'message' => 'required|string',
                'required_documents' => 'nullable|array'
            ]);

            $application = HousingApplication::findOrFail($id);
            $application->update(['status' => 'info_requested']);

            // Log action
            HousingAction::create([
                'application_id' => $id,
                'actor_id' => auth()->id(),
                'action' => 'info_requested',
                'old_status' => $application->status,
                'new_status' => 'info_requested',
                'note' => $validated['message']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Information request sent to applicant'
            ]);
        } catch (\Exception $e) {
            Log::error('Error requesting info: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error requesting information'
            ], 500);
        }
    }

    /**
     * Schedule inspection
     */
    public function scheduleInspection(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'scheduled_date' => 'required|date|after:now',
                'inspector_id' => 'required|exists:users,id'
            ]);

            $inspection = HousingInspection::create([
                'application_id' => $id,
                'inspector_id' => $validated['inspector_id'],
                'scheduled_date' => $validated['scheduled_date'],
                'status' => 'scheduled'
            ]);

            $application = HousingApplication::findOrFail($id);
            $application->update([
                'status' => 'field_inspection',
                'inspector_id' => $validated['inspector_id']
            ]);

            // Log action
            HousingAction::create([
                'application_id' => $id,
                'actor_id' => auth()->id(),
                'action' => 'inspection_scheduled',
                'old_status' => 'document_verification',
                'new_status' => 'field_inspection',
                'note' => 'Field inspection scheduled for ' . $validated['scheduled_date']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inspection scheduled successfully'
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
     * Upload inspection report
     */
    public function uploadInspectionReport(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'inspection_id' => 'required|exists:housing_inspections,id',
                'report' => 'required|string',
                'photos' => 'nullable|array',
                'dwelling_conditions' => 'nullable|array',
                'occupancy_verified' => 'required|boolean'
            ]);

            $inspection = HousingInspection::findOrFail($validated['inspection_id']);
            $inspection->update([
                'inspection_date' => now(),
                'report' => $validated['report'],
                'photos' => $validated['photos'] ?? [],
                'dwelling_conditions' => $validated['dwelling_conditions'] ?? [],
                'occupancy_verified' => $validated['occupancy_verified'],
                'status' => 'completed'
            ]);

            $application = HousingApplication::findOrFail($id);
            $application->update(['status' => 'final_review']);

            // Log action
            HousingAction::create([
                'application_id' => $id,
                'actor_id' => auth()->id(),
                'action' => 'inspection_completed',
                'old_status' => 'field_inspection',
                'new_status' => 'final_review',
                'note' => 'Field inspection completed'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inspection report uploaded successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error uploading inspection report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error uploading inspection report'
            ], 500);
        }
    }

    /**
     * Approve application
     */
    public function approve(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'approval_notes' => 'required|string',
                'offer_details' => 'nullable|string'
            ]);

            $application = HousingApplication::findOrFail($id);
            $application->update([
                'status' => 'approved',
                'approval_notes' => $validated['approval_notes'],
                'offer_details' => $validated['offer_details'],
                'approved_at' => now()
            ]);

            // Log action
            HousingAction::create([
                'application_id' => $id,
                'actor_id' => auth()->id(),
                'action' => 'approved',
                'old_status' => 'final_review',
                'new_status' => 'approved',
                'note' => $validated['approval_notes']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application approved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error approving application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error approving application'
            ], 500);
        }
    }

    /**
     * Reject application
     */
    public function reject(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'rejection_reason' => 'required|string'
            ]);

            $application = HousingApplication::findOrFail($id);
            $application->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'],
                'rejected_at' => now()
            ]);

            // Log action
            HousingAction::create([
                'application_id' => $id,
                'actor_id' => auth()->id(),
                'action' => 'rejected',
                'old_status' => 'final_review',
                'new_status' => 'rejected',
                'note' => $validated['rejection_reason']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application rejected'
            ]);
        } catch (\Exception $e) {
            Log::error('Error rejecting application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting application'
            ], 500);
        }
    }

    /**
     * Get application history
     */
    public function getHistory($id): JsonResponse
    {
        try {
            $actions = HousingAction::with('actor')
                ->where('application_id', $id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $actions
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching application history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching history'
            ], 500);
        }
    }

    /**
     * Upload document
     */
    public function uploadDocument(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'document_type' => 'required|string',
                'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240' // 10MB max
            ]);

            $application = HousingApplication::findOrFail($id);
            
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('housing_documents', $fileName, 'public');

            $document = HousingDocument::create([
                'application_id' => $id,
                'document_type' => $validated['document_type'],
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_hash' => hash_file('sha256', $file->getRealPath()),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => $document
            ]);
        } catch (\Exception $e) {
            Log::error('Error uploading document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error uploading document'
            ], 500);
        }
    }

    /**
     * Withdraw application
     */
    public function withdraw($id): JsonResponse
    {
        try {
            $application = HousingApplication::findOrFail($id);
            
            if (!in_array($application->status, ['draft', 'submitted', 'eligibility_check'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application cannot be withdrawn at this stage'
                ], 400);
            }

            $application->update(['status' => 'withdrawn']);

            // Log action
            HousingAction::create([
                'application_id' => $id,
                'actor_id' => auth()->id(),
                'action' => 'withdrawn',
                'old_status' => $application->status,
                'new_status' => 'withdrawn',
                'note' => 'Application withdrawn by applicant'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application withdrawn successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error withdrawing application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error withdrawing application'
            ], 500);
        }
    }

    /**
     * Private helper methods
     */
    private function runEligibilityCheck(HousingApplication $application): bool
    {
        // Implement eligibility rules here
        // This is a placeholder implementation
        return $application->total_household_income <= 50000; // Example threshold
    }

    private function calculateScore(HousingApplication $application): float
    {
        // Implement scoring formula here
        // This is a placeholder implementation
        $score = 0;
        
        // Income factor (40%)
        $incomeScore = min(100, max(0, 100 - ($application->total_household_income / 1000)));
        $score += $incomeScore * 0.40;
        
        // Household size factor (20%)
        $householdScore = min(100, $application->household_size * 10);
        $score += $householdScore * 0.20;
        
        // Vulnerability flags (25%)
        $vulnerabilityScore = 0;
        if ($application->housing_type === 'informal') $vulnerabilityScore += 25;
        if ($application->housing_type === 'squatting') $vulnerabilityScore += 50;
        $score += $vulnerabilityScore * 0.25;
        
        // Residency duration (10%)
        $residencyScore = min(100, $application->years_at_address * 5);
        $score += $residencyScore * 0.10;
        
        // Housing condition (5%)
        $housingScore = 0;
        if ($application->rooms && $application->floor_area) {
            $density = $application->household_size / ($application->floor_area / 10); // persons per 10 sqm
            $housingScore = min(100, max(0, 100 - $density * 10));
        }
        $score += $housingScore * 0.05;
        
        return round($score, 2);
    }

    /**
     * Get housing configuration
     */
    public function getConfig()
    {
        try {
            $config = DB::table('housing_config')->get()->mapWithKeys(function ($item) {
                return [$item->config_key => $item->config_value];
            });

            return response()->json([
                'success' => true,
                'data' => $config
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load configuration'
            ], 500);
        }
    }

    /**
     * Update housing configuration
     */
    public function updateConfig(Request $request)
    {
        try {
            $validated = $request->validate([
                'config' => 'required|array'
            ]);

            foreach ($validated['config'] as $key => $value) {
                DB::table('housing_config')->updateOrInsert(
                    ['config_key' => $key],
                    ['config_value' => $value, 'updated_at' => now()]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Configuration updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update configuration'
            ], 500);
        }
    }

    /**
     * Get housing logs
     */
    public function getLogs(Request $request)
    {
        try {
            $query = HousingAction::with(['application', 'actor']);

            // Apply filters
            if ($request->has('action')) {
                $query->where('action', $request->action);
            }
            if ($request->has('actor_id')) {
                $query->where('actor_id', $request->actor_id);
            }
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }
            if ($request->has('search')) {
                $query->whereHas('application', function ($q) use ($request) {
                    $q->where('application_number', 'like', '%' . $request->search . '%')
                      ->orWhere('full_name', 'like', '%' . $request->search . '%');
                });
            }

            $logs = $query->orderBy('created_at', 'desc')->paginate(50);

            return response()->json([
                'success' => true,
                'data' => $logs->items(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'total' => $logs->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load logs'
            ], 500);
        }
    }

    /**
     * Get housing logs statistics
     */
    public function getLogStats()
    {
        try {
            $stats = [
                'total_logs' => HousingAction::count(),
                'today_logs' => HousingAction::whereDate('created_at', today())->count(),
                'unique_actors' => HousingAction::distinct('actor_id')->count(),
                'applications_processed' => HousingAction::where('action', 'approved')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load statistics'
            ], 500);
        }
    }

    /**
     * Export housing logs
     */
    public function exportLogs(Request $request)
    {
        try {
            $query = HousingAction::with(['application', 'actor']);

            // Apply same filters as getLogs
            if ($request->has('action')) {
                $query->where('action', $request->action);
            }
            if ($request->has('actor_id')) {
                $query->where('actor_id', $request->actor_id);
            }
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            $csv = "Date,Application,Action,Actor,Old Status,New Status,Reason\n";
            foreach ($logs as $log) {
                $csv .= implode(',', [
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->application->application_number ?? '',
                    $log->action,
                    $log->actor->name ?? '',
                    $log->old_status ?? '',
                    $log->new_status ?? '',
                    '"' . str_replace('"', '""', $log->reason ?? '') . '"'
                ]) . "\n";
            }

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="housing-logs.csv"');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export logs'
            ], 500);
        }
    }

    /**
     * Get housing inspections
     */
    public function getInspections(Request $request)
    {
        try {
            $query = HousingInspection::with(['application', 'inspector']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('inspector_id')) {
                $query->where('inspector_id', $request->inspector_id);
            }
            if ($request->has('date_from')) {
                $query->whereDate('scheduled_date', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('scheduled_date', '<=', $request->date_to);
            }

            $inspections = $query->orderBy('scheduled_date', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $inspections
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load inspections'
            ], 500);
        }
    }

    /**
     * Create housing inspection
     */
    public function createInspection(Request $request)
    {
        try {
            $validated = $request->validate([
                'application_id' => 'required|exists:housing_applications,id',
                'inspector_id' => 'required|exists:users,id',
                'scheduled_date' => 'required|date|after:now'
            ]);

            $inspection = HousingInspection::create($validated);

            return response()->json([
                'success' => true,
                'data' => $inspection,
                'message' => 'Inspection scheduled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inspection'
            ], 500);
        }
    }

    /**
     * Update housing inspection
     */
    public function updateInspection(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'scheduled_date' => 'sometimes|date',
                'status' => 'sometimes|in:scheduled,completed,failed,cancelled',
                'report' => 'sometimes|string',
                'notes' => 'sometimes|string'
            ]);

            $inspection = HousingInspection::findOrFail($id);
            $inspection->update($validated);

            return response()->json([
                'success' => true,
                'data' => $inspection,
                'message' => 'Inspection updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update inspection'
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): JsonResponse
    {
        try {
            $stats = [
                'total_applications' => HousingApplication::count(),
                'pending_applications' => HousingApplication::whereIn('status', ['draft', 'submitted', 'eligibility_check', 'document_verification'])->count(),
                'approved_applications' => HousingApplication::where('status', 'approved')->count(),
                'rejected_applications' => HousingApplication::where('status', 'rejected')->count(),
                'eligibility_pass_rate' => $this->calculateEligibilityPassRate(),
                'average_processing_time' => $this->calculateAverageProcessingTime(),
                'recent_submissions' => HousingApplication::whereDate('created_at', '>=', now()->subDays(7))->count(),
                'applications_needing_attention' => HousingApplication::whereIn('status', ['info_requested', 'on_hold'])->count(),
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
     * Calculate eligibility pass rate
     */
    private function calculateEligibilityPassRate(): float
    {
        $total = HousingApplication::whereNotNull('eligibility_passed')->count();
        if ($total === 0) return 0;
        
        $passed = HousingApplication::where('eligibility_passed', true)->count();
        return round(($passed / $total) * 100, 1);
    }

    /**
     * Calculate average processing time in days
     */
    private function calculateAverageProcessingTime(): float
    {
        $completed = HousingApplication::whereIn('status', ['approved', 'rejected'])
            ->whereNotNull('submitted_at')
            ->get();

        if ($completed->isEmpty()) return 0;

        $totalDays = $completed->sum(function ($app) {
            $endDate = $app->status === 'approved' ? $app->approved_at : $app->rejected_at;
            return $app->submitted_at->diffInDays($endDate);
        });

        return round($totalDays / $completed->count(), 1);
    }
}
