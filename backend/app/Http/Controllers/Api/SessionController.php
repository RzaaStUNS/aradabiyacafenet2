<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Room;
use App\Models\UserSession;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function start(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'room_id' => 'required|exists:rooms,id',
            'type' => 'required|in:regular,premium',
        ]);

        $customer = User::find($validated['customer_id']);
        $room = Room::find($validated['room_id']);

        // Cek role customer
        if ($customer->role !== 'customer') {
            return response()->json(['message' => 'Bukan customer'], 400);
        }

        // Cek PC tersedia
        if (!$room->is_available) {
            return response()->json(['message' => 'PC tidak tersedia'], 400);
        }

        // Cek saldo
        $balance = $customer->billing->{$validated['type'] . '_balance'};
if ($balance < 1) {
    return response()->json(['message' => 'Saldo waktu habis'], 400);
}

        // Mulai sesi
        $session = UserSession::create([
            'user_id' => $customer->id,
            'room_id' => $room->id,
            'billing_type_used' => $validated['type'],
            'start_time' => now(),
            'is_active' => true,
        ]);

        // Tandai PC dipakai
        $room->update(['is_available' => false]);

        return response()->json([
            'message' => 'Sesi dimulai',
            'session_id' => $session->id,
            'room' => $room->name,
            'start_time' => $session->start_time,
        ], 201);
    }
    public function end($sessionId)
{
    $session = UserSession::findOrFail($sessionId);

    if (!$session->is_active) {
        return response()->json(['message' => 'Sesi sudah berakhir'], 400);
    }

    $session->update([
        'is_active' => false,
        'end_time' => now(),
    ]);

    $session->room->update(['is_available' => true]);

    return response()->json(['message' => 'Sesi diakhiri']);
}
}