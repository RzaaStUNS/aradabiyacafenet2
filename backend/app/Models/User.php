<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <--- Pastikan ini ada
use App\Models\UserSession;       // <--- INI YANG SERING LUPA

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',     // Tambahan
        'ktp_number',   // Tambahan
        'password',
        'role',         // Tambahan (admin/staff/customer)
        'balance_time', // Tambahan (saldo)
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // --- RELASI TAMBAHAN ---

    // Relasi ke Sesi Aktif (Untuk Timer di Frontend)
    public function activeSession()
{
    return $this->hasOne(UserSession::class)->where('status', 'active')->latest();
}
}