<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\UserSession;
use App\Models\User;
use App\Models\Room;
use App\Models\Order;
use Carbon\Carbon;

class SessionController extends Controller
{
    /**
     * Get active sessions dengan AUTO STOP logic
     */
    public function index()
    {
        $sessions = UserSession::with(['user', 'room'])
            ->whereNull('end_time')
            ->orderBy('created_at', 'desc')
            ->get();

        $now = Carbon::now('Asia/Jakarta');
        $formatted = [];

        foreach ($sessions as $s) {
            $start = Carbon::parse($s->start_time);
            $elapsedHours = $now->diffInSeconds($start) / 3600;

            // Ambil durasi booking (bisa dari kolom duration atau duration_hours)
            $duration = $s->duration_hours ?? $s->duration ?? 1;

            // ===== AUTO STOP LOGIC dengan BILLING =====
            if ($elapsedHours >= $duration) {
                try {
                    DB::beginTransaction();

                    // 1. Hitung biaya total
                    $room = $s->room;
                    $totalCost = $room->price * $duration;

                    // 2. Update session (end session)
                    $s->end_time = $now;
                    $s->status = 'finished';
                    $s->save();

                    // 3. Potong saldo user
                    $user = $s->user;
                    if ($user->balance_time >= $totalCost) {
                        $user->balance_time -= $totalCost;
                        $user->save();
                    }

                    // 4. Buat order untuk revenue tracking
                    Order::create([
                        'user_id' => $user->id,
                        'room_id' => $room->id,
                        'type' => 'rental',
                        'duration' => $duration,
                        'total_price' => $totalCost,
                        'status' => 'paid',
                        'note' => "Auto-stop {$room->name} - {$duration} jam"
                    ]);

                    DB::commit();

                    // JANGAN kirim ke frontend karena sudah selesai
                    continue;

                } catch (\Exception $e) {
                    DB::rollBack();
                    \Log::error("Auto-stop error session {$s->id}: " . $e->getMessage());
                    // Tetap lanjutkan loop
                    continue;
                }
            }

            // Kirim session yang masih aktif ke frontend
            $formatted[] = [
                'id' => $s->id,
                'room_id' => $s->room_id,
                'user_id' => $s->user_id,
                'start_time' => $s->start_time,
                'duration' => $duration, // Kirim durasi booking
                'elapsed_hours' => round($elapsedHours, 2),
                'customer' => $s->user,
                'room' => $s->room
            ];
        }

        return response()->json([
            'status' => true,
            'data' => $formatted
        ]);
    }

    /**
     * Start new session
     */
    public function start(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'room_id' => 'required|exists:rooms,id',
            'duration_hours' => 'required|integer|min:1|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Cek apakah room sedang dipakai
            $isBusy = UserSession::where('room_id', $request->room_id)
                ->whereNull('end_time')
                ->exists();

            if ($isBusy) {
                return response()->json([
                    'status' => false,
                    'message' => 'PC sedang digunakan!'
                ], 400);
            }

            // 2. Cek saldo user
            $user = User::find($request->user_id);
            $room = Room::find($request->room_id);
            $totalCost = $room->price * $request->duration_hours;

            if ($user->balance_time < $totalCost) {
                return response()->json([
                    'status' => false,
                    'message' => "Saldo tidak cukup! Butuh Rp {$totalCost}, saldo Rp {$user->balance_time}"
                ], 400);
            }

            // 3. Buat session baru
            $session = UserSession::create([
                'user_id' => $request->user_id,
                'room_id' => $request->room_id,
                'start_time' => Carbon::now('Asia/Jakarta'),
                'duration_hours' => $request->duration_hours,
                'duration' => $request->duration_hours, // Isi juga kolom duration jika ada
                'status' => 'active'
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Session berhasil dimulai!',
                'data' => $session->load(['user', 'room'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Gagal start session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Stop session (manual stop)
     */
    public function end(Request $request)
    {
        $id = $request->id ?? $request->session_id;
        $session = UserSession::find($id);

        if (!$session) {
            return response()->json([
                'status' => false,
                'message' => 'Session tidak ditemukan'
            ], 404);
        }

        if ($session->end_time) {
            return response()->json([
                'status' => false,
                'message' => 'Session sudah selesai'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $now = Carbon::now('Asia/Jakarta');
            $start = Carbon::parse($session->start_time);
            $elapsedHours = $now->diffInSeconds($start) / 3600;

            // 1. Hitung biaya berdasarkan durasi ACTUAL (bukan booking)
            $room = $session->room;
            
            // Gunakan durasi booking atau elapsed, mana yang lebih besar
            $duration = $session->duration_hours ?? $session->duration ?? 1;
            $billableHours = max(ceil($elapsedHours), $duration); // Minimal bayar sesuai booking
            
            $totalCost = $room->price * $billableHours;

            // 2. Update session
            $session->end_time = $now;
            $session->status = 'finished';
            $session->save();

            // 3. Potong saldo user
            $user = $session->user;
            if ($user->balance_time >= $totalCost) {
                $user->balance_time -= $totalCost;
                $user->save();
            }

            // 4. Buat order untuk tracking
            Order::create([
                'user_id' => $user->id,
                'room_id' => $room->id,
                'type' => 'rental',
                'duration' => $billableHours,
                'total_price' => $totalCost,
                'status' => 'paid',
                'note' => "Manual stop {$room->name} - {$billableHours} jam"
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => "Session dihentikan. Biaya: Rp {$totalCost}",
                'data' => [
                    'elapsed_hours' => round($elapsedHours, 2),
                    'billable_hours' => $billableHours,
                    'total_cost' => $totalCost,
                    'remaining_balance' => $user->balance_time
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Gagal stop session: ' . $e->getMessage()
            ], 500);
        }
    }
}