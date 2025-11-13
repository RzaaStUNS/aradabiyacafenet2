<div>
    <h2 class="text-2xl font-bold mb-4">Tambah Customer</h2>

    <form wire:submit="store" class="space-y-4">
        <div>
            <label class="block font-medium">Nama</label>
            <input type="text" wire:model="name" class="border p-2 w-full rounded">
            @error('name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block font-medium">Username</label>
            <input type="text" wire:model="username" class="border p-2 w-full rounded">
            @error('username') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block font-medium">No KTP</label>
            <input type="text" wire:model="ktp_number" class="border p-2 w-full rounded">
            @error('ktp_number') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block font-medium">Password</label>
            <input type="password" wire:model="password" class="border p-2 w-full rounded">
            @error('password') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div class="flex gap-2">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Simpan</button>
            <a href="{{ route('admin.customers') }}" class="bg-gray-500 text-white px-4 py-2 rounded">Kembali</a>
        </div>
    </form>
</div>