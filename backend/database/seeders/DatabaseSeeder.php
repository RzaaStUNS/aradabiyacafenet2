<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Billing;
use App\Models\Room;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === ADMIN ===
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin Aradabiya',
                'ktp_number' => '0000000000000000', // Sesuai screenshot kamu ada kolom ini
                'email' => 'admin@aradabiya.local',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'balance_time' => 0 // Tambahan biar tidak error default value
            ]
        );

        // === STAFF ===
        $staff = User::firstOrCreate(
            ['username' => 'staff1'],
            [
                'name' => 'Staff Utama',
                'ktp_number' => '1111111111111111',
                'email' => 'staff1@aradabiya.local',
                'password' => bcrypt('password'),
                'role' => 'staff',
                'balance_time' => 0
            ]
        );

        // === BILLING ===
        Billing::firstOrCreate(
            ['user_id' => $admin->id],
            ['regular_balance' => 0, 'premium_balance' => 0]
        );

        Billing::firstOrCreate(
            ['user_id' => $staff->id],
            ['regular_balance' => 0, 'premium_balance' => 0]
        );

        // === ROOMS (PC) ===
        // Pastikan tabel 'rooms' punya kolom 'type' ya!
        $rooms = [
            ['name' => 'Reg-1', 'type' => 'regular', 'is_available' => true],
            ['name' => 'Reg-2', 'type' => 'regular', 'is_available' => true],
            ['name' => 'Reg-3', 'type' => 'regular', 'is_available' => true],
            ['name' => 'Prem-1', 'type' => 'premium', 'is_available' => true],
            ['name' => 'Prem-2', 'type' => 'premium', 'is_available' => true],
            ['name' => 'Prem-3', 'type' => 'premium', 'is_available' => true],
        ];

        foreach ($rooms as $room) {
            Room::firstOrCreate(
                ['name' => $room['name']],
                $room
            );
        }
    }
}