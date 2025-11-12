<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('user_sessions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('room_id')->constrained()->onDelete('cascade');
        $table->timestamp('start_time');
        $table->timestamp('end_time')->nullable();
        $table->boolean('is_active')->default(true);
        $table->enum('billing_type_used', ['regular', 'vip'])->default('regular');
        $table->integer('total_minutes')->nullable();
        $table->decimal('total_price', 10, 0)->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
