<div>
    <h2 class="text-2xl font-bold mb-4">Tambah PC</h2>

    <form wire:submit="store" class="space-y-4">
        <div>
            <label>Nama PC</label>
            <input type="text" wire:model="name" class="border p-2 w-full rounded">
            @error('name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div>
            <label>Tipe</label>
            <select wire:model="type" class="border p-2 w-full rounded">
                <option value="regular">Regular (Rp 5.000/jam)</option>
                <option value="vip">VIP (Rp 10.000/jam)</option>
            </select>
            @error('type') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div class="flex gap-2">
            <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Simpan</button>
            <a href="{{ route('admin.rooms') }}" class="bg-gray-500 text-white px-4 py-2 rounded">Kembali</a>
        </div>
    </form>
</div>