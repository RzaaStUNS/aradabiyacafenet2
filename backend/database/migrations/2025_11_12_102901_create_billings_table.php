<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billings', function (Blueprint $table) {
            $table->id();
            // Menghubungkan billing ke user
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Kolom saldo
            $table->integer('regular_balance')->default(0);
            $table->integer('premium_balance')->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};