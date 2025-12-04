<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Aradabiya Pricing Configuration
    |--------------------------------------------------------------------------
    */

    'price' => [
        'regular' => 5000,   // Rp 5.000 per menit
        'premium' => 10000,  // Rp 10.000 per menit
    ],

    'packages' => [
        'regular' => [
            ['name' => '1 Jam', 'minutes' => 60, 'price' => 300000],
            ['name' => '2 Jam', 'minutes' => 120, 'price' => 580000],
        ],
        'premium' => [
            ['name' => '1 Jam', 'minutes' => 60, 'price' => 600000],
        ],
    ],

];