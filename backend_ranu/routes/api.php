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

// === PUBLIC ROUTES (Bisa diakses tanpa login) ===
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/menus', [MenuController::class, 'index']); 

// === PROTECTED ROUTES (Bisa Diakses Staff, Admin & Customer) ===
Route::middleware(['auth:sanctum'])->group(function () {
    
    // User Info
    Route::get('/user', function (Request $request) {
        // Load relasi user ke sesi aktif & room biar frontend customer jalan
        return $request->user()->load(['activeSession.room']);
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Orders (Transaksi)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']); 
    Route::put('/orders/{id}/items', [OrderController::class, 'updateItems']);
    Route::put('/orders/{id}/pay', [OrderController::class, 'pay']);

    // Sessions (Warnet)
    Route::get('/sessions', [SessionController::class, 'index']); // Agar staff bisa monitor
    Route::post('/sessions/start', [SessionController::class, 'start']);
    Route::post('/sessions/stop', [SessionController::class, 'end']); // Hapus {sessionId} biar sesuai frontend

    // Billing (Top Up)
    Route::post('/billing/topup', [BillingController::class, 'topup']);

    // Customers (Pencarian User oleh Staff)
    Route::get('/customers', [CustomerController::class, 'index']); 

    
    // Kita taruh GET Room disini agar Staff & Customer bisa lihat daftar PC
    Route::get('/rooms', [RoomController::class, 'index']);
});

// === ADMIN ONLY ROUTES (Hanya Admin) ===
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    
    // Staff Management
    Route::apiResource('staff', StaffController::class);
    
    // Laporan
    Route::get('/reports/monthly', [ReportController::class, 'monthlyReport']);
    Route::get('/reports/export', [ReportController::class, 'exportMonthly']);

    // Reports
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/stats', [ReportController::class, 'dashboardStats']);
    
    // Menu Management (Full CRUD - Edit/Hapus)
    Route::post('/menus', [MenuController::class, 'store']);
    Route::put('/menus/{id}', [MenuController::class, 'update']);
    Route::delete('/menus/{id}', [MenuController::class, 'destroy']);

    // Customer Management (Admin full akses)
    Route::apiResource('customers', CustomerController::class)->except(['index']);
    
    // Room Management (Admin bisa Tambah/Hapus PC)
    // Kita except 'index' karena sudah ada di grup atas
    Route::apiResource('rooms', RoomController::class)->except(['index']); 
});