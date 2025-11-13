<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
<<<<<<< Updated upstream

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
=======
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/customers', \App\Livewire\Admin\Customer\Index::class)->name('customers');
    Route::get('/customers/create', \App\Livewire\Admin\Customer\Create::class)->name('customers.create');
    Route::get('/customers/{id}/edit', \App\Livewire\Admin\Customer\Edit::class)->name('customers.edit');

    Route::get('/rooms', \App\Livewire\Admin\Room\Index::class)->name('rooms');
    Route::get('/rooms/create', \App\Livewire\Admin\Room\Create::class)->name('rooms.create');
    Route::get('/rooms/{id}/edit', \App\Livewire\Admin\Room\Edit::class)->name('rooms.edit');

    Route::get('/topup', \App\Livewire\Admin\Topup\Form::class)->name('topup');
    Route::get('/sessions', \App\Livewire\Admin\Session\Active::class)->name('sessions');
});
>>>>>>> Stashed changes
