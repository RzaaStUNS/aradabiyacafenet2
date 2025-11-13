<?php

namespace App\Livewire\Admin\Customer;

use Livewire\Component;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class Create extends Component
{
    public $name, $username, $ktp_number, $password;

    protected $rules = [
        'name' => 'required|string|max:255',
        'username' => 'required|string|unique:users,username|max:255',
        'ktp_number' => 'required|string|unique:users,ktp_number|max:16',
        'password' => 'required|string|min:6',
    ];

    public function store()
    {
        $this->validate();

        User::create([
            'name' => $this->name,
            'username' => $this->username,
            'ktp_number' => $this->ktp_number,
            'password' => Hash::make($this->password),
            'role' => 'customer',
            'balance' => 0,
        ]);

        $this->dispatch('notify', ['message' => 'Customer berhasil ditambah!', 'type' => 'success']);
        return redirect()->route('admin.customers');
    }

    public function render()
    {
        return view('livewire.admin.customer.create');
    }
}