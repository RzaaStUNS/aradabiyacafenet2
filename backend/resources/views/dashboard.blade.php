<x-app-layout>
    <div class="py-6">
        @if(auth()->user()->role === 'admin')
            <livewire:admin.dashboard />
        @elseif(auth()->user()->role === 'staff')
            <livewire:staff.dashboard />
        @elseif(auth()->user()->role === 'customer')
            <livewire:customer.dashboard />
        @endif
    </div>
</x-app-layout>