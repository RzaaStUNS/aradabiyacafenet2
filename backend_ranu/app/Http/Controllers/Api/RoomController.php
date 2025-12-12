<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\UserSession; // Pastikan model UserSession ada
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule; // Tambahkan ini buat update

class RoomController extends Controller
{
    // GET /api/rooms
    public function index()
    {
        // Ambil semua room, urutkan A-Z
        // Kita tidak load 'activeSession' dulu biar aman dan data pasti muncul
        $rooms = Room::orderBy('name', 'asc')->get();
        
        return response()->json([
            'status' => true,
            'data' => $rooms
        ]);
    }

    public function show($id)
    {
        $room = Room::find($id);
        if (!$room) return response()->json(['message' => 'Not found'], 404);
        return response()->json(['status' => true, 'data' => $room]);
    }

    // POST /api/rooms
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:rooms',
            'type' => 'required|in:regular,premium', // Sesuaikan enum db
            'price' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $room = Room::create([
            'name' => $request->name,
            'type' => $request->type,
            'price' => $request->price,
            'is_available' => true,
        ]);

        return response()->json(['status' => true, 'message' => 'Room created', 'data' => $room], 201);
    }

    // PUT /api/rooms/{id}
    public function update(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) return response()->json(['message' => 'Not found'], 404);

        $validator = Validator::make($request->all(), [
            // Pakai Rule::unique biar bisa update diri sendiri
            'name' => ['required', 'string', Rule::unique('rooms')->ignore($id)],
            'type' => 'required|in:regular,premium',
            'price' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $room->update($request->only(['name', 'type', 'price']));

        return response()->json(['status' => true, 'message' => 'Room updated', 'data' => $room]);
    }

    // DELETE /api/rooms/{id}
    public function destroy($id)
    {
        $room = Room::find($id);
        if (!$room) return response()->json(['message' => 'Not found'], 404);

        // Cek apakah sedang dipakai (Optional, but good practice)
        // Pastikan nama kolom 'room_id' di tabel 'user_sessions' sesuai
        $isUsed = UserSession::where('room_id', $id)->where('status', 'active')->exists();
        if ($isUsed) {
            return response()->json(['status' => false, 'message' => 'Room sedang dipakai!'], 400);
        }

        $room->delete();
        return response()->json(['status' => true, 'message' => 'Room deleted']);
    }
}