<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    // Relasi ke Sesi Warnet
    public function sessions()
    {
        return $this->hasMany(UserSession::class, 'room_id');
    }
}