import { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdAttachMoney, MdPersonSearch, MdCheckCircle, MdError, MdReceipt } from "react-icons/md";

export default function Kasir() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', amount: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTopUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/billing/topup', formData, { headers: { Authorization: `Bearer ${token}` } });
            setResult({ success: true, ...res.data.data });
            setFormData({ username: '', amount: '' });
        } catch (error) { setResult({ success: false, message: 'Gagal Top Up. Cek Username!' }); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans flex items-center justify-center">
            <div className="card w-full max-w-lg bg-white shadow-xl border border-gray-200">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-sm btn-circle btn-ghost text-gray-600 hover:bg-gray-100">
                            <MdArrowBack size={20}/>
                        </button>
                        <h2 className="card-title text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MdReceipt className="text-primary"/> Kasir Top Up
                        </h2>
                    </div>
                    
                    <form onSubmit={handleTopUp} className="flex flex-col gap-5">
                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Username Pelanggan</label>
                            <label className="input input-bordered bg-white border-gray-300 flex items-center gap-2 focus-within:border-primary text-gray-800">
                                <MdPersonSearch className="text-gray-400 text-xl"/>
                                <input type="text" className="grow placeholder:text-gray-400" placeholder="Cari user..." value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Nominal (Rupiah)</label>
                            <label className="input input-bordered bg-white border-gray-300 flex items-center gap-2 focus-within:border-primary text-gray-800 font-mono font-bold text-lg">
                                <span className="text-green-600">Rp</span>
                                <input type="number" className="grow placeholder:text-gray-300" placeholder="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                            </label>
                            <label className="label">
                                <span className="label-text-alt text-gray-500 font-medium">Kurs: Rp 1.000 = 10 Menit</span>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary w-full text-white text-lg shadow-md mt-2" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : <><MdAttachMoney size={24}/> Proses Transaksi</>}
                        </button>
                    </form>

                    {result && (
                        <div className={`alert mt-6 ${result.success ? 'alert-success text-white' : 'alert-error text-white'} shadow-lg rounded-lg border-none`}>
                            {result.success ? (
                                <div className="w-full">
                                    <h3 className="font-bold flex items-center gap-2 text-lg"><MdCheckCircle/> Transaksi Berhasil!</h3>
                                    <div className="divider my-2 bg-white/20 h-px"></div>
                                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                                        <span className="opacity-80">Pelanggan:</span> <span className="font-bold text-right">{result.name}</span>
                                        <span className="opacity-80">Waktu Masuk:</span> <span className="font-bold text-right">+{result.added_minutes} Menit</span>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded mt-3 flex justify-between items-center">
                                        <span className="text-sm">Total Saldo Baru:</span> 
                                        <span className="font-bold text-xl">{result.total_balance} Menit</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 font-bold"><MdError size={24}/> <span>{result.message}</span></div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
