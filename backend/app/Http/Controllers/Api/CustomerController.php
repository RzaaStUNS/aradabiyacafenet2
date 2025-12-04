<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Billing;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $customers = User::where('role', 'customer')->get();
        return response()->json($customers);
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

        $customer = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'ktp_number' => $validated['ktp_number'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'customer',
            'balance_time' => 0
        ]);

        Billing::create(['user_id' => $customer->id]);

        return response()->json(['message' => 'Customer berhasil dibuat', 'customer' => $customer], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = User::where('role', 'customer')
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'username' => $customer->username,
            'ktp_number' => $customer->ktp_number,
            'email' => $customer->email,
            'role' => $customer->role,
            'created_at' => $customer->created_at,
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

        $customer = User::where('role', 'customer')->findOrFail($id);

        $customer->update([
            'name' => $validated['name'] ?? $customer->name,
            'username' => $validated['username'] ?? $customer->username,
            'ktp_number' => $validated['ktp_number'] ?? $customer->ktp_number,
            'email' => $validated['email'] ?? $customer->email,
            'password' => isset($validated['password']) ? bcrypt($validated['password']) : $customer->password,
        ]);

        return response()->json([
            'message' => 'Customer diperbarui',
            'customer' => $customer->only(['id', 'name', 'username', 'ktp_number', 'email', 'role'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        
        $customer->billing?->delete();

        $customer->delete();

        return response()->json([
            'message' => 'Customer berhasil dihapus'
        ], 200);
    }
}