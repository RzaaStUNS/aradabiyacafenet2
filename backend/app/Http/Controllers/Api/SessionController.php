<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Room;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SessionController extends Controller
{
    // POST: Mulai Main (Start Billing)
    public function start(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'room_id' => 'required|exists:rooms,id',
        ]);

        $customer = User::find($validated['customer_id']);
        $room = Room::find($validated['room_id']);

        if (!in_array($customer->role, ['customer', 'admin'])) {
            return response()->json(['message' => 'Hanya customer atau admin yang bisa memulai sesi.'], 403);
        }

        if (!$room->is_available) {
            return response()->json(['message' => 'Ruangan/PC sedang dipakai!'], 400);
        }

        if ($customer->balance_time < 1) {
            return response()->json(['message' => 'Saldo waktu habis! Silakan Top Up dulu.'], 400);
        }

        $session = UserSession::create([
            'user_id' => $customer->id,
            'room_id' => $room->id,
            // 'billing_type_used' => $validated['type'], // Komentari dulu
            'start_time' => now(),
            'status' => 'active', // Ganti is_active dengan status
        ]);

        $room->update(['is_available' => false]);

        return response()->json([
            'status' => true,
            'message' => 'Billing Berjalan! Selamat Bermain.',
            'data' => [
                'session_id' => $session->id,
                'room' => $room->name,
                'sisa_waktu' => $customer->balance_time . ' Menit',
                'start_time' => $session->start_time,
            ]
        ], 201);
    }

    // POST: Stop Main (Stop Billing)
    public function end(Request $request, $sessionId)
    {
        $session = UserSession::with('user')->find($sessionId);

        if (!$session) {
            return response()->json(['message' => 'Sesi tidak ditemukan'], 404);
        }

        if ($session->status !== 'active') { // Ganti is_active dengan status
            return response()->json(['message' => 'Sesi ini sudah berakhir sebelumnya'], 400);
        }

        $endTime = now();
        $startTime = Carbon::parse($session->start_time);
        $minutesRaw = $endTime->diffInMinutes($startTime);
        $minutesUsed = $minutesRaw < 1 ? 1 : $minutesRaw;

        $user = $session->user;
        $saldoAwal = $user->balance_time;
        $sisaSaldo = max(0, $saldoAwal - $minutesUsed);

        $user->balance_time = $sisaSaldo;
        $user->save();

        $session->status = 'finished';
        $session->end_time = $endTime;
        $session->save();

        $room = Room::find($session->room_id);
        if ($room) {
            $room->is_available = true;
            $room->save();
        }

        return response()->json([
            'status' => true,
            'message' => 'Sesi Berakhir.',
            'debug_info' => [
                'saldo_awal' => $saldoAwal,
                'durasi_asli' => $minutesRaw,
                'durasi_dihitung' => $minutesUsed,
                'sisa_saldo_disimpan' => $sisaSaldo
            ]
        ]);
    }
}
