<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class UserSession extends Model
{
    protected $table = 'sessions';
    use HasFactory;

    // Semua kolom bisa diisi
    protected $guarded = ['id'];

    // Otomatis cast datetime ke format lokal
    protected $casts = [
        'start_time' => 'datetime:Y-m-d H:i:s',
        'end_time'   => 'datetime:Y-m-d H:i:s',
    ];

    // Pastikan semua waktu menggunakan timezone Asia/Jakarta
    protected function serializeDate(\DateTimeInterface $date)
    {
        return Carbon::parse($date)
            ->timezone('Asia/Jakarta')
            ->format('Y-m-d H:i:s');
    }

    // Relasi ke USER
    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi ke ROOM
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
