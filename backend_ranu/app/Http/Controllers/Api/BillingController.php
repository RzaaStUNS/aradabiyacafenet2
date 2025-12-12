<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Order; // Tambahkan Model Order
use Carbon\Carbon;

class BillingController extends Controller
{
    public function topup(Request $request)
    {
        // 1. Validasi
        $validator = Validator::make($request->all(), [
            'username' => 'required|exists:users,username',
            'amount'   => 'required|numeric|min:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        // 2. Cari User
        $user = User::where('username', $request->username)->first();

        // 3. Tambah Saldo
        $user->balance_time += $request->amount;
        $user->save();

        // 4. 🔥 PENTING: Buat Riwayat Transaksi (Agar muncul di Staff/Customer) 🔥
        Order::create([
            'user_id' => $user->id,
            'type' => 'topup',          // Tandai sebagai topup
            'total_price' => $request->amount,
            'status' => 'paid',         // Langsung LUNAS karena topup di kasir
            'payment_method' => 'cash',
            'note' => 'Top Up Saldo via Kasir',
            'created_at' => Carbon::now(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Top Up Berhasil & Tercatat!',
            'data' => [
                'username' => $user->username,
                'new_balance' => $user->balance_time
            ]
        ], 200);
    }
}