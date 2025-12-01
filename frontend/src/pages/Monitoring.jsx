import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/api';
import { MdComputer, MdTimer, MdPlayArrow, MdStop, MdPerson } from "react-icons/md";

export default function Monitoring() {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [usernameInput, setUsernameInput] = useState('');

    const { data: rooms, isLoading, refetch } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await api.get('/rooms', { headers: { Authorization: `Bearer ${token}` }});
            return res.data.data;
        },
        refetchInterval: 5000 
    });

    const handleStart = async () => {
        try {
            const token = localStorage.getItem('token');
            await api.post(`/rooms/${selectedRoom.id}/start`, { username: usernameInput }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Sesi Dimulai!'); setSelectedRoom(null); setUsernameInput(''); refetch();
        } catch (error) { alert(error.response?.data?.message || 'Gagal'); }
    };

    const handleStop = async (roomId) => {
        if(!confirm('Stop sesi ini?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await api.post(`/rooms/${roomId}/stop`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Selesai! Durasi: ${res.data.details.duration}, Sisa: ${res.data.details.sisa_saldo}`); refetch();
        } catch (error) { alert('Gagal'); }
    };

    if (isLoading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-800">
                <MdComputer className="text-primary"/> Monitoring Ruangan
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms?.map((room) => (
                    <div key={room.id} className={`card shadow-sm border-2 transition-all ${room.is_available ? 'border-green-500 bg-white' : 'border-red-500 bg-red-50'}`}>
                        <div className="card-body items-center text-center p-6">
                            
                            {/* ICON MONITOR */}
                            <div className={`text-6xl mb-2 ${room.is_available ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
                                <MdComputer />
                            </div>
                            
                            <h2 className="card-title text-xl font-bold">{room.name}</h2>
                            <div className={`badge ${room.is_available ? 'badge-success' : 'badge-error'} text-white font-bold mb-4`}>
                                {room.is_available ? 'AVAILABLE' : 'OCCUPIED'}
                            </div>

                            {!room.is_available && room.active_session && (
                                <div className="w-full bg-white/50 p-3 rounded-lg border border-red-200 mb-4">
                                    <div className="flex items-center justify-center gap-2 text-gray-800 font-bold">
                                        <MdPerson /> {room.active_session.user.name}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-1">
                                        <MdTimer /> Mulai: {new Date(room.active_session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            )}

                            <div className="w-full">
                                {room.is_available ? (
                                    <button onClick={() => setSelectedRoom(room)} className="btn btn-success w-full text-white gap-2">
                                        <MdPlayArrow size={20}/> Mulai Sewa
                                    </button>
                                ) : (
                                    <button onClick={() => handleStop(room.id)} className="btn btn-error w-full text-white gap-2">
                                        <MdStop size={20}/> Stop Sesi
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRoom && (
                <div className="modal modal-open bg-black/50">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg flex items-center gap-2"><MdPlayArrow/> Sewa: {selectedRoom.name}</h3>
                        <div className="form-control mt-4">
                            <label className="label text-sm text-gray-500">Username Customer</label>
                            <input type="text" placeholder="budi123" className="input input-bordered w-full" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}/>
                        </div>
                        <div className="modal-action">
                            <button onClick={() => setSelectedRoom(null)} className="btn btn-ghost">Batal</button>
                            <button onClick={handleStart} className="btn btn-primary text-white">Mulai</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}