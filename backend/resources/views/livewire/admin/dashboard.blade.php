<div>
    <h1 class="text-3xl font-bold mb-6 text-blue-600">Admin Dashboard</h1>

<<<<<<< Updated upstream
=======
    <!-- MENU NAVIGASI -->
    <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-semibold mb-4">Menu Admin</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="{{ route('admin.customers') }}" class="bg-blue-500 text-white p-4 rounded text-center font-semibold hover:bg-blue-600">
                Kelola Customer
            </a>
            <a href="{{ route('admin.rooms') }}" class="bg-green-500 text-white p-4 rounded text-center font-semibold hover:bg-green-600">
                Kelola PC
            </a>
            <a href="{{ route('admin.topup') }}" class="bg-yellow-500 text-white p-4 rounded text-center font-semibold hover:bg-yellow-600">
                Top-up Saldo
            </a>
            <a href="{{ route('admin.sessions') }}" class="bg-purple-500 text-white p-4 rounded text-center font-semibold hover:bg-purple-600">
                Sesi Aktif
            </a>
        </div>
    </div>

    <!-- STATISTIK -->
>>>>>>> Stashed changes
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 class="text-lg font-semibold text-gray-700">Pendapatan Hari Ini</h3>
            <p class="text-3xl font-bold text-green-600">Rp {{ number_format($revenue) }}</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h3 class="text-lg font-semibold text-gray-700">PC Aktif</h3>
            <p class="text-3xl font-bold text-blue-600">{{ $activeSessions }}</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
            <h3 class="text-lg font-semibold text-gray-700">Total Customer</h3>
            <p class="text-3xl font-bold text-purple-600">{{ $totalCustomers }}</p>
        </div>
    </div>
<<<<<<< Updated upstream
</div>
=======
</div>x`
>>>>>>> Stashed changes
