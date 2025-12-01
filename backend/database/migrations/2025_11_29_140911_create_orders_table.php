<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users'); // Siapa yang pesan
        $table->foreignId('room_id')->constrained('rooms'); // KE RUANGAN MANA (PENTING!)
        $table->integer('total_price');
        $table->enum('status', ['pending', 'cooked', 'served', 'paid', 'cancelled'])->default('pending');
        $table->string('payment_method')->default('cash'); // cash / qris / potong_saldo
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
