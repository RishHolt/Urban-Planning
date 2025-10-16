<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/dashboard');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

Route::post('/login', function () {
    // Mock authentication - in real app, this would validate credentials
    return redirect('/dashboard');
})->name('login.post');

Route::group([], function () {
    Route::get('dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    
    // Zoning Clearance Routes
    Route::get('zoning', function () {
        return Inertia::render('ZoningDashboard');
    })->name('zoning.dashboard');
    
    // Building Review Routes
    Route::get('building', function () {
        return Inertia::render('BuildingDashboard');
    })->name('building.dashboard');
    
    // Housing Registry Routes
    Route::get('housing', function () {
        return Inertia::render('HousingDashboard');
    })->name('housing.dashboard');
    
    // Occupancy Monitoring Routes
    Route::get('occupancy', function () {
        return Inertia::render('OccupancyDashboard');
    })->name('occupancy.dashboard');
    
    // Infrastructure Routes
    Route::get('infrastructure', function () {
        return Inertia::render('InfrastructureDashboard');
    })->name('infrastructure.dashboard');
    
    // User Management Routes
    Route::get('user-management', function () {
        return Inertia::render('UserManagement');
    })->name('user-management');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
