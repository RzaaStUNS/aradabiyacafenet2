<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
    'name', 'username', 'ktp_number', 'email', 'password', 'role'
];

public function getAuthIdentifierName()
{
    return 'username';
}
    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'role' => 'string',  // TAMBAH
        ];
    }

    // === RELASI ===
    public function billing()
    {
        return $this->hasOne(Billing::class);
    }

    public function activeSession()
    {
        return $this->hasOne(UserSession::class)->where('is_active', true);
    }
}