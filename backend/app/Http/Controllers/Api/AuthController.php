<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    //
    public function login(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    $user = User::where('username', $request->username)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'username' => ['Username atau password salah.'],
        ]);
    }

    if (!in_array($user->role, ['admin', 'staff'])) {
        throw ValidationException::withMessages([
            'username' => ['Hanya admin/staff yang bisa login.'],
        ]);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'message' => 'Login berhasil',
        'user' => $user->only(['id', 'name', 'username', 'role']),
        'token' => $token,
    ]);
}
}
