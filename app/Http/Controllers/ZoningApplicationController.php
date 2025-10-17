<?php

namespace App\Http\Controllers;

use App\Models\ZoningApplication;
use App\Models\Document;
use App\Models\ApplicationHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ZoningApplicationController extends Controller
{
    /**
     * Display a listing of applications with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = ZoningApplication::with(['assignedStaff', 'documents', 'locationConfirmedBy']);

        // Filter by user role - Citizens can only see their own applications
        $user = auth()->user();
        if ($user && $user->role === 'CITIZEN') {
            $query->where('email', $user->email);
        }

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('project_type', 'like', "%{$search}%")
                  ->orWhere('project_location', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy('created_at', 'desc');

        $applications = $query->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
            'total' => $applications->count(),
            'filters' => [
                'status' => $request->status,
                'payment_status' => $request->payment_status,
                'search' => $request->search,
            ],
            'user_role' => $user ? $user->role : null
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Store a newly created application
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'business_name' => 'nullable|string|max:255',
            'type_of_applicant' => 'required|string|in:Individual,Corporation,Government Entity',
            'project_type' => 'required|string|max:255',
            'project_description' => 'required|string|max:1000',
            'project_location' => 'required|string|max:500',
            'total_lot_area_sqm' => 'required|numeric|min:0',
            'total_floor_area_sqm' => 'required|numeric|min:0',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'land_ownership' => 'required|string|in:Owned,Leased,Others',
            'name_of_owner' => 'nullable|string|max:255',
            'tct_no' => 'required|string|max:255',
            'tax_declaration_no' => 'required|string|max:255',
            'lot_block_survey_no' => 'required|string|max:255',
            'barangay_clearance_id' => 'required|string|max:255',
            'or_reference_number' => 'nullable|string|max:255',
            'or_date' => 'nullable|date',
            'payment_status' => 'nullable|string|in:pending,confirmed',
            'additional_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Set default OR values for pending payment
            $data = $request->all();
            if (empty($data['or_reference_number'])) {
                $data['or_reference_number'] = 'PENDING';
            }
            if (empty($data['or_date'])) {
                $data['or_date'] = null;
            }
            if (empty($data['payment_status'])) {
                $data['payment_status'] = 'pending';
            }

            $application = ZoningApplication::create($data);

            // Handle file uploads
            $this->handleFileUploads($request, $application);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => $application->load('documents')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified application
     */
    public function show(string $id): JsonResponse
    {
        $application = ZoningApplication::with(['assignedStaff', 'technicalStaff', 'documents', 'locationConfirmedBy', 'history'])
            ->findOrFail($id);

        // Check if user is authorized to view this application
        $user = auth()->user();
        if ($user && $user->role === 'CITIZEN') {
            if ($application->email !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this application'
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    /**
     * Update the specified application
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $application = ZoningApplication::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|string|in:pending,under_review,approved,rejected,requires_changes',
            'assigned_staff_id' => 'sometimes|nullable|exists:users,id',
            'latitude' => 'sometimes|nullable|numeric|between:-90,90',
            'longitude' => 'sometimes|nullable|numeric|between:-180,180',
            'additional_notes' => 'sometimes|nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $application->update($request->all());

            // Update reviewed_at if status changed
            if ($request->has('status') && $request->status !== $application->getOriginal('status')) {
                $application->update(['reviewed_at' => now()]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Application updated successfully',
                'data' => $application->load('assignedStaff', 'documents', 'locationConfirmedBy')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm or adjust location coordinates
     */
    public function confirmLocation(Request $request, string $id): JsonResponse
    {
        $application = ZoningApplication::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $application->update([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'location_confirmed_at' => now(),
                'location_confirmed_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Location confirmed successfully',
                'data' => $application->load('locationConfirmedBy')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified application (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $application = ZoningApplication::findOrFail($id);
            $application->delete();

            return response()->json([
                'success' => true,
                'message' => 'Application deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle file uploads for the application
     */
    private function handleFileUploads(Request $request, ZoningApplication $application): void
    {
        $fileFields = [
            'proof_of_ownership' => 'proof_of_ownership',
            'site_development_plan' => 'site_development_plan',
            'vicinity_map' => 'vicinity_map',
            'building_plan' => 'building_plan',
            'environmental_clearance' => 'environmental_clearance',
            'dpwh_clearance' => 'dpwh_clearance',
            'subdivision_permit' => 'subdivision_permit',
            'business_permit' => 'business_permit',
            'fire_safety_clearance' => 'fire_safety_clearance',
            'signature_file' => 'signature_file',
            'tax_clearance' => 'tax_clearance',
        ];

        foreach ($fileFields as $field => $documentType) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $path = $file->store('zoning-clearance/' . $documentType, 'public');

                Document::create([
                    'documentable_type' => ZoningApplication::class,
                    'documentable_id' => $application->id,
                    'document_type' => $documentType,
                    'document_category' => Document::getCategoryForType($documentType),
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $file->getClientOriginalExtension(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_by' => auth()->id(),
                ]);
            }
        }
    }

    // Payment testing endpoints
    public function confirmPayment($applicationId): JsonResponse
    {
        $application = ZoningApplication::findOrFail($applicationId);
        
        $application->update(['payment_status' => 'confirmed']);
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'payment_confirmed',
            'new_value' => 'confirmed',
            'remarks' => 'Payment confirmed for testing',
            'performed_by' => auth()->id(),
        ]);
        
        return response()->json(['success' => true, 'message' => 'Payment confirmed']);
    }

    public function unpayPayment($applicationId): JsonResponse
    {
        $application = ZoningApplication::findOrFail($applicationId);
        
        $application->update(['payment_status' => 'pending']);
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'payment_status_changed',
            'old_value' => 'confirmed',
            'new_value' => 'pending',
            'remarks' => 'Payment set to pending for testing',
            'performed_by' => auth()->id(),
        ]);
        
        return response()->json(['success' => true, 'message' => 'Payment set to pending']);
    }

    // Workflow transition endpoints
    public function startInitialReview($applicationId): JsonResponse
    {
        try {
            $application = ZoningApplication::findOrFail($applicationId);
            $userId = auth()->id();
            
            \Log::info('Start Initial Review Debug', [
                'application_id' => $applicationId,
                'current_status' => $application->status,
                'payment_status' => $application->payment_status,
                'user_id' => $userId,
                'user_authenticated' => auth()->check(),
                'assigned_staff_before' => $application->assigned_staff_id
            ]);
            
            if (!$application->isPaymentConfirmed()) {
                return response()->json(['success' => false, 'message' => 'Payment must be confirmed before starting review'], 400);
            }
            
            if ($application->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Application is not in pending status'], 400);
            }
            
            // If no user is authenticated, use a default user ID (1)
            if (!$userId) {
                $userId = 1;
                \Log::warning('No authenticated user, using default user ID: 1');
            }
            
            $application->update([
                'status' => 'initial_review',
                'assigned_staff_id' => $userId,
            ]);
            
            ApplicationHistory::create([
                'zoning_application_id' => $applicationId,
                'action' => 'status_changed',
                'old_value' => 'pending',
                'new_value' => 'initial_review',
                'remarks' => 'Initial review started by zoning officer',
                'performed_by' => $userId,
            ]);
            
            $updatedApplication = $application->fresh();
            
            \Log::info('Start Initial Review Success', [
                'application_id' => $applicationId,
                'new_status' => $updatedApplication->status,
                'assigned_staff_after' => $updatedApplication->assigned_staff_id
            ]);
            
            return response()->json([
                'success' => true, 
                'message' => 'Initial review started successfully',
                'data' => $updatedApplication
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Start Initial Review Error', [
                'application_id' => $applicationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to start initial review: ' . $e->getMessage()
            ], 500);
        }
    }

    public function forwardToTechnical(Request $request, $applicationId): JsonResponse
    {
        $application = ZoningApplication::findOrFail($applicationId);
        
        // Check all Group A documents are approved
        $groupADocs = Document::where('documentable_type', ZoningApplication::class)
            ->where('documentable_id', $applicationId)
            ->where('document_category', 'initial_review')
            ->get();
        
        $allApproved = $groupADocs->every(fn($doc) => $doc->verification_status === 'approved');
        
        if (!$allApproved) {
            return response()->json(['success' => false, 'message' => 'All initial review documents must be approved first'], 400);
        }
        
        $application->update([
            'status' => 'technical_review',
            'technical_staff_id' => null, // Will be assigned when "Start Technical Review" is clicked
            'forwarded_to_technical_at' => now(),
        ]);
        
        // Recategorize only technical documents for technical review
        $groupADocs->each(function ($doc) {
            // Only recategorize if this is actually a technical document
            if (in_array($doc->document_type, ['site_development_plan', 'building_plan', 'subdivision_permit', 'fire_safety_clearance'])) {
                $doc->update([
                    'document_category' => 'technical_review',
                    'verification_status' => 'pending', // Reset status for technical review
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                    'review_remarks' => null,
                ]);
            }
        });
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'forwarded_to_technical',
            'remarks' => $request->remarks ?? 'Forwarded to Building/Subdivision office for technical review',
            'performed_by' => auth()->id(),
        ]);
        
        return response()->json(['success' => true, 'message' => 'Application forwarded to technical review']);
    }

    public function returnToZoning(Request $request, $applicationId): JsonResponse
    {
        $application = ZoningApplication::findOrFail($applicationId);
        
        // Check all Group B documents are approved
        $groupBDocs = Document::where('documentable_type', ZoningApplication::class)
            ->where('documentable_id', $applicationId)
            ->where('document_category', 'technical_review')
            ->get();
        
        $allApproved = $groupBDocs->every(fn($doc) => $doc->verification_status === 'approved');
        
        if (!$allApproved) {
            return response()->json(['success' => false, 'message' => 'All technical documents must be reviewed first'], 400);
        }
        
        $application->update([
            'status' => 'awaiting_approval',
            'returned_from_technical_at' => now(),
        ]);
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'returned_to_zoning',
            'remarks' => $request->remarks ?? 'Technical review completed, returned to zoning for final approval',
            'performed_by' => auth()->id(),
        ]);
        
        return response()->json(['success' => true, 'message' => 'Application returned to zoning for final approval']);
    }

    public function approve(Request $request, $applicationId): JsonResponse
    {
        $application = ZoningApplication::findOrFail($applicationId);
        
        // Verify application is in awaiting_approval status
        if ($application->status !== 'awaiting_approval') {
            return response()->json([
                'success' => false, 
                'message' => 'Application must be awaiting approval'
            ], 400);
        }
        
        $application->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'approved',
            'remarks' => 'Application approved by zoning office',
            'performed_by' => auth()->id(),
        ]);
        
        return response()->json([
            'success' => true, 
            'message' => 'Application approved successfully',
            'application_number' => $application->application_number
        ]);
    }

    // Document review endpoints
    public function verifyDocument(Request $request, $applicationId, $documentId): JsonResponse
    {
        $document = Document::where('documentable_type', ZoningApplication::class)
            ->where('documentable_id', $applicationId)
            ->where('id', $documentId)
            ->firstOrFail();
        
        $document->update([
            'verification_status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'review_remarks' => $request->remarks,
        ]);
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'document_verified',
            'new_value' => $document->document_type,
            'remarks' => $request->remarks,
            'performed_by' => auth()->id(),
        ]);
        
        return response()->json(['success' => true, 'message' => 'Document verified']);
    }

    public function rejectDocument(Request $request, $applicationId, $documentId): JsonResponse
    {
        $request->validate([
            'remarks' => 'required|string|max:500',
        ]);
        
        $document = Document::where('documentable_type', ZoningApplication::class)
            ->where('documentable_id', $applicationId)
            ->where('id', $documentId)
            ->firstOrFail();
        
        $document->update([
            'verification_status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'review_remarks' => $request->remarks,
        ]);
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'document_rejected',
            'new_value' => $document->document_type,
            'remarks' => $request->remarks,
            'performed_by' => auth()->id(),
        ]);
        
        // Set application status to requires_changes
        $application = ZoningApplication::find($applicationId);
        if ($application->status !== 'requires_changes') {
            $oldStatus = $application->status;
            $application->update(['status' => 'requires_changes']);
            
            ApplicationHistory::create([
                'zoning_application_id' => $applicationId,
                'action' => 'status_changed',
                'old_value' => $oldStatus,
                'new_value' => 'requires_changes',
                'remarks' => 'Document rejected, changes required from citizen',
                'performed_by' => auth()->id(),
            ]);
        }
        
        return response()->json(['success' => true, 'message' => 'Document rejected']);
    }

    public function reuploadDocument(Request $request, $applicationId, $documentId): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);
        
        $document = Document::where('documentable_type', ZoningApplication::class)
            ->where('documentable_id', $applicationId)
            ->where('id', $documentId)
            ->firstOrFail();
        
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $file = $request->file('file');
        $path = $file->store('zoning-clearance/' . $document->document_type, 'public');
        
        $document->update([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'verification_status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_remarks' => null,
        ]);
        
        ApplicationHistory::create([
            'zoning_application_id' => $applicationId,
            'action' => 'document_reuploaded',
            'new_value' => $document->document_type,
            'remarks' => 'Document re-uploaded after rejection',
            'performed_by' => auth()->id(),
        ]);
        
        // Reset status back to pending if all rejected docs are fixed
        $application = ZoningApplication::find($applicationId);
        $hasRejected = Document::where('documentable_type', ZoningApplication::class)
            ->where('documentable_id', $applicationId)
            ->where('verification_status', 'rejected')
            ->exists();
        
        if (!$hasRejected && $application->status === 'requires_changes') {
            $application->update(['status' => 'pending']);
            ApplicationHistory::create([
                'zoning_application_id' => $applicationId,
                'action' => 'status_changed',
                'old_value' => 'requires_changes',
                'new_value' => 'pending',
                'remarks' => 'All rejected documents re-uploaded, ready for review',
                'performed_by' => auth()->id(),
            ]);
        }
        
        return response()->json(['success' => true, 'message' => 'Document re-uploaded successfully']);
    }

    public function downloadDocument($applicationId, $documentId)
    {
        $document = Document::where('documentable_type', ZoningApplication::class)
            ->where('documentable_id', $applicationId)
            ->where('id', $documentId)
            ->firstOrFail();
        
        return response()->download(storage_path('app/public/' . $document->file_path), $document->file_name);
    }

    public function getHistory($applicationId): JsonResponse
    {
        $history = ApplicationHistory::with('performedBy')
            ->where('zoning_application_id', $applicationId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['success' => true, 'data' => $history]);
    }

    /**
     * Get application history for a specific application
     */
    public function getApplicationHistory($id): JsonResponse
    {
        $history = ApplicationHistory::with(['performedBy', 'application'])
            ->where('zoning_application_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['success' => true, 'data' => $history]);
    }

    /**
     * Get all application history with filtering and pagination
     */
    public function getAllApplicationHistory(Request $request): JsonResponse
    {
        $query = ApplicationHistory::with(['performedBy', 'application']);

        // Apply filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('remarks', 'like', "%{$search}%")
                  ->orWhereHas('application', function($appQuery) use ($search) {
                      $appQuery->where('application_number', 'like', "%{$search}%")
                               ->orWhere('first_name', 'like', "%{$search}%")
                               ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('date') && $request->date) {
            $dateFilter = $request->date;
            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('created_at', today());
                    break;
                case 'yesterday':
                    $query->whereDate('created_at', today()->subDay());
                    break;
                case 'week':
                    $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
                    break;
                case 'quarter':
                    $query->whereBetween('created_at', [now()->startOfQuarter(), now()->endOfQuarter()]);
                    break;
            }
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $history = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $history->items(),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'per_page' => $history->perPage(),
                'total' => $history->total()
            ]
        ]);
    }


    /**
     * Start technical review for an application
     */
    public function startTechnicalReview($id): JsonResponse
    {
        try {
            $application = ZoningApplication::findOrFail($id);
            
            // Check if application is in technical_review status
            if ($application->status !== 'technical_review') {
                return response()->json([
                    'success' => false,
                    'message' => 'Application is not in technical review status'
                ], 400);
            }

            // Check if technical review has already started
            if ($application->technical_review_started) {
                return response()->json([
                    'success' => false,
                    'message' => 'Technical review has already started'
                ], 400);
            }

            // Assign technical staff and start technical review
            $technicalStaffId = auth()->id() ?: 1; // Use authenticated user or default to 1
            
            $application->update([
                'technical_staff_id' => $technicalStaffId,
                'technical_review_started' => true,
            ]);

            // Create history entry
            ApplicationHistory::create([
                'zoning_application_id' => $application->id,
                'action' => 'technical_review_started',
                'remarks' => 'Technical review started by building department, technical staff assigned',
                'performed_by' => $technicalStaffId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Technical review started successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start technical review: ' . $e->getMessage()
            ], 500);
        }
    }
}
