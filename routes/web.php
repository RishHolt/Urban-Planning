<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Users/Home');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

// Citizen Portal Routes
Route::get('/citizen', function () {
    return Inertia::render('Users/Home');
})->name('citizen.home');


Route::get('/zoning-clearance/apply', function () {
    return Inertia::render('Users/Services/ZoningClearanceApplication');
})->name('zoning-clearance.apply');

Route::get('/my-applications', function () {
    return Inertia::render('Users/Services/MyApplications');
})->name('my-applications');

Route::get('/my-applications/{id}', function ($id) {
    return Inertia::render('Users/Services/ApplicationDetails');
})->name('my-applications.show');

// Housing Application Routes
Route::get('/housing-assistance/apply', function () {
    return Inertia::render('Users/Services/HousingApplication');
})->name('housing-assistance.apply');

Route::get('/my-housing-applications', function () {
    return Inertia::render('Users/Services/MyHousingApplications');
})->name('my-housing-applications');

Route::get('/my-housing-applications/{id}', function ($id) {
    return Inertia::render('Users/Services/HousingApplicationDetails', ['applicationId' => $id]);
})->name('my-housing-applications.show');

// Public Zoning Map Route
Route::get('/zoning/map', function () {
    return Inertia::render('Users/Services/ZoningMap');
})->name('zoning.map.public');

// CSRF Token endpoint
Route::get('/api/csrf-token', function () {
    return response()->json([
        'csrf_token' => csrf_token()
    ]);
})->middleware('web');

