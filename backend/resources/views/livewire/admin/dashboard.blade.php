<div>
    <h2 class="text-2xl font-bold mb-6">Admin Dashboard</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-700">Pendapatan Hari Ini</h3>
            <p class="text-3xl font-bold text-green-600">Rp {{ number_format($revenue) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-700">PC Aktif</h3>
            <p class="text-3xl font-bold text-blue-600">{{ $active }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-700">Total Customer</h3>
            <p class="text-3xl font-bold text-purple-600">{{ $customers }}</p>
        </div>
    </div>
</div>