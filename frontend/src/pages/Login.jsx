import { useState } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { MdPerson, MdLock, MdLogin } from "react-icons/md";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/login', { username, password });
            if (response.data.status) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                navigate('/dashboard'); 
            } else { setError(response.data.message); } 
        } catch (err) { setError('Login Gagal: Periksa username/password.'); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="card w-full max-w-sm bg-white shadow-xl">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-primary">Aradabiya<span className="text-gray-700">Net</span></h2>
                        <p className="text-gray-500 text-sm mt-1">Silakan masuk ke akun Anda</p>
                    </div>
                    
                    {error && <div className="alert alert-error text-sm py-2 mb-4 rounded-lg"><span>{error}</span></div>}
                    
                    <form onSubmit={handleLogin}>
                        <div className="form-control w-full">
                            <label className="label"><span className="label-text font-semibold">Username</span></label>
                            <label className="input input-bordered flex items-center gap-2">
                                <MdPerson className="text-gray-400"/>
                                <input type="text" className="grow" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                            </label>
                        </div>
                        <div className="form-control w-full mt-4">
                            <label className="label"><span className="label-text font-semibold">Password</span></label>
                            <label className="input input-bordered flex items-center gap-2">
                                <MdLock className="text-gray-400"/>
                                <input type="password" className="grow" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                            </label>
                        </div>
                        
                        <button type="submit" className="btn btn-primary w-full mt-6 text-white text-lg" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : <><MdLogin/> Masuk</>}
                        </button>
                    </form>

                    <div className="divider text-xs text-gray-400">ATAU</div>
                    <div className="text-center text-sm">
                        Belum punya akun? <Link to="/register" className="link link-primary no-underline font-bold hover:underline">Daftar sekarang</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}