<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiAuthenticate
{
    public function handle(Request $required, Closure $next, ...$guards): Response
    {
        // Cek apakah ini request ke /api/*
        if ($required->is('api/*')) {
            // Ambil user via Sanctum (token-based)
            $user = $required->user();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated.'
                ], 401);
            }
        }

        return $next($required);
    }
}