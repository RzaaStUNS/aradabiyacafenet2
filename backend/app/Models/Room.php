<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = ['name', 'type', 'is_available'];

    // Relasi ke sesi aktif (wajib di dalam kurung kurawal class)
    public function activeSession() {
        return $this->hasOne(UserSession::class)->where('status', 'active');
    }
}