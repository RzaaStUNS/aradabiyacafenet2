import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRefresh, MdSoupKitchen, MdRoomService, MdCheckCircle, MdRestaurant, MdTimer, MdLocationOn } from "react-icons/md";

export default function PesananMasuk() {
    const navigate = useNavigate();
    const { data: orders, isLoading, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await api.get('/orders', { headers: { Authorization: `Bearer ${token}` } });
            return res.data.data;
        },
        refetchInterval: 5000
    });

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await api.put(`/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            refetch();
        } catch (error) { alert('Gagal update status'); }
    };

    const getStatusBadge = (status) => {
        if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (status === 'cooked') return 'bg-blue-100 text-blue-800 border-blue-200';
        if (status === 'served') return 'bg-green-100 text-green-800 border-green-200';
        return 'bg-gray-100 text-gray-800';
    };

    if (isLoading) return <div className="text-center mt-20 text-gray-600">Memuat Pesanan Dapur...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-circle btn-ghost text-gray-600 hover:bg-gray-100"><MdArrowBack size={24}/></button>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><MdRestaurant className="text-orange-500"/> Dapur & Pesanan</h1>
                    </div>
                    <button onClick={() => refetch()} className="btn btn-outline btn-sm gap-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-gray-300"><MdRefresh/> Refresh Data</button>
                </div>

                <div className="overflow-hidden bg-white rounded-xl shadow border border-gray-200">
                    <table className="table w-full">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-4">Info Order</th>
                                <th>Lokasi</th>
                                <th>Detail Menu</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Aksi Dapur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders?.map((order) => (
                                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 text-lg">#{order.id}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                                            <MdTimer className="text-gray-400"/> {new Date(order.created_at).toLocaleTimeString('id-ID')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold text-gray-700">{order.user.name}</div>
                                        <div className="badge badge-neutral text-white badge-sm mt-1 gap-1 pl-1 pr-2">
                                            <MdLocationOn size={12}/> Meja {order.room_id}
                                        </div>
                                    </td>
                                    <td>
                                        <ul className="text-sm space-y-1 bg-gray-50 p-2 rounded border border-gray-100">
                                            {order.items.map((item) => (
                                                <li key={item.id} className="flex gap-2 items-center">
                                                    <span className="font-bold bg-white border border-gray-200 px-1.5 rounded text-gray-800 text-xs">{item.quantity}x</span>
                                                    <span className="text-gray-700 font-medium">{item.menu.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="font-bold text-primary font-mono text-lg">Rp {order.total_price.toLocaleString('id-ID')}</td>
                                    <td>
                                        <div className={`badge ${getStatusBadge(order.status)} font-bold uppercase text-xs p-3 border`}>
                                            {order.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {order.status === 'pending' && (
                                                <button onClick={() => handleStatusChange(order.id, 'cooked')} className="btn btn-sm btn-info text-white gap-2 shadow-sm border-none bg-blue-500 hover:bg-blue-600">
                                                    <MdSoupKitchen size={18}/> Masak
                                                </button>
                                            )}
                                            {order.status === 'cooked' && (
                                                <button onClick={() => handleStatusChange(order.id, 'served')} className="btn btn-sm btn-success text-white gap-2 shadow-sm border-none bg-green-500 hover:bg-green-600">
                                                    <MdRoomService size={18}/> Antar
                                                </button>
                                            )}
                                            {order.status === 'served' && (
                                                <span className="text-green-600 flex items-center gap-1 text-sm font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                                    <MdCheckCircle/> Selesai
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}