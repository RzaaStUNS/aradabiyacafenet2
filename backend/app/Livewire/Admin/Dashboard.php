<?php

namespace App\Livewire\Admin;

use Livewire\Component;

class Dashboard extends Component
{
    public function render()
{
    $today = today();
    $sessions = \App\Models\UserSession::whereDate('created_at', $today)->get();

    $revenue = $sessions->sum(function ($s) {
        $minutes = $s->end_time?->diffInMinutes($s->start_time) ?? 0;
        $price = $s->billing_type_used === 'regular' ? 5000 : 10000;
        return $minutes * $price;
    });

    return view('livewire.admin.dashboard', [
        'revenue' => $revenue,
        'active' => \App\Models\UserSession::where('is_active', true)->count(),
        'customers' => \App\Models\User::where('role', 'customer')->count(),
    ]);
}
}
