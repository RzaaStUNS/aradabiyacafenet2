<div>
    <h1 class="text-3xl font-bold mb-6 text-blue-600">Admin Dashboard</h1>

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
</div>