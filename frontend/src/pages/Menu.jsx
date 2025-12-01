import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { MdShoppingCart, MdAdd, MdRemove, MdArrowBack, MdCheckCircle } from "react-icons/md";

export default function Menu() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { data: menus, isLoading, isError } = useQuery({
        queryKey: ['menus'],
        queryFn: async () => {
            const res = await api.get('/menus');
            return res.data.data;
        }
    });

    const addToCart = (menu) => {
        setCart((prev) => {
            const exist = prev.find((item) => item.id === menu.id);
            return exist 
                ? prev.map((item) => item.id === menu.id ? { ...item, qty: item.qty + 1 } : item)
                : [...prev, { ...menu, qty: 1 }];
        });
    };

    const removeFromCart = (menuId) => {
        setCart((prev) => prev.map(item => item.id === menuId ? { ...item, qty: item.qty - 1 } : item).filter(item => item.qty > 0));
    };

    const totalPrice = cart.reduce((t, i) => t + (i.price * i.qty), 0);
    const totalItems = cart.reduce((t, i) => t + i.qty, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const token = localStorage.getItem('token');
            await api.post('/orders', { room_id: 1, items: cart.map(i => ({ id: i.id, qty: i.qty })) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Pesanan Berhasil!');
            setCart([]); setIsCartOpen(false); navigate('/dashboard');
        } catch (error) { alert('❌ Gagal memesan. Login dulu!'); }
    };

    if (isLoading) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-circle text-gray-700"><MdArrowBack size={24}/></button>
                <h1 className="text-xl font-bold text-gray-800">Daftar Menu</h1>
            </div>

            {/* Grid Card Menu */}
            <div className="p-4 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus?.map((item) => (
                    // CARD PUTIH
                    <div key={item.id} className="card bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all">
                        <figure className="h-48 bg-gray-100">
                            {/* Placeholder gambar */}
                            <img src="https://placehold.co/400x250/e2e8f0/475569?text=Menu" alt={item.name} className="w-full h-full object-cover"/>
                        </figure>
                        <div className="card-body p-5">
                            <div className="flex justify-between items-start">
                                {/* TULISAN JUDUL HITAM */}
                                <h2 className="card-title text-gray-800 text-lg">{item.name}</h2>
                                <span className="badge badge-ghost text-xs uppercase font-bold">{item.category}</span>
                            </div>
                            {/* DESKRIPSI ABU GELAP (Bukan Cream) */}
                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                            
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                {/* HARGA WARNA PRIMARY */}
                                <span className="text-lg font-bold text-primary">Rp {item.price.toLocaleString()}</span>
                                <button onClick={() => addToCart(item)} className="btn btn-sm btn-primary text-white gap-2 shadow-md">
                                    <MdAdd size={18}/> Pesan
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button onClick={() => setIsCartOpen(true)} className="btn btn-lg btn-primary rounded-full shadow-2xl flex items-center gap-3 px-6 text-white border-2 border-white">
                        <div className="indicator">
                            <MdShoppingCart size={28} />
                            <span className="indicator-item badge badge-secondary badge-sm border-none">{totalItems}</span>
                        </div>
                        <span className="font-bold text-lg">Rp {totalPrice.toLocaleString()}</span>
                    </button>
                </div>
            )}

            {/* Modal Keranjang */}
            {isCartOpen && (
                <div className="modal modal-open bg-black/60 backdrop-blur-sm">
                    <div className="modal-box p-0 overflow-hidden bg-white">
                        <div className="bg-primary text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2"><MdShoppingCart/> Keranjang Pesanan</h3>
                            <button onClick={() => setIsCartOpen(false)} className="btn btn-sm btn-ghost btn-circle text-white hover:bg-white/20">✕</button>
                        </div>
                        <div className="p-4 flex flex-col gap-4 max-h-96 overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div>
                                        <div className="font-bold text-gray-800">{item.name}</div>
                                        <div className="text-xs text-gray-500">@ Rp {item.price.toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                                        <button onClick={() => removeFromCart(item.id)} className="btn btn-xs btn-ghost btn-circle text-red-500"><MdRemove/></button>
                                        <span className="font-bold text-gray-800 w-6 text-center">{item.qty}</span>
                                        <button onClick={() => addToCart(item)} className="btn btn-xs btn-ghost btn-circle text-green-600"><MdAdd/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-between font-bold text-lg mb-4 text-gray-800">
                                <span>Total Bayar</span>
                                <span className="text-primary">Rp {totalPrice.toLocaleString()}</span>
                            </div>
                            <button onClick={handleCheckout} className="btn btn-success w-full text-white gap-2 font-bold shadow-md">
                                <MdCheckCircle size={20}/> Konfirmasi Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}