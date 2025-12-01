<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username|max:50',
            'ktp_number' => 'required|string|unique:users,ktp_number|size:16',
            'email' => 'nullable|email|unique:users,email',
        ]);

        $customer = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'ktp_number' => $validated['ktp_number'],
            'email' => $validated['email'],
            'password' => Hash::make('123456'), // default, bisa diganti
            'role' => 'customer',
        ]);

        // Auto buat billing
        Billing::create([
            'user_id' => $customer->id,
            'regular_balance' => 0,
            'premium_balance' => 0,
        ]);

        return response()->json([
            'message' => 'Customer berhasil dibuat',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'username' => $customer->username,
                'ktp_number' => $customer->ktp_number,
                'email' => $customer->email,
            ]
        ], 201);
    }

    // Nanti tambah index, show, update, delete
}