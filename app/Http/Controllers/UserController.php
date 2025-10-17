<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

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
            
            $users = $query->select('id', 'first_name', 'last_name', 'email', 'role')
                          ->where('role', '!=', 'CITIZEN') // Exclude citizens
                          ->orderBy('first_name')
                          ->get();
            
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
}

