<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\OtpCode; // Model baru untuk OTP
use App\Mail\OtpMail; // <--- TAMBAHKAN INI
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail; // Wajib import ini
use Illuminate\Support\Facades\Http; // Wajib import ini
use Carbon\Carbon;

class AuthController extends Controller
{
    // === LOGIN (TETAP SAMA SEPERTI LAMA) ===
    public function login(Request $request)
    {
        Log::info('Login Attempt:', ['username' => $request->username]);

        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => 'Input tidak valid'], 422);
        }

        $user = User::where('username', $request->username)->first();

        // Topik 1: Login Security (BCRYPT) & Topik 7: Logging
        if (!$user || !Hash::check($request->password, $user->password)) {
            Log::warning('Login Failed:', ['username' => $request->username]);
            return response()->json(['status' => false, 'message' => 'Username atau password salah.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 200);
    }

    // === REGISTER (DIMODIFIKASI UNTUK OTP & CAPTCHA) ===
    public function register(Request $request)
    {
        Log::info('Register Start:', ['email' => $request->email]);

        // 1. VALIDASI INPUT & RBAC
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'ktp_number' => 'required|numeric',
            'email' => 'required|email:dns|unique:users',
            'role' => 'required|in:customer,staff',
            'captcha_token' => 'required' // Token dari Frontend
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        // 2. VERIFIKASI GOOGLE RECAPTCHA
        $secretKey = env('RECAPTCHA_SECRET_KEY');
        if(!$secretKey) {
            Log::warning('RECAPTCHA_SECRET_KEY tidak ditemukan di .env');
        } else {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $request->captcha_token,
                'remoteip' => $request->ip()
            ]);
    
            if (!$response->json()['success']) {
                return response()->json(['status' => false, 'message' => 'Captcha tidak valid!'], 422);
            }
        }

        try {
            // 3. CREATE USER (Tanpa OTP di tabel user, agar aman)
            $user = User::create([
                'name' => strip_tags($request->name), // Topik 6: Sanitasi
                'username' => strip_tags($request->username),
                'ktp_number' => $request->ktp_number,
                'email' => $request->email,
                'password' => Hash::make($request->password), // Topik 1: BCRYPT
                'role' => $request->role,
                'balance_time' => 0
            ]);

            // 4. GENERATE & SIMPAN OTP DI TABEL TERPISAH (Topik 3: OTP)
            $otpCode = rand(100000, 999999);
            
            // Hapus OTP lama jika ada (biar bersih)
            OtpCode::where('email', $user->email)->delete();
            
            // Simpan OTP baru
            OtpCode::create([
                'email' => $user->email,
                'otp' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(10)
            ]);

            // 5. KIRIM EMAIL OTP
            try {
            Mail::to($user->email)->send(new OtpMail($user, $otpCode));

            Log::info("Email OTP terkirim ke " . $user->email);
            } catch (\Exception $e) {
            Log::error("Gagal kirim email: " . $e->getMessage());
            }

            // Return response sukses, TAPI JANGAN LOGIN DULU (User harus verifikasi OTP)
            return response()->json([
                'status' => true,
                'message' => 'Registrasi Berhasil! Silakan cek email untuk kode OTP.',
                'data' => $user, // Mengirim data user, tapi frontend nanti akan minta OTP
                'require_otp' => true // Flag untuk frontend
            ], 201);

        } catch (\Exception $e) {
            Log::error('Register DB Error: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    // === VERIFIKASI OTP (FUNCTION BARU) ===
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => 'Format salah'], 422);
        }

        // 1. Cek User
        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['message' => 'User tidak ditemukan'], 404);

        // 2. Cek OTP di Tabel KHUSUS (OtpCode)
        $otpRecord = OtpCode::where('email', $request->email)
                            ->where('otp', $request->otp)
                            ->first();

        // Cek validitas OTP
        if (!$otpRecord || Carbon::now()->greaterThan($otpRecord->expires_at)) {
            return response()->json(['status' => false, 'message' => 'Kode OTP Salah atau Kadaluarsa'], 400);
        }

        // 3. Jika Benar: Hapus OTP & Berikan Token Login
        $otpRecord->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Verifikasi Berhasil',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => true, 'message' => 'Logout berhasil.'], 200);
    }
}