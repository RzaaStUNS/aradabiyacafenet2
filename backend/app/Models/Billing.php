<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    protected $fillable = ['user_id', 'regular_balance', 'premium_balance'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}