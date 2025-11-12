<!-- resources/views/dashboard.blade.php -->
<x-app-layout>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if(auth()->user()->role === 'admin')
                <livewire:admin.dashboard />
            @elseif(auth()->user()->role === 'staff')
                <livewire:staff.dashboard />
            @elseif(auth()->user()->role === 'customer')
                <livewire:customer.dashboard />
            @else
                <p>Role tidak dikenali.</p>
            @endif
        </div>
    </div>
</x-app-layout>