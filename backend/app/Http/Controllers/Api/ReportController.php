<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Menu;
use App\Models\User;

class ReportController extends Controller
{
    public function dashboardStats()
    {
        // Hitung-hitungan sederhana
        $totalPendapatan = Order::where('status', 'served')->sum('total_price'); // Duit masuk (yang udah selesai)
        $totalPesanan = Order::count(); // Jumlah semua order
        $totalMenu = Menu::count(); // Jumlah menu
        $totalCustomer = User::where('role', 'customer')->count(); // Jumlah member

        // Pesanan yang butuh perhatian (masih pending)
        $pendingOrders = Order::where('status', 'pending')->count();

        return response()->json([
            'status' => true,
            'data' => [
                'income' => $totalPendapatan,
                'orders' => $totalPesanan,
                'menus' => $totalMenu,
                'customers' => $totalCustomer,
                'pending' => $pendingOrders
            ]
        ]);
    }
}