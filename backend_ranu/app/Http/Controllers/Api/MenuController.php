<?php

namespace App\Http\Controllers\Api;

use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    // 1. GET MENU LIST
    public function index()
    {
        $menus = Menu::all();

        foreach ($menus as $m) {
            $m->image_url = asset('storage/' . $m->image);
        }

        return response()->json([
            'status' => true,
            'data' => $menus
        ]);
    }

    // 2. CREATE MENU + IMAGE UPLOAD
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:menus,name',
                'category' => 'required|in:makanan,minuman,cemilan',
                'price' => 'required|integer|min:0',
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            // Default image
            $imagePath = 'default_food.png';

            // Upload image jika ada
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                if ($file->isValid()) {
                    // Generate unique filename
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    // Move file manual
                    $destinationPath = storage_path('app/public/menus');
                        
                    // Pastikan folder ada
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    
                    // Move file
                    $file->move($destinationPath, $filename);
                    $imagePath = 'menus/' . $filename;
                } else {
                    return response()->json([
                        'status' => false,
                        'message' => 'File upload tidak valid: ' . $file->getErrorMessage()
                    ], 400);
                }
            }

            $menu = Menu::create([
                'name' => $request->name,
                'category' => $request->category,
                'price' => $request->price,
                'description' => $request->description ?? '',
                'is_available' => 1,
                'image' => $imagePath
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Menu berhasil ditambahkan',
                'data' => $menu
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal menambahkan menu: ' . $e->getMessage()
            ], 500);
        }
    }

    // 3. UPDATE MENU
    public function update(Request $request, $id)
    {
        try {
            $menu = Menu::find($id);

            if (!$menu) {
                return response()->json([
                    'status' => false,
                    'message' => "Menu tidak ditemukan"
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255', Rule::unique('menus')->ignore($id)],
                'category' => 'required|in:makanan,minuman,cemilan',
                'price' => 'required|integer|min:0',
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            // HANDLE IMAGE UPDATE
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                if ($file->isValid()) {
                    // Delete old image if not default (gunakan path absolut)
                    if ($menu->image && $menu->image !== 'default_food.png') {
                        $oldImagePath = storage_path('app/public/' . $menu->image);
                        if (file_exists($oldImagePath)) {
                            unlink($oldImagePath);
                        }
                    }

                    // Upload new image
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $destinationPath = storage_path('app/public/menus');
                    
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    
                    $file->move($destinationPath, $filename);
                    $menu->image = 'menus/' . $filename;
                }
            }

            // UPDATE DATA
            $menu->name = $request->name;
            $menu->category = $request->category;
            $menu->price = $request->price;
            $menu->description = $request->description ?? '';
            $menu->save();

            return response()->json([
                'status' => true,
                'message' => 'Menu berhasil diperbarui',
                'data' => $menu
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengupdate menu: ' . $e->getMessage()
            ], 500);
        }
    }

    // 4. DELETE MENU
    public function destroy($id)
    {
        try {
            $menu = Menu::find($id);

            if (!$menu) {
                return response()->json([
                    'status' => false,
                    'message' => 'Menu tidak ditemukan'
                ], 404);
            }

            // Delete image if exists and not default (gunakan path absolut)
            if ($menu->image && $menu->image !== 'default_food.png') {
                $imagePath = storage_path('app/public/' . $menu->image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            $menu->delete();

            return response()->json([
                'status' => true,
                'message' => 'Menu berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus menu: ' . $e->getMessage()
            ], 500);
        }
    }
}