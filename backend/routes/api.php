<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\RoomController;

// Route User
Route::get('/user', function (Request $request) {
    return $request->user()->load(['activeSession.room']);
})->middleware('auth:sanctum');

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/sessions/start', [SessionController::class, 'start']);
    Route::post('/sessions/stop/{sessionId}', [SessionController::class, 'end']);
});

// 2. Route Admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Staff & Report
    Route::apiResource('staff', StaffController::class);
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/stats', [ReportController::class, 'dashboardStats']);
    
    // Manajemen Menu & Order (Admin)
    Route::apiResource('menus', MenuController::class);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{id}/items', [OrderController::class, 'updateItems']);
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']);
    
    // Billing
    Route::post('/billing/topup', [BillingController::class, 'topup']);

    // Manajemen User
    Route::apiResource('customers', CustomerController::class);
    
    // Room (Sistem Warnet)
    Route::apiResource('rooms', RoomController::class); 
    
    // Session Room
});

// Public Route
Route::get('/menus', [MenuController::class, 'index']);