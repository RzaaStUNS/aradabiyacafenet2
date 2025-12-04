<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\UserSession;
class Room extends Model
{
    protected $fillable = ['name', 'type', 'is_available'];

    public function activeSession()
    {
        return $this->hasOne(UserSession::class)->where('status', 'active');
    }
}