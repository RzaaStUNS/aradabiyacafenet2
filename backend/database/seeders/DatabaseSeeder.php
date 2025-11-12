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
        // === ADMIN (CEK DULU, KALO UDAH ADA JANGAN INSERT) ===
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin Aradabiya',
                'ktp_number' => '0000000000000000',
                'email' => 'admin@aradabiya.local',
                'password' => bcrypt('password'),
                'role' => 'admin',
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
            ]
        );

        // === BILLING (CEK DULU) ===
        Billing::firstOrCreate(
            ['user_id' => $admin->id],
            ['regular_balance' => 0, 'premium_balance' => 0]
        );

        Billing::firstOrCreate(
            ['user_id' => $staff->id],
            ['regular_balance' => 0, 'premium_balance' => 0]
        );

        // === ROOMS (6 PC) ===
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