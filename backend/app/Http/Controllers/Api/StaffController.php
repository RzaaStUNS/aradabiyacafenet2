<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Billing;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $staff = User::where('role', 'staff')->get();
        return response()->json($staff);
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
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        if ($request->fails()) {
            return response()->json(['status' => false, 'message' => $request->errors()], 422);
        }

        $staff = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'ktp_number' => $validated['ktp_number'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'staff',
            'balance_time' => 0
        ]);

        Billing::create(['user_id' => $staff->id]);

        return response()->json(['message' => 'Staff berhasil dibuat', 'staff' => $staff], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $staff = User::where('role', 'staff')
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'id' => $staff->id,
            'name' => $staff->name,
            'username' => $staff->username,
            'ktp_number' => $staff->ktp_number,
            'role' => $staff->role,
            'created_at' => $staff->created_at,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required',
            'username' => 'sometimes|required|unique:users,username,' . $id,
            'ktp_number' => 'sometimes|required|unique:users,ktp_number,' . $id . '|size:16',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'sometimes|required|min:6',
        ]);

        $staff = User::where('role', 'staff')->findOrFail($id);

        $staff->update([
            'name' => $validated['name'] ?? $staff->name,
            'username' => $validated['username'] ?? $staff->username,
            'ktp_number' => $validated['ktp_number'] ?? $staff->ktp_number,
            'email' => $validated['email'] ?? $staff->email,
            'password' => isset($validated['password']) ? bcrypt($validated['password']) : $staff->password,
        ]);

        return response()->json([
            'message' => 'Staff diperbarui',
            'staff' => $staff->only(['id', 'name', 'username', 'ktp_number', 'email', 'role'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $staff = User::where('role', 'staff')->findOrFail($id);
        $staff->delete();

        return response()->json([
            'message' => 'Staff berhasil dihapus'
        ], 200);
    }
}
