<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // INI YANG KURANG!
    // Kita izinkan semua kolom diisi (kecuali id dan timestamps yang otomatis)
    protected $guarded = ['id'];
    
    // Relasi ke Item (opsional, tapi bagus buat nanti)
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}