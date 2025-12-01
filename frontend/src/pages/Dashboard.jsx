import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { MdDashboard, MdLogout, MdRestaurantMenu, MdHistory, MdAttachMoney, MdAddBox, MdNotificationsActive, MdComputer, MdPerson, MdRefresh, MdTimer } from "react-icons/md";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            if (user?.role !== 'admin') return null;
            const token = localStorage.getItem('token');
            const res = await api.get('/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } });
            return res.data.data;
        },
        enabled: user?.role === 'admin'
    });

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await api.get('/user');
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) { console.error("Gagal update data:", error); }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!token || !storedUser) navigate('/');
        else {
            setUser(JSON.parse(storedUser));
            fetchUserData();
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    if (!user) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans pb-20">
            {/* NAVBAR */}
            <div className="navbar bg-white text-gray-800 shadow-sm px-6 sticky top-0 z-50">
                <div className="flex-1 gap-2 items-center">
                    <div className="bg-primary p-2 rounded-lg text-white"><MdDashboard size={24}/></div>
                    <span className="text-xl font-bold tracking-tight">Aradabiya<span className="text-primary">Net</span></span>
                </div>
                <div className="flex-none gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold">{user.name}</p>
                        <span className="badge badge-sm badge-neutral uppercase text-white">{user.role}</span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-sm btn-error text-white gap-2">
                        <MdLogout /> Logout
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Halo, <span className="text-primary">{user.name}</span></h1>
                    <p className="text-gray-600">Selamat datang di dashboard kontrol.</p>
                </div>

                {/* --- TAMPILAN CUSTOMER --- */}
                {user.role === 'customer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SALDO CARD (Pakai bg-primary biar teks putih jelas) */}
                        <div className="card bg-primary text-primary-content shadow-xl">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="opacity-80 text-sm font-bold uppercase tracking-wider">Sisa Waktu Main</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-6xl font-black tracking-tighter">{user.balance_time}</span>
                                            <span className="text-xl font-medium">Menit</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-full"><MdTimer size={32}/></div>
                                </div>
                                <div className="card-actions justify-end mt-4">
                                    <button onClick={fetchUserData} className="btn btn-sm btn-ghost bg-white/20 text-white hover:bg-white/30 border-none gap-2">
                                        <MdRefresh /> Refresh Saldo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* MENU CEPAT (Background Putih, Teks Hitam) */}
                        <div className="grid grid-rows-2 gap-4">
                            <button onClick={() => navigate('/menu')} className="card bg-white hover:bg-gray-50 transition-all shadow-md border-l-8 border-blue-500 text-left group">
                                <div className="card-body p-6 flex-row items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                                        <MdRestaurantMenu size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Pesan Makanan</h3>
                                        <p className="text-sm text-gray-500">Lihat menu dan pesan</p>
                                    </div>
                                </div>
                            </button>
                            <button onClick={() => navigate('/riwayat')} className="card bg-white hover:bg-gray-50 transition-all shadow-md border-l-8 border-green-500 text-left group">
                                <div className="card-body p-6 flex-row items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                                        <MdHistory size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Riwayat Pesanan</h3>
                                        <p className="text-sm text-gray-500">Cek status pesanan</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TAMPILAN ADMIN --- */}
                {user.role === 'admin' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Stats pakai bg-white dan text-gray-800 biar kontras */}
                            <div className="stat bg-white shadow rounded-xl border border-gray-200">
                                <div className="stat-figure text-primary"><MdAttachMoney size={36}/></div>
                                <div className="stat-title text-gray-500 font-bold">Pendapatan</div>
                                <div className="stat-value text-gray-800">Rp {stats?.income?.toLocaleString() || 0}</div>
                            </div>
                            <div className="stat bg-white shadow rounded-xl border border-gray-200">
                                <div className="stat-figure text-secondary"><MdRestaurantMenu size={36}/></div>
                                <div className="stat-title text-gray-500 font-bold">Total Order</div>
                                <div className="stat-value text-gray-800">{stats?.orders || 0}</div>
                                <div className="stat-desc text-orange-600 font-bold bg-orange-100 inline-block px-2 rounded mt-1">{stats?.pending || 0} Menunggu</div>
                            </div>
                            <div className="stat bg-white shadow rounded-xl border border-gray-200">
                                <div className="stat-figure text-accent"><MdPerson size={36}/></div>
                                <div className="stat-title text-gray-500 font-bold">Pelanggan</div>
                                <div className="stat-value text-gray-800">{stats?.customers || 0}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                                <MdDashboard /> Panel Kontrol
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button onClick={() => navigate('/menu/tambah')} className="btn h-auto py-6 flex-col bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500 hover:text-green-700">
                                    <MdAddBox size={32} className="text-green-600"/> <span className="font-bold">Tambah Menu</span>
                                </button>
                                <button onClick={() => navigate('/pesanan-masuk')} className="btn h-auto py-6 flex-col bg-white border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 relative">
                                    <MdNotificationsActive size={32} className="text-orange-500"/> <span className="font-bold">Pesanan Masuk</span>
                                    {stats?.pending > 0 && <span className="absolute top-2 right-2 badge badge-error text-white animate-pulse">{stats.pending}</span>}
                                </button>
                                <button onClick={() => navigate('/kasir')} className="btn h-auto py-6 flex-col bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700">
                                    <MdAttachMoney size={32} className="text-blue-600"/> <span className="font-bold">Kasir / Top Up</span>
                                </button>
                                <button onClick={() => navigate('/monitoring')} className="btn h-auto py-6 flex-col bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700">
                                    <MdComputer size={32} className="text-purple-600"/> <span className="font-bold">Monitoring Room</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}