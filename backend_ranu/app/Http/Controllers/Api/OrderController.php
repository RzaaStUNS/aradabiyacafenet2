<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // GET: List Order
    public function index(Request $request)
    {
        $query = Order::with(['items.menu', 'user', 'customer', 'room'])
            ->orderBy('created_at', 'desc');

        // Customer cuma lihat order sendiri
        if ($request->user() && $request->user()->role === 'customer') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json([
            'status' => true,
            'data' => $query->get()
        ]);
    }

    // POST: Buat Pesanan
    public function store(Request $request)
    {
        $user = $request->user();
        $type = $request->type ?? 'food';

        /*
        |--------------------------------------------------------------------------
        | FOOD ORDER
        |--------------------------------------------------------------------------
        */
        if ($type === 'food') {
            $validator = Validator::make($request->all(), [
                'items' => 'required'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()
                ], 422);
            }

            try {
                DB::beginTransaction();

                $itemsData = is_string($request->items)
                    ? json_decode($request->items, true)
                    : $request->items;

                // Hitung total dari database
                $calculatedTotal = 0;
                foreach ($itemsData as $item) {
                    $menu = Menu::find($item['id']);
                    if ($menu) {
                        $calculatedTotal += $menu->price * $item['qty'];
                    }
                }

                // ✅ VALIDASI saldo (tapi JANGAN potong dulu!)
                if ($user->balance_time < $calculatedTotal) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Saldo tidak cukup!'
                    ], 400);
                }

                // ✅ SIMPAN ORDER dengan status PENDING
                $order = Order::create([
                    'user_id' => $user->id,
                    'room_id' => $request->room_id,
                    'type' => 'food',
                    'total_price' => $calculatedTotal,
                    'status' => 'pending', // ← FIX: pending dulu, biar masuk staff orders
                    'note' => $request->note,
                ]);

                // Simpan detail item
                foreach ($itemsData as $item) {
                    $menu = Menu::find($item['id']);
                    if ($menu) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'menu_id' => $menu->id,
                            'quantity' => $item['qty'],
                            'price' => $menu->price,
                            'subtotal' => $menu->price * $item['qty']
                        ]);
                    }
                }

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Pesanan makanan berhasil dikirim ke staff!',
                    'data' => $order
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Gagal: ' . $e->getMessage()
                ], 500);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | RENTAL (SEWA PC)
        |--------------------------------------------------------------------------
        */
        else {
            $totalCost = $request->total_price ?? $request->total;

            // ✅ VALIDASI saldo (tapi JANGAN potong dulu!)
            if ($user->balance_time < $totalCost) {
                return response()->json([
                    'status' => false,
                    'message' => 'Saldo tidak cukup!'
                ], 400);
            }

            try {
                DB::beginTransaction();

                // ✅ SIMPAN ORDER dengan status PENDING
                $order = Order::create([
                    'user_id' => $user->id,
                    'room_id' => $request->room_id,
                    'type' => $type,
                    'total_price' => $totalCost,
                    'duration' => $request->duration ?? 1,
                    'status' => 'pending', // ← FIX: pending dulu
                    'note' => $request->note,
                ]);

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Booking berhasil dikirim ke staff!',
                    'data' => $order
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Gagal: ' . $e->getMessage()
                ], 500);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS ORDER (STAFF)
    |--------------------------------------------------------------------------
    */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        $newStatus = $request->status;

        try {
            DB::beginTransaction();

            // ✅ STAFF KLAIM ORDER (pending → processing)
            if ($newStatus === 'processing') {
                // Untuk rental, mulai session
                if ($order->type === 'rental') {
                    // Cek PC sedang dipakai atau tidak
                    $busy = \App\Models\UserSession::where('room_id', $order->room_id)
                        ->whereNull('end_time')
                        ->exists();

                    if ($busy) {
                        return response()->json([
                            'status' => false,
                            'message' => 'PC sedang digunakan'
                        ], 400);
                    }

                    // Mulai sesi baru
                    $session = \App\Models\UserSession::create([
                        'user_id' => $order->user_id,
                        'room_id' => $order->room_id,
                        'start_time' => now(),
                        'duration_hours' => $order->duration ?? 1,
                        'status' => 'active'
                    ]);
                }

                $order->status = 'processing';
                $order->save();

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Order diklaim!',
                    'data' => $order
                ]);
            }

            // ✅ STAFF SELESAIKAN ORDER (processing → completed)
            if ($newStatus === 'completed' || $newStatus === 'done') {
                $user = $order->customer ?? $order->user;
                $totalPrice = $order->total_price;

                // Validasi saldo lagi (safety check)
                if ($user->balance_time < $totalPrice) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => 'Saldo customer tidak cukup!'
                    ], 400);
                }

                // ✅ POTONG SALDO DI SINI (saat order completed)
                $user->balance_time -= $totalPrice;
                $user->save();

                $order->status = 'completed';
                $order->save();

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Order selesai! Saldo customer dipotong.',
                    'data' => $order
                ]);
            }

            // ✅ CANCEL ORDER
            if ($newStatus === 'cancelled') {
                $order->status = 'cancelled';
                $order->save();

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Order dibatalkan',
                    'data' => $order
                ]);
            }

            // Status lain (fallback)
            $order->status = $newStatus;
            $order->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Status diperbarui',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Gagal update status: ' . $e->getMessage()
            ], 500);
        }
    }
}