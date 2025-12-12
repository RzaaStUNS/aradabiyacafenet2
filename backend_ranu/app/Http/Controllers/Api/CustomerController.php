<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; // <--- INI WAJIB ADA
use App\Models\User;
use App\Models\Billing;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = User::where('role', 'customer')->latest()->get();
        return response()->json(['status' => true, 'data' => $customers]);
    }

    public function store(Request $request)
    {
        // Pakai Validator Facade agar method fails() jalan
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'username' => 'required|unique:users',
            'ktp_number' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $customer = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'ktp_number' => $request->ktp_number,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'customer',
            'balance_time' => 0
        ]);

        Billing::create(['user_id' => $customer->id]);

        return response()->json(['message' => 'Customer berhasil dibuat', 'data' => $customer], 201);
    }   

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = User::where('role', 'customer')->find($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer tidak ditemukan'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $customer
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $customer = User::where('role', 'customer')->find($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required',
            'username' => 'sometimes|required|unique:users,username,' . $id,
            'ktp_number' => 'sometimes|required|size:16|unique:users,ktp_number,' . $id,
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'sometimes|required|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()
            ], 422);
        }

        $customer->update([
            'name' => $request->name ?? $customer->name,
            'username' => $request->username ?? $customer->username,
            'ktp_number' => $request->ktp_number ?? $customer->ktp_number,
            'email' => $request->email ?? $customer->email,
            'password' => $request->password ? bcrypt($request->password) : $customer->password,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Customer diperbarui',
            'data' => $customer
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = User::where('role', 'customer')->find($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer tidak ditemukan'], 404);
        }
        
        // Hapus billing dulu kalau ada relasi
        if($customer->billing) {
            $customer->billing->delete();
        }

        $customer->delete();

        return response()->json([
            'status' => true,
            'message' => 'Customer berhasil dihapus'
        ], 200);
    }
}