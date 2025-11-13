<?php

namespace App\Livewire\Admin\Customer;

use Livewire\Component;
use App\Models\User;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public $search = '';
    public $confirmingDeletion = null;

    public function delete($id)
    {
        User::find($id)->delete();
        $this->confirmingDeletion = null;
        $this->dispatch('notify', ['message' => 'Customer dihapus!', 'type' => 'success']);
    }

    public function render()
    {
        $customers = User::where('role', 'customer')
            ->where(function ($q) {
                $q->where('name', 'like', "%{$this->search}%")
                  ->orWhere('username', 'like', "%{$this->search}%");
            })
            ->paginate(10);

        return view('livewire.admin.customer.index', compact('customers'));
    }
}