<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\RoomController; // <--- JANGAN LUPA INI!

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// 1. Route Khusus Order (Bisa Customer, Admin, Staff)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
});

// 2. Routes Khusus Admin & Staff (Manajemen User & Sesi Lama)
Route::middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::post('/customers/{id}/topup', [BillingController::class, 'topup']);
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']);   

    // Session Management (Backup/Lama)
    Route::post('/sessions/start', [SessionController::class, 'start']);
    Route::post('/sessions/{id}/end', [SessionController::class, 'end']);

    // Melihat semua order
    Route::get('/orders', [OrderController::class, 'index']);
});

// 3. Routes Khusus Admin (FULL POWER)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Staff & Report
    Route::apiResource('staff', StaffController::class)->except(['show']);
    Route::get('reports/daily', [ReportController::class, 'daily']);
    Route::get('/dashboard-stats', [ReportController::class, 'dashboardStats']);
    
    // Manajemen Menu & Order
    Route::post('/menus', [MenuController::class, 'store']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    
    // Billing / Kasir
    Route::post('/billing/topup', [BillingController::class, 'topup']);

    // --- FITUR MONITORING ROOM (BARU) ---
    Route::get('/rooms', [RoomController::class, 'index']); // Lihat Denah
    Route::post('/rooms/{id}/start', [RoomController::class, 'startSession']); // Mulai Sewa
    Route::post('/rooms/{id}/stop', [RoomController::class, 'stopSession']); // Stop Sewa
});

// Public Routes
Route::get('/menus', [MenuController::class, 'index']);