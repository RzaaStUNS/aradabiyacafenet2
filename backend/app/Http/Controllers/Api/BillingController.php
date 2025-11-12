<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class BillingController extends Controller
{
   public function topup(Request $request, $customerId)
{
    $customer = User::findOrFail($customerId);
    if ($customer->role !== 'customer') {
        return response()->json(['message' => 'Bukan customer'], 400);
    }

    $validated = $request->validate([
        'type' => 'required|in:regular,premium',
        'minutes' => 'required|integer|min:1',
    ]);

   $pricePerMinute = config('aradabiya.price.' . $validated['type']);
$totalPrice = $validated['minutes'] * $pricePerMinute;

return response()->json([
    'message' => 'Top-up berhasil',
    'customer' => $customer->username,
    'type' => $validated['type'],
    'minutes_added' => $validated['minutes'],
    'total_price' => 'Rp ' . number_format($totalPrice),
    'new_balance' => $customer->billing->fresh()->{$field} . ' menit'
]);
}
}