// API Routes for Authentication (using web middleware for sessions, but CSRF disabled)
Route::prefix('api/auth')->middleware('web')->group(function () {
    Route::post('/login', [App\Http\Controllers\Auth\AuthController::class, 'login']);
    Route::post('/verify-otp', [App\Http\Controllers\Auth\AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [App\Http\Controllers\Auth\AuthController::class, 'resendOtp']);
    Route::get('/me', [App\Http\Controllers\Auth\AuthController::class, 'me'])->middleware('auth');
    Route::post('/logout', [App\Http\Controllers\Auth\AuthController::class, 'logout'])->middleware('auth');
});

// API Routes for Zoning (moved to api middleware group)
Route::prefix('api')->middleware('api')->group(function () {
    // Zones
    Route::get('/zones', [App\Http\Controllers\ZoningController::class, 'getZones']);
    Route::post('/zones', [App\Http\Controllers\ZoningController::class, 'createZone']);
    Route::put('/zones/{id}', [App\Http\Controllers\ZoningController::class, 'updateZone']);
    Route::delete('/zones/{id}', [App\Http\Controllers\ZoningController::class, 'deleteZone']);
    Route::delete('/zones/clear/{cityId}', [App\Http\Controllers\ZoningController::class, 'clearZones']);
    
    // Zone Types
    Route::get('/zone-types', [App\Http\Controllers\ZoneTypeController::class, 'getZoneTypes']);
    Route::post('/zone-types', [App\Http\Controllers\ZoneTypeController::class, 'createZoneType']);
    Route::put('/zone-types/{id}', [App\Http\Controllers\ZoneTypeController::class, 'updateZoneType']);
    Route::delete('/zone-types/{id}', [App\Http\Controllers\ZoneTypeController::class, 'deleteZoneType']);
    
    // Regions
    Route::get('/regions', [App\Http\Controllers\RegionController::class, 'getRegions']);
    Route::post('/regions', [App\Http\Controllers\RegionController::class, 'createRegion']);
    Route::put('/regions/{id}', [App\Http\Controllers\RegionController::class, 'updateRegion']);
    Route::delete('/regions/{id}', [App\Http\Controllers\RegionController::class, 'deleteRegion']);
    
    // Export
    Route::get('/export/{cityId}', function ($cityId) {
        return response()->json([
            'totalZones' => 0,
            'totalZoneTypes' => 4,
            'totalRegions' => 3,
            'cityId' => $cityId,
            'exportedAt' => now()->toISOString()
        ]);
    });
    
    // Zoning Clearance Application
    Route::get('/barangay-clearance/validate/{clearanceId}', function ($clearanceId) {
        // Mock validation - in real app, this would check against database
        $validClearances = ['BC001', 'BC002', 'BC003', 'BC004', 'BC005'];
        
        if (in_array($clearanceId, $validClearances)) {
            return response()->json([
                'valid' => true,
                'clearanceId' => $clearanceId,
                'issuedDate' => '2024-01-15',
                'expiryDate' => '2024-12-31',
                'barangay' => 'Barangay Sample',
                'applicant' => 'Sample Applicant'
            ]);
        }
        
        return response()->json([
            'valid' => false,
            'message' => 'Invalid clearance ID'
        ], 404);
    });

    // Zoning Applications - Admin and Citizen access
    Route::get('/zoning/applications', [App\Http\Controllers\ZoningApplicationController::class, 'index'])->middleware('web');
    Route::get('/zoning/applications/{id}', [App\Http\Controllers\ZoningApplicationController::class, 'show'])->middleware('web');
    Route::put('/zoning/applications/{id}', [App\Http\Controllers\ZoningApplicationController::class, 'update']);
    Route::post('/zoning/applications/{id}/confirm-location', [App\Http\Controllers\ZoningApplicationController::class, 'confirmLocation']);
    
    // Payment testing
    Route::post('/zoning/applications/{applicationId}/payment/confirm', 
        [App\Http\Controllers\ZoningApplicationController::class, 'confirmPayment']);
    Route::post('/zoning/applications/{applicationId}/payment/unpay', 
        [App\Http\Controllers\ZoningApplicationController::class, 'unpayPayment']);
    
    // Workflow transitions
    Route::post('/zoning/applications/{applicationId}/start-initial-review', 
        [App\Http\Controllers\ZoningApplicationController::class, 'startInitialReview']);
    Route::post('/zoning/applications/{applicationId}/forward-to-technical', 
        [App\Http\Controllers\ZoningApplicationController::class, 'forwardToTechnical']);
    Route::post('/zoning/applications/{applicationId}/return-to-zoning', 
        [App\Http\Controllers\ZoningApplicationController::class, 'returnToZoning']);
    Route::post('/zoning/applications/{applicationId}/approve', 
        [App\Http\Controllers\ZoningApplicationController::class, 'approve']);
    
    // Document review
    Route::post('/zoning/applications/{applicationId}/documents/{documentId}/verify', 
        [App\Http\Controllers\ZoningApplicationController::class, 'verifyDocument']);
    Route::post('/zoning/applications/{applicationId}/documents/{documentId}/reject', 
        [App\Http\Controllers\ZoningApplicationController::class, 'rejectDocument']);
    Route::get('/zoning/applications/{applicationId}/documents/{documentId}/download', 
        [App\Http\Controllers\ZoningApplicationController::class, 'downloadDocument']);
    Route::post('/zoning/applications/{applicationId}/documents/{documentId}/reupload', 
        [App\Http\Controllers\ZoningApplicationController::class, 'reuploadDocument']);
    
    // History
    Route::get('/zoning/applications/{applicationId}/history', 
        [App\Http\Controllers\ZoningApplicationController::class, 'getHistory']);
    
    // Users
    Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
    
    // Zoning Map Data
    Route::get('/zoning/zones', [App\Http\Controllers\ZoningController::class, 'getZones']);
    Route::get('/zoning/zone-types', [App\Http\Controllers\ZoneTypeController::class, 'getZoneTypes']);
    
    
    Route::post('/zoning-clearance/applications', [App\Http\Controllers\ZoningApplicationController::class, 'store']);
});

// API routes without CSRF protection
Route::middleware('api')->group(function () {
    // Zone management routes
    Route::get('/api/zones', [App\Http\Controllers\ZoningController::class, 'getZones']);
    Route::post('/api/zones', [App\Http\Controllers\ZoningController::class, 'store']);
    Route::put('/api/zones/{id}', [App\Http\Controllers\ZoningController::class, 'update']);
    Route::delete('/api/zones/{id}', [App\Http\Controllers\ZoningController::class, 'destroy']);
    Route::delete('/api/zones/clear/{cityId}', [App\Http\Controllers\ZoningController::class, 'clearCityZones']);
    
    // Zone type management routes
    Route::get('/api/zone-types', [App\Http\Controllers\ZoneTypeController::class, 'getZoneTypes']);
    Route::post('/api/zone-types', [App\Http\Controllers\ZoneTypeController::class, 'store']);
    Route::put('/api/zone-types/{id}', [App\Http\Controllers\ZoneTypeController::class, 'update']);
    Route::delete('/api/zone-types/{id}', [App\Http\Controllers\ZoneTypeController::class, 'destroy']);
});

Route::post('/login', function () {
    // Mock authentication - in real app, this would validate credentials
    return redirect('/Dashboard');
})->name('login.post');

Route::group([], function () {
    Route::get('dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
    // Zoning Clearance Routes
    Route::get('zoning', function () {
        return Inertia::render('Admin/Module-1/ZoningDashboard');
    })->name('zoning.dashboard');
    
    Route::get('zoning/applications', function () {
        return Inertia::render('Admin/Module-1/ZoningApplicationsTable');
    })->name('zoning.applications');
    
    Route::get('zoning/applications/{id}', function ($id) {
        return Inertia::render('Admin/Module-1/ZoningApplicationDetails', [
            'applicationId' => (int) $id
        ]);
    })->name('zoning.applications.show');
    
    Route::get('zoning/admin/map', function () {
        return Inertia::render('Admin/Module-1/ZoningMap');
    })->name('zoning.admin.map');
    
    // Housing Application Route
    Route::get('housing/apply', function () {
        return Inertia::render('Users/Services/HousingApplication');
    })->name('housing.apply');
    
    Route::get('zoning/logs', function () {
        return Inertia::render('Admin/Module-1/ZoningLogs');
    })->name('zoning.logs');
    
    // Application Logs
    Route::get('admin/logs', function () {
        return Inertia::render('Admin/ApplicationLogs');
    })->name('admin.logs');
    
    // Building Review Routes
    Route::get('building', function () {
        return Inertia::render('Admin/BuildingDashboard');
    })->name('building.dashboard');
    
Route::get('building/review', function () {
    return Inertia::render('Admin/Module-2/BuildingReviewList');
})->name('building.review.list');

Route::get('building/review/{id}', function ($id) {
    return Inertia::render('Admin/Module-2/BuildingReview', ['applicationId' => $id]);
})->name('building.review');

Route::get('building/logs', function () {
    return Inertia::render('Admin/Module-2/BuildingLogs');
})->name('building.logs');
    
    // Housing Registry Routes (Module-3)
    Route::get('housing', function () {
        return Inertia::render('Admin/Module-3/HousingDashboard');
    })->name('housing.dashboard');
    
    Route::get('housing/applications', function () {
        return Inertia::render('Admin/Module-3/HousingApplicationsList');
    })->name('housing.applications');
    
    Route::get('housing/applications/{id}', function ($id) {
        return Inertia::render('Admin/Module-3/HousingApplicationReview', ['applicationId' => $id]);
    })->name('housing.applications.show');
    
    Route::get('housing/documents', function () {
        return Inertia::render('Admin/Module-3/DocumentVerification');
    })->name('housing.documents');
    
    Route::get('housing/inspections', function () {
        return Inertia::render('Admin/Module-3/Inspections');
    })->name('housing.inspections');
    
    
    Route::get('housing/logs', function () {
        return Inertia::render('Admin/Module-3/HousingLogs');
    })->name('housing.logs');
    
    // User Management Routes
    Route::get('user-management', function () {
        return Inertia::render('Admin/UserManagement');
    })->name('user-management');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
