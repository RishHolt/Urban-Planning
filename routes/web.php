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

Route::get('/services/aics', function () {
    return Inertia::render('Users/Services/AICS');
})->name('services.aics');

Route::get('/services/ccswdd', function () {
    return Inertia::render('Users/Services/CCSWDD');
})->name('services.ccswdd');

Route::get('/services/osca', function () {
    return Inertia::render('Users/Services/OSCA');
})->name('services.osca');

Route::get('/services/pdao', function () {
    return Inertia::render('Users/Services/PDAO');
})->name('services.pdao');

Route::get('/services/livelihood', function () {
    return Inertia::render('Users/Services/Livelihood');
})->name('services.livelihood');

// CSRF Token endpoint
Route::get('/api/csrf-token', function () {
    return response()->json([
        'csrf_token' => csrf_token()
    ]);
})->middleware('web');

// API Routes for Authentication (with CSRF protection)
Route::prefix('api/auth')->middleware('web')->group(function () {
    Route::post('/login', [App\Http\Controllers\Auth\AuthController::class, 'login']);
    Route::post('/verify-otp', [App\Http\Controllers\Auth\AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [App\Http\Controllers\Auth\AuthController::class, 'resendOtp']);
    Route::get('/me', [App\Http\Controllers\Auth\AuthController::class, 'me'])->middleware('auth');
    Route::post('/logout', [App\Http\Controllers\Auth\AuthController::class, 'logout'])->middleware('auth');
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
        return Inertia::render('Admin/ZoningDashboard');
    })->name('zoning.dashboard');
    
    // Building Review Routes
    Route::get('building', function () {
        return Inertia::render('Admin/BuildingDashboard');
    })->name('building.dashboard');
    
    // Housing Registry Routes
    Route::get('housing', function () {
        return Inertia::render('Admin/HousingDashboard');
    })->name('housing.dashboard');
    
    // Occupancy Monitoring Routes
    Route::get('occupancy', function () {
        return Inertia::render('Admin/OccupancyDashboard');
    })->name('occupancy.dashboard');
    
    // Infrastructure Routes
    Route::get('infrastructure', function () {
        return Inertia::render('Admin/InfrastructureDashboard');
    })->name('infrastructure.dashboard');
    
    // User Management Routes
    Route::get('user-management', function () {
        return Inertia::render('Admin/UserManagement');
    })->name('user-management');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
