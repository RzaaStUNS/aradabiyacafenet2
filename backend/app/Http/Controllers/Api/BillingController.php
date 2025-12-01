<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class BillingController extends Controller
{
    // POST: Admin Top Up Saldo Customer
    public function topup(Request $request)
    {
        // 1. Validasi
        $validator = Validator::make($request->all(), [
            'username' => 'required|exists:users,username', // Cari user by username
            'amount' => 'required|integer|min:1000', // Minimal topup Rp 1.000
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        // 2. Konversi Uang ke Menit (Misal: Rp 1.000 = 10 Menit)
        // Rumus: (Nominal / 1000) * 10
        $minutesToAdd = ($request->amount / 1000) * 10; 

        // 3. Update User
        $user = User::where('username', $request->username)->first();
        
        // Tambahkan saldo lama dengan yang baru
        $user->balance_time += $minutesToAdd;
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Top Up Berhasil!',
            'data' => [
                'name' => $user->name,
                'added_minutes' => $minutesToAdd,
                'total_balance' => $user->balance_time
            ]
        ]);
    }
}