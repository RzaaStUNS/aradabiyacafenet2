<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    // === RESTful CRUD (Untuk Admin) ===

    // GET /api/rooms → sudah ada (index)
    public function index()
    {
        $rooms = Room::with(['activeSession.user'])->get();
        return response()->json([
            'status' => true,
            'data' => $rooms
        ]);
    }

    public function show(string $id)
    {
        $room = Room::with(['activeSession.user'])->find($id);

        if (!$room) {
            return response()->json([
                'status' => false,
                'message' => 'Room tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $room
        ]);
    }

    // POST /api/rooms → Tambah Room Baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:rooms',
            'type' => 'required|in:regular,premium',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $room = Room::create([
            'name' => $request->name,
            'type' => $request->type,
            'is_available' => true,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Room berhasil ditambahkan',
            'data' => $room
        ], 201);
    }

    // PUT /api/rooms/{id} → Edit Room
    public function update(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['status' => false, 'message' => 'Room tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|unique:rooms,name,' . $id,
            'type' => 'sometimes|required|in:regular,premium',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $room->update($request->only(['name', 'type', 'is_available']));

        return response()->json([
            'status' => true,
            'message' => 'Room berhasil diperbarui',
            'data' => $room
        ]);
    }

    // DELETE /api/rooms/{id} → Hapus Room
    public function destroy($id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['status' => false, 'message' => 'Room tidak ditemukan'], 404);
        }

        // Opsional: Cegah hapus room yang sedang dipakai
        $activeSession = UserSession::where('room_id', $id)->where('status', 'active')->exists();
        if ($activeSession) {
            return response()->json([
                'status' => false,
                'message' => 'Tidak bisa hapus room yang sedang dipakai!'
            ], 400);
        }

        $room->delete();

        return response()->json([
            'status' => true,
            'message' => 'Room berhasil dihapus'
        ]);
    }
}
