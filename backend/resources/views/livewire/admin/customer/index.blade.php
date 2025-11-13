<div>
    <h2 class="text-2xl font-bold mb-4">Daftar Customer</h2>

    <div class="mb-4 flex gap-2">
        <input type="text" wire:model.live="search" placeholder="Cari nama/username..." class="border p-2 rounded flex-1">
        <a href="{{ route('admin.customers.create') }}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Tambah</a>
    </div>

    <table class="min-w-full bg-white border">
        <thead class="bg-gray-100">
            <tr>
                <th class="border px-4 py-2 text-left">Nama</th>
                <th class="border px-4 py-2 text-left">Username</th>
                <th class="border px-4 py-2 text-left">Saldo</th>
                <th class="border px-4 py-2 text-left">Aksi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($customers as $c)
            <tr>
                <td class="border px-4 py-2">{{ $c->name }}</td>
                <td class="border px-4 py-2">{{ $c->username }}</td>
                <td class="border px-4 py-2">Rp {{ number_format($c->balance ?? 0) }}</td>
                <td class="border px-4 py-2">
                    <a href="{{ route('admin.customers.edit', $c->id) }}" class="text-blue-600 hover:underline">Edit</a>
                    <button wire:click="confirmingDeletion = {{ $c->id }}" class="text-red-600 hover:underline ml-2">Hapus</button>
                </td>
            </tr>
            @empty
            <tr><td colspan="4" class="text-center py-4">Tidak ada customer.</td></tr>
            @endforelse
        </tbody>
    </table>

    {{ $customers->links() }}

    @if($confirmingDeletion)
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow-lgs">
            <p class="mb-4">Yakin hapus customer ini?</p>
            <div class="flex gap-2">
                <button wire:click="delete({{ $confirmingDeletion }})" class="bg-red-500 text-white px-4 py-2 rounded">Ya, Hapus</button>
                <button wire:click="$set('confirmingDeletion', null)" class="bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
            </div>
        </div>
    </div>
    @endif
</div>