<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator; // Tambahan wajib buat gaya dosen

class AuthController extends Controller
{
    // LOGIKA LOGIN
    public function login(Request $request)
    {
        // 1. Validasi Input (Gaya Dosen pakai Validator::make)
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Kalau validasi gagal, kirim error gaya dosen (status: false)
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Cari User berdasarkan Username
        $user = User::where('username', $request->username)->first();

        // 3. Cek Password
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false, // Penting buat frontend ngecek error
                'message' => 'Username atau password salah.'
            ], 401);
        }

        // 4. Buat Token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Kirim Respon (Format JSON standar dosen: ada status, message, data)
        return response()->json([
            'status' => true,
            'message' => 'Login berhasil',
            'data' => [ // Data user dibungkus dalam 'data'
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'role' => $user->role,
                    'balance_time' => $user->balance_time,
                ],
                'token' => $token,
            ],
        ], 200);
    }
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'password' => bcrypt($request->password),
            'role' => 'customer',
            'balance_time' => 0 // Saldo awal 0
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Registrasi Berhasil',
            'data' => $user
        ], 201);
    }

    // LOGIKA LOGOUT
    public function logout(Request $request)
    {
        // Hapus token yang sedang dipakai
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil.'
        ], 200);
    }
}