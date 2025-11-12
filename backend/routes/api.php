<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BillingController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::post('/customers/{id}/topup', [BillingController::class, 'topup']);
    Route::post('/sessions/start', [SessionController::class, 'start']);
    Route::post('/sessions/{id}/end', [SessionController::class, 'end']);
});
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('staff', StaffController::class)->except(['show']);
    Route::get('reports/daily', [ReportController::class, 'daily']);
});