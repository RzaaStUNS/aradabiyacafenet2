<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\User;
use App\Models\UserSession; // Pastikan model ini ada
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    // 1. Lihat Status Semua Room (Monitoring)
    public function index()
    {
        // Ambil room beserta sesi yang aktif (kalau ada)
        $rooms = Room::with(['activeSession.user'])->get();
        
        return response()->json([
            'status' => true,
            'data' => $rooms
        ]);
    }

    // 2. Mulai Sewa (Check-in)
    public function startSession(Request $request, $id)
    {
        $room = Room::find($id);
        $user = User::where('username', $request->username)->first();

        if (!$user) return response()->json(['message' => 'User tidak ditemukan'], 404);
        if ($user->balance_time <= 0) return response()->json(['message' => 'Saldo habis! Top up dulu.'], 400);
        
        // Cek apakah room sedang dipakai
        $activeSession = UserSession::where('room_id', $id)->where('status', 'active')->first();
        if ($activeSession) return response()->json(['message' => 'Room sedang dipakai!'], 400);

        // Buat Sesi Baru
        UserSession::create([
            'user_id' => $user->id,
            'room_id' => $id,
            'start_time' => now(),
            'status' => 'active'
        ]);

        // Update status room jadi tidak available
        $room->update(['is_available' => false]);

        return response()->json(['status' => true, 'message' => 'Sesi Dimulai!']);
    }

    // 3. Stop Sewa (Check-out)
    public function stopSession($id)
    {
        $session = UserSession::where('room_id', $id)->where('status', 'active')->first();
        if (!$session) return response()->json(['message' => 'Tidak ada sesi aktif'], 404);

        $endTime = now();
        $startTime = \Carbon\Carbon::parse($session->start_time);
        
        // Hitung durasi dalam menit
        $duration = $startTime->diffInMinutes($endTime);
        // Minimal bayar 1 menit meski baru buka sebentar
        if ($duration < 1) $duration = 1; 

        // Kurangi Saldo User
        $user = User::find($session->user_id);
        $user->balance_time -= $duration;
        $user->save();

        // Tutup Sesi
        $session->update([
            'end_time' => $endTime,
            'status' => 'finished'
        ]);

        // Room jadi available lagi
        $room = Room::find($id);
        $room->update(['is_available' => true]);

        return response()->json([
            'status' => true, 
            'message' => 'Sesi Selesai',
            'details' => [
                'duration' => $duration . ' Menit',
                'sisa_saldo' => $user->balance_time
            ]
        ]);
    }
}