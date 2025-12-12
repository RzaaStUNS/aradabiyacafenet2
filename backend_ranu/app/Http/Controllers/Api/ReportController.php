<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Room;
use App\Models\UserSession;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * DASHBOARD STATS (Dipakai Admin.jsx)
     */
   public function dashboardStats()
{
    try {
        $today = now()->toDateString();

        // Pastikan model tidak bentrok
        $totalComputers = \App\Models\Room::count();
        $activeComputers = UserSession::whereNull('end_time')->count();
        $todayRevenue = \App\Models\Order::whereDate('created_at', $today)
            ->whereIn('status', ['paid', 'completed'])
            ->sum('total_price');

        return response()->json([
            'totalComputers'   => $totalComputers,
            'activeComputers'  => $activeComputers,
            'todayRevenue'     => (float) $todayRevenue,
        ]);

    } catch (\Throwable $e) { // ← Ganti \Exception jadi \Throwable (tangkap SEMUA error)
        \Log::error('DashboardStats error: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'message' => 'Error fetching dashboard stats',
            'error'   => $e->getMessage()
        ], 500);
    }
}

}
