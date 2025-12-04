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
    // POST: Buat Pesanan Baru
    public function store(Request $request)
    {
        // 1. Validasi Input
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id', // Wajib dari ruangan mana
            'items' => 'required|array', // Harus ada daftar barangnya
            'items.*.id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        // 2. Gunakan DB Transaction (Biar kalau error di tengah, batal semua)
        try {
            DB::beginTransaction();

            // Hitung Total Harga dulu
            $totalPrice = 0;
            foreach ($request->items as $item) {
                $menu = Menu::find($item['id']);
                $totalPrice += $menu->price * $item['qty'];
            }

            // Simpan Data Order Utama
            $order = Order::create([
                'user_id' => $request->user()->id, // Siapa yang login
                'room_id' => $request->room_id,    // Dari PC mana
                'total_price' => $totalPrice,
                'status' => 'pending',             // Status awal: Menunggu dimasak
                'payment_method' => 'cash_on_delivery'    // Bayar nanti di kasir
            ]);

            // Simpan Detail Item (Nasi Goreng 2x, Teh 1x)
            foreach ($request->items as $item) {
                $menu = Menu::find($item['id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $menu->id,
                    'quantity' => $item['qty'],
                    'price' => $menu->price, // Simpan harga saat ini (biar aman kalau harga naik)
                    'subtotal' => $menu->price * $item['qty']
                ]);
            }

            DB::commit(); // Simpan permanen

            return response()->json([
                'status' => true,
                'message' => 'Pesanan berhasil dibuat! Dapur sedang menyiapkan.',
                'data' => $order
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan semua kalau error
            return response()->json(['status' => false, 'message' => 'Gagal memproses pesanan: ' . $e->getMessage()], 500);
        }
    }
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with(['items.menu', 'user']); // Ambil detail menu & nama pemesan

        // Kalau dia Customer, cuma boleh lihat pesanan sendiri
        if ($user->role === 'customer') {
            $query->where('user_id', $user->id);
        }
        // Kalau Admin, otomatis lihat semua (gak perlu where)

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $orders
        ]);
    }

    // BARU: Update Status Pesanan (Admin Only)
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['message' => 'Order not found'], 404);

        // Update status (pending -> cooked -> served -> paid)
        $order->update(['status' => $request->status]);

        return response()->json([
            'status' => true,
            'message' => 'Status pesanan diperbarui',
            'data' => $order
        ]);
    }
    // POST: Proses Pembayaran (Kasir)
    public function pay(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        if ($order->status === 'paid') {
            return response()->json(['message' => 'Order ini sudah dibayar sebelumnya!'], 400);
        }

        // Validasi payment_method (opsional)
        $paymentMethod = $request->payment_method ?? 'cash';
        if (!in_array($paymentMethod, ['cash', 'debit', 'credit', 'e-wallet'])) {
            return response()->json(['message' => 'Metode pembayaran tidak valid'], 400);
        }

        $order->update([
            'status' => 'paid',
            'payment_method' => $paymentMethod
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Pembayaran berhasil! Order ditutup.',
            'data' => $order
        ]);
    }

    // PUT: Ubah Item Pesanan (Hanya untuk order yang status = pending)
    public function updateItems(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $order = Order::with('items')->find($orderId);

        if (!$order) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Pesanan sudah dalam proses, tidak bisa diubah!'], 400);
        }

        try {
            DB::beginTransaction();

            // Hapus item lama
            $order->items()->delete();

            // Hitung ulang total harga
            $totalPrice = 0;
            foreach ($request->items as $item) {
                $menu = Menu::find($item['id']);
                $totalPrice += $menu->price * $item['qty'];
            }

            // Simpan item baru
            foreach ($request->items as $item) {
                $menu = Menu::find($item['id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $menu->id,
                    'quantity' => $item['qty'],
                    'price' => $menu->price,
                    'subtotal' => $menu->price * $item['qty']
                ]);
            }

            // Update total harga order
            $order->total_price = $totalPrice;
            $order->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Pesanan berhasil diperbarui!',
                'data' => Order::with('items.menu')->find($orderId)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Gagal memperbarui pesanan: ' . $e->getMessage()
            ], 500);
        }
    }
}
