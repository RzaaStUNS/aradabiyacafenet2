<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use App\Models\UserSession;
use App\Models\User;

class Dashboard extends Component
{
    public $revenue = 0;
    public $activeSessions = 0;
    public $totalCustomers = 0;

    public function mount()
    {
        $today = today();
        $sessions = UserSession::whereDate('created_at', $today)->get();

        $this->revenue = $sessions->sum(function ($s) {
            $minutes = $s->end_time?->diffInMinutes($s->start_time) ?? 0;
            $price = $s->billing_type_used === 'regular' ? 5000 : 10000;
            return $minutes * $price;
        });

        $this->activeSessions = UserSession::where('is_active', true)->count();
        $this->totalCustomers = User::where('role', 'customer')->count();
    }

    public function render()
    {
        return view('livewire.admin.dashboard');
    }
}