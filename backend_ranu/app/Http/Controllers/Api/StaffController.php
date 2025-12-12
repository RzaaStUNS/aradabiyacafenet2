<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; // Tambahkan ini!
use App\Models\User;
use App\Models\Billing;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua user dengan role staff
        $staff = User::where('role', 'staff')->latest()->get();
        
        // Bungkus dalam 'data' agar sesuai dengan frontend (res.data.data)
        return response()->json([
            'status' => true,
            'message' => 'List Data Staff',
            'data' => $staff
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Gunakan Validator Facade (Bukan $request->validate)
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'username' => 'required|unique:users',
            'ktp_number' => 'required|unique:users|size:16', // Pastikan 16 digit
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        // 2. Cek apakah validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors() // Kirim pesan error detail
            ], 422);
        }

        // 3. Buat User Baru
        $staff = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'ktp_number' => $request->ktp_number,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'staff', // Paksa jadi staff
            'balance_time' => 0
        ]);

        // 4. Buat Billing terkait (Opsional, sesuai logika appmu)
        Billing::create(['user_id' => $staff->id]);

        return response()->json([
            'status' => true,
            'message' => 'Staff berhasil dibuat',
            'data' => $staff
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $staff = User::where('role', 'staff')->find($id);

        if (!$staff) {
            return response()->json([
                'status' => false,
                'message' => 'Staff tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $staff
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $staff = User::where('role', 'staff')->find($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff tidak ditemukan'], 404);
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

        // Update data (hanya jika ada di request)
        $staff->update([
            'name' => $request->name ?? $staff->name,
            'username' => $request->username ?? $staff->username,
            'ktp_number' => $request->ktp_number ?? $staff->ktp_number,
            'email' => $request->email ?? $staff->email,
            'password' => $request->password ? bcrypt($request->password) : $staff->password,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Staff diperbarui',
            'data' => $staff
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $staff = User::where('role', 'staff')->find($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff tidak ditemukan'], 404);
        }

        $staff->delete();

        return response()->json([
            'status' => true,
            'message' => 'Staff berhasil dihapus'
        ], 200);
    }
}