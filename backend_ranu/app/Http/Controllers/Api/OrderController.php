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
        $query = Order::with(['items.menu', 'user', 'customer', 'room'])->orderBy('created_at', 'desc');

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
                return response()->json(['status' => false, 'message' => $validator->errors()], 422);
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

                // Cek saldo
                if ($user->balance_time < $calculatedTotal) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Saldo tidak cukup!'
                    ], 400);
                }

                // Potong saldo
                $user->balance_time -= $calculatedTotal;
                $user->save();

                // SIMPAN ORDER – FIX ⇒ status harus "paid"
                $order = Order::create([
                    'user_id' => $user->id,
                    'room_id' => $request->room_id,
                    'type' => 'food',
                    'total_price' => $calculatedTotal,
                    'status' => 'paid', // FIX
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
                    'message' => 'Pesanan makanan berhasil!',
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

            $totalCost = $request->total;

            if ($user->balance_time < $totalCost) {
                return response()->json([
                    'status' => false,
                    'message' => 'Saldo tidak cukup!'
                ], 400);
            }

            try {
                DB::beginTransaction();

                // Potong saldo
                $user->balance_time -= $totalCost;
                $user->save();

                // SIMPAN ORDER – FIX ⇒ status awal paid
                $order = Order::create([
                    'user_id' => $user->id,
                    'room_id' => $request->room_id,
                    'type' => $type,
                    'total_price' => $totalCost,
                    'duration' => $request->duration ?? 1,
                    'status' => 'paid', // FIX
                    'note' => $request->note,
                ]);

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Booking berhasil!',
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
            return response()->json(['status' => false, 'message' => 'Order tidak ditemukan'], 404);
        }

        // jika staff menandai order selesai
        if ($request->status === 'done') {

            $order->status = 'completed'; // FIX: ini untuk laporan & dashboard
            $order->save();

            return response()->json([
                'status' => true,
                'message' => 'Order diselesaikan',
                'data' => $order
            ]);
        }

        // Jika staff set processing (khusus rental)
        if ($request->status === 'processing' && $order->type === 'rental') {

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

            $order->status = 'processing';
            $order->save();

            return response()->json([
                'status' => true,
                'message' => 'Session dimulai!',
                'order' => $order,
                'session' => $session
            ]);
        }

        // Status lain
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'status' => true,
            'message' => 'Status diperbarui',
            'data' => $order
        ]);
    }
}
