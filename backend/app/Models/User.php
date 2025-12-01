<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Atribut yang bisa diisi manual (Mass Assignable)
     */
    protected $fillable = [
        'name',
        'username',
        'ktp_number',
        'email',
        'password',
        'role',
        'balance_time', // PENTING: Agar bisa top-up saldo
        'is_active',    // PENTING: Agar status login bisa diubah
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // === METHOD BANTUAN ===
    // Cek apakah user adalah admin
    public function isAdmin() {
        return $this->role === 'admin';
    }

    // Cek apakah user adalah staff
    public function isStaff() {
        return $this->role === 'staff';
    }
}