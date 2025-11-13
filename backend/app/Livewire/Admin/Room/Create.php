<?php

namespace App\Livewire\Admin\Room;

use Livewire\Component;
use App\Models\Room;

class Create extends Component
{
    public $name, $type = 'regular';

    protected $rules = [
        'name' => 'required|string|unique:rooms,name|max:50',
        'type' => 'required|in:regular,vip',
    ];

    public function store()
    {
        $this->validate();

        Room::create([
            'name' => $this->name,
            'type' => $this->type,
            'is_available' => true,
        ]);

        $this->dispatch('notify', ['message' => 'PC berhasil ditambah!', 'type' => 'success']);
        return redirect()->route('admin.rooms');
    }

    public function render()
    {
        return view('livewire.admin.room.create');
    }
}