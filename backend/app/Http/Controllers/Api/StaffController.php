<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required',
        'username' => 'required|unique:users',
        'ktp_number' => 'required|unique:users|size:16',
        'password' => 'required|min:6',
    ]);

    $staff = \App\Models\User::create([
        'name' => $validated['name'],
        'username' => $validated['username'],
        'ktp_number' => $validated['ktp_number'],
        'password' => bcrypt($validated['password']),
        'role' => 'staff',
    ]);

    \App\Models\Billing::create(['user_id' => $staff->id]);

    return response()->json(['message' => 'Staff dibuat', 'staff' => $staff], 201);
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
