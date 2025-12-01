import { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdFastfood, MdDescription, MdAttachMoney, MdCategory, MdSave } from "react-icons/md";

export default function TambahMenu() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'makanan' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await api.post('/menus', formData, { headers: { Authorization: `Bearer ${token}` } });
            alert('Menu Berhasil Ditambahkan!');
            navigate('/menu');
        } catch (error) { alert('Gagal menambah menu.'); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center font-sans">
            <div className="card w-full max-w-2xl bg-white shadow-xl border border-gray-200">
                <div className="card-body p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-sm btn-circle btn-ghost text-gray-600 hover:bg-gray-100"><MdArrowBack size={20}/></button>
                        <h2 className="card-title text-2xl font-bold text-gray-800">Tambah Menu Baru</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Nama Menu</label>
                            <label className="input input-bordered bg-white border-gray-300 flex items-center gap-3 text-gray-800 focus-within:border-primary">
                                <MdFastfood className="text-gray-400 text-lg"/>
                                <input type="text" className="grow placeholder:text-gray-400" placeholder="Contoh: Nasi Goreng Spesial" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required/>
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Deskripsi</label>
                            <div className="relative">
                                <MdDescription className="absolute top-3 left-3 text-gray-400 text-lg"/>
                                <textarea className="textarea textarea-bordered bg-white border-gray-300 w-full pl-10 pt-2 text-gray-800 focus:border-primary h-24 placeholder:text-gray-400" placeholder="Jelaskan komposisi menu..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="form-control">
                                <label className="label font-bold text-gray-700">Harga (Rp)</label>
                                <label className="input input-bordered bg-white border-gray-300 flex items-center gap-3 text-gray-800 focus-within:border-primary font-mono">
                                    <MdAttachMoney className="text-green-600 text-lg"/>
                                    <input type="number" className="grow placeholder:text-gray-400" placeholder="15000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required/>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-gray-700">Kategori</label>
                                <div className="relative">
                                    <MdCategory className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400 z-10 text-lg"/>
                                    <select className="select select-bordered bg-white border-gray-300 w-full pl-10 text-gray-800 focus:border-primary" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                        <option value="makanan">Makanan</option>
                                        <option value="minuman">Minuman</option>
                                        <option value="snack">Snack</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary mt-6 text-white text-lg gap-2 shadow-md w-full sm:w-auto self-end" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : <><MdSave size={20}/> Simpan Menu</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}   