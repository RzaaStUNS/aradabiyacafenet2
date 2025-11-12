<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aradabiya - {{ $title ?? 'Dashboard' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-gray-100 font-sans">
    <nav class="bg-blue-600 text-white p-4 shadow">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold">Aradabiya Net</h1>
            <div>
                <span class="mr-4">Halo, {{ auth()->user()->name }}</span>
                <form method="POST" action="/logout" class="inline">
                    @csrf
                    <button type="submit" class="bg-red-500 px-3 py-1 rounded">Logout</button>
                </form>
            </div>
        </div>
    </nav>

    <div class="container mx-auto mt-6 px-4">
        {{ $slot }}
    </div>

    @livewireScripts
</body>
</html>