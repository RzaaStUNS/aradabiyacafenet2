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
            'type' => 'required|in:regular,premium', // Masih disimpan buat catat history, tapi saldo motong dari satu sumber
        ]);

        $customer = User::find($validated['customer_id']);
        $room = Room::find($validated['room_id']);

        // 1. Cek Role
        // (Opsional: kalau admin mau ngetes main, boleh dihapus if ini)
        if ($customer->role !== 'customer' && $customer->role !== 'admin') { 
             // Admin boleh main buat ngetes
        }

        // 2. Cek Room Tersedia
        if (!$room->is_available) {
            return response()->json(['message' => 'Ruangan/PC sedang dipakai!'], 400);
        }

        // 3. CEK SALDO (Pakai balance_time dari Model User kamu)
        if ($customer->balance_time < 1) {
            return response()->json(['message' => 'Saldo waktu habis! Silakan Top Up dulu.'], 400);
        }

        // 4. Buat Sesi
        $session = UserSession::create([
            'user_id' => $customer->id,
            'room_id' => $room->id,
            'billing_type_used' => $validated['type'],
            'start_time' => now(),
            'is_active' => true,
        ]);

        // 5. Update Status Room
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
    public function end($sessionId)
    {
        // Ambil sesi
        $session = UserSession::with('user')->find($sessionId);

        if (!$session) {
            return response()->json(['message' => 'Sesi tidak ditemukan'], 404);
        }

        if (!$session->is_active) {
            return response()->json(['message' => 'Sesi ini sudah berakhir sebelumnya'], 400);
        }

        $endTime = now();
        $startTime = \Carbon\Carbon::parse($session->start_time);
        
        // 1. Hitung Durasi
        // Kita pakai float dulu biar ketahuan kalau cuma main 30 detik (0.5 menit)
        $minutesRaw = $endTime->diffInMinutes($startTime);
        
        // PAKSA MINIMAL 1 MENIT (Walaupun baru main 5 detik)
        $minutesUsed = $minutesRaw < 1 ? 1 : $minutesRaw;

        // 2. POTONG SALDO (Versi Paksa Simpan)
        $user = $session->user;
        $saldoAwal = $user->balance_time;
        
        // Pastikan tidak minus
        $sisaSaldo = max(0, $saldoAwal - $minutesUsed);
        
        // Simpan cara manual (lebih aman daripada mass assignment)
        $user->balance_time = $sisaSaldo;
        $user->save(); 

        // 3. Matikan Sesi
        $session->is_active = false;
        $session->end_time = $endTime;
        $session->save();

        // 4. Buka Room
        $room = \App\Models\Room::find($session->room_id);
        if($room) {
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