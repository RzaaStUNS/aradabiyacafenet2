<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    // 1. GET: Ambil Semua Menu (Publik)
    public function index()
    {
        $menus = Menu::all();
        return response()->json([
            'status' => true,
            'message' => 'Daftar menu berhasil diambil',
            'data' => $menus
        ]);
    }

    // 2. POST: Tambah Menu Baru (Admin)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'category' => 'required|in:makanan,minuman,snack',
            'price' => 'required|integer',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $menu = Menu::create([
            'name' => $request->name,
            'category' => $request->category,
            'price' => $request->price,
            'description' => $request->description,
            'is_available' => true,
            'image' => 'default_food.png'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu
        ], 201);
    }

    // 3. GET: Ambil Detail Menu (Publik)
    public function show(string $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'status' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Detail menu berhasil diambil',
            'data' => $menu
        ]);
    }

    // 4. PUT/PATCH: Update Menu (Admin)
    public function update(Request $request, string $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'status' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string',
            'category' => 'sometimes|required|in:makanan,minuman,snack',
            'price' => 'sometimes|required|integer',
            'description' => 'nullable|string',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $menu->update($request->only(['name', 'category', 'price', 'description', 'is_available']));

        return response()->json([
            'status' => true,
            'message' => 'Menu berhasil diperbarui',
            'data' => $menu
        ]);
    }

    // 5. DELETE: Hapus Menu (Admin)
    public function destroy(string $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'status' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        $menu->delete();

        return response()->json([
            'status' => true,
            'message' => 'Menu berhasil dihapus'
        ], 200);
    }
}