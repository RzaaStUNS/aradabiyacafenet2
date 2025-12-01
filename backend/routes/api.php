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
use App\Http\Controllers\Api\RoomController; // <--- INI WAJIB ADA

// Route User (Load relasi activeSession biar frontend tau)
Route::get('/user', function (Request $request) {
    return $request->user()->load(['activeSession.room']);
})->middleware('auth:sanctum');

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// 1. Route Customer & Umum (Yang penting Login)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']); // Customer lihat riwayat sendiri
});

// 2. Route Admin (Full Power)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Staff & Report
    Route::apiResource('staff', StaffController::class)->except(['show']);
    Route::get('reports/daily', [ReportController::class, 'daily']);
    Route::get('/dashboard-stats', [ReportController::class, 'dashboardStats']);
    
    // Manajemen Menu & Order (Admin)
    Route::post('/menus', [MenuController::class, 'store']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    
    // Billing / Kasir
    Route::post('/billing/topup', [BillingController::class, 'topup']);

    // Manajemen User
    Route::post('/customers', [CustomerController::class, 'store']);

    // Monitoring Room (Sistem Warnet)
    Route::get('/rooms', [RoomController::class, 'index']); 
    Route::post('/rooms/{id}/start', [RoomController::class, 'startSession']); 
    Route::post('/rooms/{id}/stop', [RoomController::class, 'stopSession']); 
});

// Public Route (Bisa diakses tanpa login, misal scan QR)
Route::get('/menus', [MenuController::class, 'index']);