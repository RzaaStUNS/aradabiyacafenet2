<div>
    <h2 class="text-2xl font-bold mb-4">Daftar PC</h2>

    <div class="mb-4 flex gap-2">
        <input type="text" wire:model.live="search" placeholder="Cari nama/tipe..." class="border p-2 rounded flex-1">
        <a href="{{ route('admin.rooms.create') }}" class="bg-green-500 text-white px-4 py-2 rounded">+ Tambah PC</a>
    </div>

    <table class="min-w-full bg-white border">
        <thead class="bg-gray-100">
            <tr>
                <th class="border px-4 py-2">Nama PC</th>
                <th class="border px-4 py-2">Tipe</th>
                <th class="border px-4 py-2">Status</th>
                <th class="border px-4 py-2">Aksi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rooms as $room)
            <tr>
                <td class="border px-4 py-2">{{ $room->name }}</td>
                <td class="border px-4 py-2">
                    <span class="px-2 py-1 rounded text-white {{ $room->type === 'vip' ? 'bg-purple-600' : 'bg-blue-600' }}">
                        {{ ucfirst($room->type) }}
                    </span>
                </td>
                <td class="border px-4 py-2">
                    <span class="px-2 py-1 rounded text-white {{ $room->is_available ? 'bg-green-600' : 'bg-red-600' }}">
                        {{ $room->is_available ? 'Tersedia' : 'Dipakai' }}
                    </span>
                </td>
                <td class="border px-4 py-2">
                    <a href="{{ route('admin.rooms.edit', $room->id) }}" class="text-blue-600">Edit</a>
                    <button wire:click="confirmingDeletion = {{ $room->id }}" class="text-red-600 ml-2">Hapus</button>
                </td>
            </tr>
            @empty
            <tr><td colspan="4" class="text-center py-4">Tidak ada PC.</td></tr>
            @endforelse
        </tbody>
    </table>

    {{ $rooms->links() }}

    @if($confirmingDeletion)
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow-lg">
            <p class="mb-4">Yakin hapus PC ini?</p>
            <button wire:click="delete({{ $confirmingDeletion }})" class="bg-red-500 text-white px-4 py-2 rounded">Ya</button>
            <button wire:click="$set('confirmingDeletion', null)" class="bg-gray-500 text-white px-4 py-2 rounded ml-2">Batal</button>
        </div>
    </div>
    @endif
</div>