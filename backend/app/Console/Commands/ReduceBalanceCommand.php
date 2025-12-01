<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ReduceBalanceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'balance:reduce';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kurangi saldo customer tiap menit';

    /**
     * Execute the console command.
     */
    public function handle()
{
    $activeSessions = \App\Models\UserSession::where('is_active', true)->get();

    foreach ($activeSessions as $session) {
        $customer = $session->user;
        $type = $session->billing_type_used;
        $field = $type . '_balance';

        if ($customer->billing->{$field} > 0) {
            $customer->billing->decrement($field, 1);
        } else {
            // Saldo habis → akhiri sesi
            $session->update([
                'is_active' => false,
                'end_time' => now(),
            ]);
            $session->room->update(['is_available' => true]);
            $this->info("Sesi {$session->id} diakhiri (saldo habis)");
        }
    }
}
}   