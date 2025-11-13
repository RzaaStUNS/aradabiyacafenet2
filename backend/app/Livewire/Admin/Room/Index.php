<?php

namespace App\Livewire\Admin\Room;

use Livewire\Component;
use App\Models\Room;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public $search = '';
    public $confirmingDeletion = null;

    public function delete($id)
    {
        Room::find($id)->delete();
        $this->confirmingDeletion = null;
        $this->dispatch('notify', ['message' => 'PC dihapus!', 'type' => 'success']);
    }

    public function render()
    {
        $rooms = Room::where('name', 'like', "%{$this->search}%")
            ->orWhere('type', 'like', "%{$this->search}%")
            ->paginate(10);

        return view('livewire.admin.room.index', compact('rooms'));
    }
}