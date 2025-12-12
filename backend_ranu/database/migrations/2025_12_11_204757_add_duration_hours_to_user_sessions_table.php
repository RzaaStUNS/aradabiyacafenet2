<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            // Tambah kolom duration_hours kalau belum ada
            if (!Schema::hasColumn('user_sessions', 'duration_hours')) {
                $table->integer('duration_hours')->default(1)->after('start_time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('user_sessions', 'duration_hours')) {
                $table->dropColumn('duration_hours');
            }
        });
    }
};
