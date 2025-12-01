<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    // 1. GET: Ambil Semua Menu (Untuk Customer/Scan Barcode)
    public function index()
    {
        $menus = Menu::all();
        return response()->json([
            'status' => true,
            'message' => 'Daftar menu berhasil diambil',
            'data' => $menus
        ]);
    }

    // 2. POST: Tambah Menu Baru (Untuk Admin)
    public function store(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'category' => 'required|in:makanan,minuman,snack',
            'price' => 'required|integer',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        // Simpan ke database
        $menu = Menu::create([
            'name' => $request->name,
            'category' => $request->category,
            'price' => $request->price,
            'description' => $request->description,
            'is_available' => true,
            // Nanti kita urus upload gambar terpisah biar ga pusing sekarang
            'image' => 'default_food.png' 
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu
        ], 201);
    }
}