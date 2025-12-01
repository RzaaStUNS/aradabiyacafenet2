import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { MdDashboard, MdLogout, MdRestaurantMenu, MdHistory, MdAttachMoney, MdAddBox, MdNotificationsActive, MdComputer, MdPerson, MdRefresh, MdTimer, MdStopCircle } from "react-icons/md";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [realtimeSaldo, setRealtimeSaldo] = useState(0); 
    const navigate = useNavigate();

    // 1. Fetch Stats Admin (Hanya jalan kalau role admin)
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            if (user?.role !== 'admin') return null;
            const res = await api.get('/dashboard-stats');
            return res.data.data;
        },
        enabled: user?.role === 'admin'
    });

    // 2. Fetch Data User Terbaru
    const fetchUserData = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            
            // Set saldo awal
            setRealtimeSaldo(response.data.balance_time);
        } catch (error) {
            console.error("Gagal update data user:", error);
        }
    };

    // 3. LOGIKA TIMER REALTIME
    useEffect(() => {
        let interval;
        // PERBAIKAN: Gunakan 'active_session' (camelCase) sesuai output Laravel
        if (user?.active_session) {
            const startTime = new Date(user.active_session.start_time).getTime();
            
            interval = setInterval(() => {
                const now = new Date().getTime();
                const usedMinutes = Math.floor((now - startTime) / 60000);
                const sisa = user.balance_time - usedMinutes;
                setRealtimeSaldo(sisa > 0 ? sisa : 0);
            }, 1000);
        } else if (user) {
            setRealtimeSaldo(user.balance_time);
        }
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        } else {
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                setRealtimeSaldo(parsed.balance_time);
            }
            fetchUserData();
        }
    }, [navigate]);

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) {}
        localStorage.clear();
        window.location.href = '/';
    };

    const handleStopSelf = async () => {
        if (!confirm('Akhiri sesi main sekarang?')) return;
        try {
            // PERBAIKAN: Gunakan 'active_session'
            await api.post(`/rooms/${user.active_session.room_id}/stop`);
            alert("Sesi Berakhir!");
            fetchUserData(); 
        } catch (error) {
            alert("Gagal stop sesi");
        }
    };

    if (!user) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

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
                        
                        {/* KARTU SALDO */}
                        <div className={`card ${user.active_session ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-blue-600'} text-white shadow-xl`}>
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="opacity-90 text-sm font-bold uppercase tracking-wider">
                                            {user.active_session ? `✅ MAIN DI ${user.active_session.room?.name}` : 'Sisa Waktu Main'}
                                        </p>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-6xl font-black tracking-tighter">{realtimeSaldo}</span>
                                            <span className="text-xl font-medium">Menit</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-full">
                                        {user.active_session ? <MdComputer size={32} className="animate-pulse"/> : <MdTimer size={32}/>}
                                    </div>
                                </div>
                                
                                <div className="card-actions justify-end mt-6">
                                    {user.active_session ? (
                                        <button onClick={handleStopSelf} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none gap-2 shadow-lg w-full">
                                            <MdStopCircle size={20}/> STOP & BAYAR
                                        </button>
                                    ) : (
                                        <button onClick={fetchUserData} className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none gap-2 w-full">
                                            <MdRefresh /> Refresh Data
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MENU CEPAT */}
                        <div className="grid grid-rows-2 gap-4">
                            <button onClick={() => navigate('/menu')} className="card bg-white hover:bg-blue-50 transition-all shadow-md border-l-8 border-blue-500 text-left group">
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
                            <button onClick={() => navigate('/riwayat')} className="card bg-white hover:bg-green-50 transition-all shadow-md border-l-8 border-green-500 text-left group">
                                <div className="card-body p-6 flex-row items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                                        <MdHistory size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Riwayat Pesanan</h3>
                                        <p className="text-sm text-gray-500">Cek status makananmu.</p>
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