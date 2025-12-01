import { useState } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { MdPerson, MdLock, MdBadge, MdAppRegistration } from "react-icons/md";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'customer' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/register', formData);
            alert('Pendaftaran Berhasil! Silakan Login.');
            navigate('/');
        } catch (err) { setError('Gagal Mendaftar. Username mungkin sudah dipakai.'); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="card w-full max-w-sm bg-white shadow-xl">
                <div className="card-body">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Buat Akun Baru</h2>
                        <p className="text-gray-500 text-xs">Bergabunglah dengan Aradabiya Net</p>
                    </div>
                    
                    {error && <div className="alert alert-error text-sm py-2 mb-4"><span>{error}</span></div>}
                    
                    <form onSubmit={handleRegister} className="flex flex-col gap-3">
                        <label className="input input-bordered flex items-center gap-2">
                            <MdBadge className="text-gray-400"/>
                            <input type="text" className="grow" placeholder="Nama Lengkap" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required/>
                        </label>
                        <label className="input input-bordered flex items-center gap-2">
                            <MdPerson className="text-gray-400"/>
                            <input type="text" className="grow" placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required/>
                        </label>
                        <label className="input input-bordered flex items-center gap-2">
                            <MdLock className="text-gray-400"/>
                            <input type="password" className="grow" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required/>
                        </label>
                        
                        <button type="submit" className="btn btn-primary w-full mt-4 text-white" disabled={loading}>
                            {loading ? 'Mendaftar...' : <><MdAppRegistration/> Daftar</>}
                        </button>
                    </form>

                    <div className="text-center text-sm mt-4">
                        Sudah punya akun? <Link to="/" className="link link-primary no-underline font-bold">Login disini</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}