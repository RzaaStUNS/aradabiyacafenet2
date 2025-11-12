<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function daily()
{
    $today = now()->format('Y-m-d');

    $sessions = \App\Models\UserSession::whereDate('created_at', $today)
        ->with('user', 'room')
        ->get();

   $revenue = 0;
foreach ($sessions as $s) {
    $minutes = $s->end_time 
        ? $s->end_time->diffInMinutes($s->start_time)
        : now()->diffInMinutes($s->start_time);

    $pricePerMinute = config('aradabiya.price.' . $session->billing_type_used);
    $revenue += $minutes * $pricePerMinute;
}

    return response()->json([
        'date' => $today,
        'total_sessions' => $sessions->count(),
        'revenue' => $revenue,
        'active_now' => \App\Models\UserSession::where('is_active', true)->count(),
    ]);
}
}
