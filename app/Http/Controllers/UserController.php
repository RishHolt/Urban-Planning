<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::query();
            
            // Filter by role if provided
            if ($request->has('role')) {
                $query->where('role', $request->get('role'));
            }
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }
            
            // Search functionality
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
            
            $users = $query->select('id', 'first_name', 'last_name', 'email', 'role', 'status', 'last_login_at')
                          ->where('role', '!=', 'CITIZEN') // Exclude citizens
                          ->orderBy('first_name')
                          ->get()
                          ->map(function($user) {
                              return [
                                  'id' => $user->id,
                                  'name' => trim($user->first_name . ' ' . $user->last_name),
                                  'email' => $user->email,
                                  'role' => $user->role,
                                  'status' => $user->status ?? 'Active',
                                  'lastLogin' => $user->last_login_at ? $user->last_login_at->format('Y-m-d') : 'Never'
                              ];
                          });
            
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function stats()
    {
        try {
            $totalUsers = User::where('role', '!=', 'CITIZEN')->count();
            $activeUsers = User::where('role', '!=', 'CITIZEN')
                               ->where('status', 'Active')
                               ->count();
            
            // Count admins (IT_ADMIN, ZONING_ADMIN, BUILDING_ADMIN, HOUSING_ADMIN, INFRASTRUCTURE_ADMIN)
            $admins = User::where('role', '!=', 'CITIZEN')
                          ->where('role', 'like', '%ADMIN%')
                          ->count();
            
            // Count officers (all non-admin, non-citizen roles)
            $officers = User::where('role', '!=', 'CITIZEN')
                            ->where('role', 'not like', '%ADMIN%')
                            ->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'admins' => $admins,
                    'officers' => $officers
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

