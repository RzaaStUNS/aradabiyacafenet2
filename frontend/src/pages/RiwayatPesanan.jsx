import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRestaurant, MdAccessTime, MdCheckCircle, MdLocalDining } from "react-icons/md";

export default function RiwayatPesanan() {
    const navigate = useNavigate();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await api.get('/orders', { headers: { Authorization: `Bearer ${token}` } });
            return res.data.data;
        },
        refetchInterval: 3000
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { color: 'badge-warning', icon: <MdAccessTime/>, text: 'Menunggu' };
            case 'cooked': return { color: 'badge-info', icon: <MdLocalDining/>, text: 'Dimasak' };
            case 'served': return { color: 'badge-success', icon: <MdCheckCircle/>, text: 'Selesai' };
            default: return { color: 'badge-ghost', icon: null, text: status };
        }
    };

    if (isLoading) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-circle btn-sm btn-ghost"><MdArrowBack size={20}/></button>
                    <h1 className="text-xl font-bold">Riwayat Pesanan</h1>
                </div>

                {orders?.length === 0 ? (
                    <div className="text-center mt-20 text-gray-400">
                        <MdRestaurant size={64} className="mx-auto mb-4"/>
                        <p>Belum ada pesanan.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders?.map((order) => {
                            const status = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className="card bg-white shadow-sm border border-gray-200">
                                    <div className="card-body p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Order #{order.id}</div>
                                                <div className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</div>
                                            </div>
                                            <div className={`badge ${status.color} gap-1 text-white p-3`}>
                                                {status.icon} {status.text}
                                            </div>
                                        </div>

                                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-gray-700">{item.quantity}x</span>
                                                        <span className="text-gray-600">{item.menu.name}</span>
                                                    </div>
                                                    <span className="font-mono text-gray-500">Rp {item.subtotal.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed">
                                            <span className="font-semibold text-gray-600">Total Bayar</span>
                                            <span className="text-lg font-bold text-primary">Rp {order.total_price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}