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

// ==========================================
// 🔓 PUBLIC ROUTES (Bisa diakses tanpa login)
// ==========================================

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// [FIX] Tambahkan Route Verifikasi OTP disini (Wajib Public)
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']); 

Route::get('/menus', [MenuController::class, 'index']); 

// ==========================================
// 🔒 PROTECTED ROUTES (Staff, Admin, Customer)
// ==========================================
Route::middleware(['auth:sanctum'])->group(function () {
    
    // User Info
    Route::get('/user', function (Request $request) {
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
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::post('/sessions/start', [SessionController::class, 'start']);
    Route::post('/sessions/stop', [SessionController::class, 'end']);

    // Billing (Top Up)
    Route::post('/billing/topup', [BillingController::class, 'topup']);

    // Customers (Pencarian User oleh Staff)
    Route::get('/customers', [CustomerController::class, 'index']); 

    // Rooms (Daftar PC)
    Route::get('/rooms', [RoomController::class, 'index']);
});

// ==========================================
// 🛡️ ADMIN ONLY ROUTES (Hanya Admin)
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    
    // Staff Management
    Route::apiResource('staff', StaffController::class);
    
    // Laporan
    Route::get('/reports/monthly', [ReportController::class, 'monthlyReport']);
    Route::get('/reports/export', [ReportController::class, 'exportMonthly']);
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/stats', [ReportController::class, 'dashboardStats']);
    
    // Menu Management
    Route::post('/menus', [MenuController::class, 'store']);
    Route::put('/menus/{id}', [MenuController::class, 'update']);
    Route::delete('/menus/{id}', [MenuController::class, 'destroy']);

    // Customer Management
    Route::apiResource('customers', CustomerController::class)->except(['index']);
    
    // Room Management
    Route::apiResource('rooms', RoomController::class)->except(['index']); 

    // [TOPIK 4 SKD] Route Backup Database (Opsional, tapi bagus untuk nilai plus)
    Route::get('/system/backup', function () {
        $filename = "backup-" . date('Y-m-d-H-i-s') . ".sql";
        $command = "mysqldump --user=" . env('DB_USERNAME') . " --password=" . env('DB_PASSWORD') . " --host=" . env('DB_HOST') . " " . env('DB_DATABASE') . " > " . storage_path("app/" . $filename);
        exec($command);
        return response()->json(['message' => 'Backup berhasil', 'file' => $filename]);
    });
});