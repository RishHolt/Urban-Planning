<?php

namespace App\Http\Controllers;

use App\Models\ZoningApplication;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ZoningApplicationController extends Controller
{
    /**
     * Display a listing of applications with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = ZoningApplication::with(['assignedStaff', 'documents', 'locationConfirmedBy']);

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
            ]
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
            'or_reference_number' => 'required|string|max:255',
            'or_date' => 'required|date',
            'payment_status' => 'required|string|in:pending,confirmed',
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
            $application = ZoningApplication::create($request->all());

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
        $application = ZoningApplication::with(['assignedStaff', 'documents', 'locationConfirmedBy'])
            ->findOrFail($id);

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
}
