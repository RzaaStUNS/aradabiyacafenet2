import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity, MonitorSmartphone, Users, CreditCard,
    UtensilsCrossed, Trash2, Edit, Plus, X, LogOut, Monitor, RefreshCw, AlertCircle, History,
    Wallet
} from "lucide-react";
import * as API from "../../lib/api";
import { API_BASE_URL } from "../../lib/api";
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        stats: { totalComputers: 0, activeComputers: 0, todayRevenue: 0 },
        menus: [],
        staff: [],
        customers: [],
        rooms: [],
        sessions: [],
        orders: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [modal, setModal] = useState({ show: false, type: '', editMode: false, id: null });
    const [form, setForm] = useState({
        name: "",
        price: "",
        category: "",
        description: "",
        image: null
    });
    const [submitting, setSubmitting] = useState(false);

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);

        try {
            const [stats, menus, staff, customers, rooms, sessions, orders] = await Promise.all([
                API.fetchDashboardStats(),
                API.fetchMenus(),
                API.fetchStaff(),
                API.fetchCustomers(),
                API.fetchRooms(),
                API.fetchSessions(),
                API.fetchOrders()
            ]);

            setData({
                // Pastikan struktur stats aman, jika null, berikan default
                stats: stats || { totalComputers: 0, activeComputers: 0, todayRevenue: 0 },
                menus: Array.isArray(menus) ? menus : [],
                staff: Array.isArray(staff) ? staff : [],
                customers: Array.isArray(customers) ? customers : [],
                rooms: Array.isArray(rooms) ? rooms.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true })
                ) : [],
                sessions: Array.isArray(sessions) ? sessions : [],
                // Sortir orders berdasarkan waktu terbaru
                orders: Array.isArray(orders) ? orders.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                ) : []
            });
        } catch (e) {
            console.error("Load data error:", e);
            // Tangkap error 401/Unauthorized dan arahkan ke login
            if (e.response && e.response.status === 401) {
                alert("Sesi habis atau tidak memiliki izin. Silakan login kembali.");
                navigate("/login");
            }
            setError(e.message || "Gagal memuat data");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Auto refresh setiap 10 detik (background)
        const interval = setInterval(() => loadData(true), 10000);
        return () => clearInterval(interval);
    }, []);

    // --- HANDLER MODAL ---
    const openModal = (type, item = null) => {
        setModal({ show: true, type, editMode: !!item, id: item?.id });

        if (item) {
            setForm({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                description: item.description || "",
                image: null,          // penting! biar tidak dianggap FILE
                oldImage: item.image  // simpan nama gambar lama
            });
            if (type === 'staff' || type === 'customer') {
                f.password = ""; // Reset password field
                // Pastikan balance_time adalah string untuk input type number
                f.balance_time = String(item.balance_time || 0);
            }
            setForm(f);
        } else {
            // Default values untuk form baru
            if (type === 'room') {
                setForm({ name: "", type: "regular", price: "5000", status: "available" });
            }
            if (type === 'menu') {
                setForm({ name: "", price: "", category: "makanan", available: true });
            }
            if (type === 'staff' || type === 'customer') {
                setForm({
                    name: "",
                    username: "",
                    email: "",
                    password: "",
                    ktp_number: "",
                    role: type,
                    balance_time: type === 'customer' ? "0" : undefined
                });
            }
        }
    };

    const closeModal = () => {
        setModal({ show: false, type: '', editMode: false, id: null });
        setForm({});
        setSubmitting(false);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
        const payload = { ...form };
        
        // Validasi dasar
        if (modal.type === 'menu') {
            if (!payload.name?.trim()) {
                throw new Error("Nama menu wajib diisi");
            }
            if (!payload.price || parseInt(payload.price) < 0) {
                throw new Error("Harga menu tidak valid");
            }
            if (!payload.category) {
                throw new Error("Kategori menu wajib dipilih");
            }
        }
        
        if (modal.type === 'room' && !payload.name?.trim()) {
            throw new Error("Nama PC wajib diisi");
        }

        // Konversi angka
        if (payload.balance_time) {
            payload.balance_time = parseInt(payload.balance_time);
        }

        // Hapus password kosong saat edit user
        if ((modal.type === 'staff' || modal.type === 'customer') && modal.editMode && !payload.password) {
            delete payload.password;
        }

        // Untuk menu, pastikan description tidak undefined
        if (modal.type === 'menu') {
            payload.description = payload.description || '';
        }

        // Execute API call berdasarkan type
        if (modal.type === 'room') {
            await (modal.editMode 
                ? API.updateRoom(modal.id, payload)
                : API.createRoom(payload));
        }
        
        if (modal.type === 'menu') {
            await (modal.editMode 
                ? API.updateMenu(modal.id, payload)
                : API.createMenu(payload));
        }
        
        if (modal.type === 'staff') {
            await (modal.editMode 
                ? API.updateStaff(modal.id, payload)
                : API.createStaff(payload));
        }
        
        if (modal.type === 'customer') {
            await (modal.editMode 
                ? API.updateCustomer(modal.id, payload)
                : API.createCustomer(payload));
        }

        alert(`✅ Berhasil ${modal.editMode ? 'mengupdate' : 'menambah'} ${modal.type}!`);
        closeModal();
        loadData(true);
        
    } catch (err) {
        console.error("Submit error:", err);
        
        // Error handling yang lebih baik
        let errorMessage = "Terjadi kesalahan tidak diketahui";
        
        if (err.response) {
            // Error dari server
            const data = err.response.data;
            errorMessage = data?.message || `Server error: ${err.response.status}`;
            
            // Log detail error untuk debugging
            console.error("Server response:", data);
        } else if (err.message) {
            // Error dari validasi client
            errorMessage = err.message;
        }
        
        alert(`❌ Gagal: ${errorMessage}`);
    } finally {
        setSubmitting(false);
    }
};

    const handleDelete = async (type, id) => {
        if (!confirm("⚠️ Yakin ingin menghapus data ini?")) return;

        try {
            if (type === 'room') await API.deleteRoom(id);
            if (type === 'menu') await API.deleteMenu(id);
            if (type === 'staff') await API.deleteStaff(id);
            if (type === 'customer') await API.deleteCustomer(id);

            alert("✅ Data berhasil dihapus!");
            loadData(true);
        } catch (e) {
            console.error("Delete error:", e);
            alert(`❌ Gagal menghapus: ${e.response?.data?.message || e.message}`);
        }
    };

    const handleLogout = async () => {
        if (confirm("Keluar dari dashboard?")) {
            await API.logout();
            navigate("/");
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
                    <p>Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-20 font-sans">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-xs text-slate-500 mt-1">Management Panel - CafeNet System</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => loadData()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs flex gap-2 items-center transition"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded text-xs flex gap-2 items-center transition"
                    >
                        <LogOut size={14} />
                        Keluar
                    </button>
                </div>
            </div>

            {/* ERROR BANNER */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-400 font-semibold text-sm">Terjadi kesalahan</p>
                        <p className="text-red-300 text-xs mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={MonitorSmartphone}
                    label="Total PC"
                    value={data.rooms.length}
                    color="text-cyan-400"
                    subtext={`${data.sessions.length} aktif`}
                />
                <StatCard
                    icon={Activity}
                    label="PC Aktif"
                    value={data.sessions.length}
                    color="text-emerald-400"
                    subtext={`${data.rooms.length - data.sessions.length} tersedia`}
                />
                <StatCard
                    icon={Users}
                    label="Total Member"
                    value={data.customers.length}
                    color="text-purple-400"
                    subtext={`${data.staff.length} staff`}
                />
                <StatCard
                    icon={CreditCard}
                    label="Pendapatan Hari Ini"
                    // Masalah uang (revenue) ada di sini, pastikan API mengembalikan data yang benar.
                    value={`Rp ${(data.stats.todayRevenue || 0).toLocaleString('id-ID')}`}
                    color="text-amber-400"
                    subtext="Total transaksi hari ini"
                />
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* ROOMS */}
                <CardList
                    title="Data PC / Room"
                    icon={Monitor}
                    color="text-cyan-400"
                    onAdd={() => openModal('room')}
                    count={data.rooms.length}
                >
                    {data.rooms.length === 0 ? (
                        <EmptyState message="Belum ada PC terdaftar" />
                    ) : (
                        data.rooms.map(r => {
                            const isActive = data.sessions.some(s => s.room_id === r.id);
                            return (
                                <ListItem
                                    key={r.id}
                                    title={r.name}
                                    subtitle={`${r.type} • Rp ${parseInt(r.price).toLocaleString()}/jam`}
                                    badge={isActive ? { text: "AKTIF", color: "bg-emerald-600" } : null}
                                    onEdit={() => openModal('room', r)}
                                    onDelete={() => handleDelete('room', r.id)}
                                />
                            );
                        })
                    )}
                </CardList>

                {/* MENUS */}
                <CardList
                    title="Menu Makanan & Minuman"
                    icon={UtensilsCrossed}
                    color="text-pink-400"
                    onAdd={() => openModal('menu')}
                    count={data.menus.length}
                >
                    {data.menus.length === 0 ? (
                        <EmptyState message="Belum ada menu tersedia" />
                    ) : (
                        data.menus.map(m => (
                            <ListItem
                                key={m.id}
                                title={m.name}
                                subtitle={`${m.category} • Rp ${parseInt(m.price).toLocaleString()}`}
                                onEdit={() => openModal('menu', m)}
                                onDelete={() => handleDelete('menu', m.id)}
                            />
                        ))
                    )}
                </CardList>

                {/* USERS */}
                <CardList
                    title="Manajemen User"
                    icon={Users}
                    color="text-emerald-400"
                    onAdd={() => openModal('customer')}
                    count={data.staff.length + data.customers.length}
                >
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                STAFF ({data.staff.length})
                            </p>
                            {data.staff.length === 0 ? (
                                <p className="text-xs text-slate-600 italic">Belum ada staff</p>
                            ) : (
                                data.staff.map(s => (
                                    <ListItem
                                        key={s.id}
                                        title={s.name}
                                        subtitle={`@${s.username} • ${s.email}`}
                                        onEdit={() => openModal('staff', s)}
                                        onDelete={() => handleDelete('staff', s.id)}
                                    />
                                ))
                            )}
                        </div>

                        <div className="border-t border-slate-800 pt-3">
                            <p className="text-[10px] text-slate-500 font-bold mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                CUSTOMER ({data.customers.length})
                            </p>
                            {data.customers.length === 0 ? (
                                <p className="text-xs text-slate-600 italic">Belum ada customer</p>
                            ) : (
                                data.customers.map(c => (
                                    <ListItem
                                        key={c.id}
                                        title={c.name}
                                        // PENTING: Gunakan parseInt(c.balance_time || 0) untuk memastikan nilai numerik
                                        subtitle={`@${c.username} • Saldo: Rp ${parseInt(c.balance_time || 0).toLocaleString()}`}
                                        onEdit={() => openModal('customer', c)}
                                        onDelete={() => handleDelete('customer', c.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </CardList>
            </div>

            {/* === BAGIAN BARU: TRANSAKSI & ORDER HISTORY === */}
            <div className="mt-8">
                <CardList
                    title="Riwayat Transaksi & Order Terbaru"
                    icon={History}
                    color="text-amber-400"
                    onAdd={() => alert("Gunakan Staff Panel untuk membuat transaksi baru (Top-up/Sewa PC).")}
                    count={data.orders.length}
                >
                    {data.orders.length === 0 ? (
                        <EmptyState message="Belum ada riwayat order/transaksi." />
                    ) : (
                        // Tampilkan 15 transaksi terbaru saja
                        data.orders.slice(0, 15).map(o => (
                            <div key={o.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TransactionStatusBadge status={o.status} />
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(o.created_at).toLocaleString('id-ID', { timeStyle: 'short', dateStyle: 'short' })}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-white truncate">
                                        {o.type === 'rental'
                                            ? `Sewa PC (${o.room?.name || 'PC'})`
                                            : o.type === 'food'
                                                ? `Order Makanan (${o.note || 'Dapur'})`
                                                : `Top-Up Saldo (${o.customer?.name || 'Customer'})`
                                        }
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Total: <span className="font-mono text-amber-300">
                                            Rp {parseInt(o.total_price || 0).toLocaleString('id-ID')}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    {o.type === 'rental' && o.duration && <span className="text-[10px] text-cyan-400">{o.duration} Jam</span>}
                                    {o.customer && <span className="text-[10px] text-purple-400 block">Member</span>}
                                </div>
                            </div>
                        ))
                    )}
                </CardList>
            </div>


            {/* MODAL FORM */}
            {modal.show && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold text-lg">
                                {modal.editMode ? '✏️ Edit' : '➕ Tambah'} {modal.type.toUpperCase()}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* ROOM FORM */}
                            {modal.type === 'room' && (
                                <>
                                    <input
                                        className="input"
                                        placeholder="Nama PC (contoh: PC-01)"
                                        value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            className="input"
                                            value={form.type || 'regular'}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                        >
                                            <option value="regular">Regular</option>
                                            <option value="premium">VIP</option>
                                        </select>
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Harga/jam"
                                            value={form.price || ''}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* MENU FORM */}
                            {modal.type === 'menu' && (
                                <>
                                    <input
                                        className="input"
                                        placeholder="Nama Menu"
                                        value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />

                                    <textarea
                                        className="input"
                                        placeholder="Deskripsi (optional)"
                                        value={form.description || ""}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    ></textarea>

                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Harga"
                                            value={form.price || ''}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                            required
                                        />
                                        <select
                                            className="input"
                                            value={form.category || 'makanan'}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                        >
                                            <option value="makanan">Makanan</option>
                                            <option value="minuman">Minuman</option>
                                            <option value="cemilan">Cemilan</option>
                                        </select>
                                    </div>

                                    {/* FILE UPLOAD */}
                                   <input
                className="input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        // Validasi ukuran (max 4MB)
                        if (file.size > 4 * 1024 * 1024) {
                            alert("❌ Ukuran file maksimal 4MB!");
                            e.target.value = "";
                            return;
                        }
                        setForm({ ...form, image: file });
                    }
                }}
            />

                                    {/* PREVIEW */}
                                    <img
                                        src={
                                            form.image instanceof File
                                                ? URL.createObjectURL(form.image)
                                                : `${import.meta.env.VITE_API_BASE_URL}storage/${form.oldImage}`
                                        }
                                        className="w-full h-40 object-cover rounded-lg mt-3"
                                    />
                                </>
                            )}

                            {/* USER FORM (STAFF & CUSTOMER) */}
                            {(modal.type === 'staff' || modal.type === 'customer') && (
                                <>
                                    <input
                                        className="input"
                                        placeholder="Nama Lengkap"
                                        value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input"
                                        placeholder="Username"
                                        value={form.username || ''}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input"
                                        type="email"
                                        placeholder="Email"
                                        value={form.email || ''}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input"
                                        placeholder="No KTP"
                                        value={form.ktp_number || ''}
                                        onChange={e => setForm({ ...form, ktp_number: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input"
                                        type="password"
                                        placeholder={modal.editMode ? "Kosongkan jika tidak diubah" : "Password"}
                                        value={form.password || ''}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required={!modal.editMode}
                                    />
                                    {modal.type === 'customer' && (
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Saldo Awal / Saldo Saat Ini"
                                            value={form.balance_time || '0'}
                                            onChange={e => setForm({ ...form, balance_time: e.target.value })}
                                        />
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-2.5 rounded-lg text-white font-bold mt-4 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>💾 SIMPAN DATA</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .input {
                    width: 100%;
                    background: #0f172a;
                    border: 1px solid #334155;
                    padding: 10px 12px;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .input:focus {
                    outline: none;
                    border-color: #06b6d4;
                    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0f172a;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </div>
    );
}

// === REUSABLE COMPONENTS ===

function StatCard({ label, value, icon: Icon, color, subtext }) {
    return (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center hover:border-slate-700 transition group">
            <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{label}</p>
                <p className="text-xl md:text-2xl text-white font-bold mt-1 leading-tight">{value}</p>
                {subtext && <p className="text-[10px] text-slate-600 mt-1">{subtext}</p>}
            </div>
            <Icon className={`w-8 h-8 md:w-10 md:h-10 ${color} opacity-80 group-hover:opacity-100 transition`} />
        </div>
    );
}

function CardList({ title, icon: Icon, color, children, onAdd, count }) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold text-sm ${color} flex gap-2 items-center`}>
                    <Icon size={18} />
                    {title}
                    {count !== undefined && (
                        <span className="ml-1 text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                            {count}
                        </span>
                    )}
                </h3>
                <button
                    onClick={onAdd}
                    className="bg-slate-800 hover:bg-cyan-600 p-1.5 rounded text-white transition group"
                    title="Tambah Data"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                </button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
                {children}
            </div>
        </div>
    );
}

function ListItem({ title, subtitle, onEdit, onDelete, badge }) {
    return (
        <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white truncate">{title}</p>
                    {badge && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${badge.color} text-white font-bold`}>
                            {badge.text}
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{subtitle}</p>
            </div>
            <div className="flex gap-1 ml-2">
                <button
                    onClick={onEdit}
                    className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                    title="Edit"
                >
                    <Edit size={14} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition"
                    title="Hapus"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-600 italic">{message}</p>
        </div>
    );
}

function TransactionStatusBadge({ status }) {
    const statusConfig = {
        pending: { label: 'PENDING', color: 'bg-amber-600' },
        processing: { label: 'PROSES', color: 'bg-blue-600' },
        completed: { label: 'SELESAI', color: 'bg-emerald-600' },
        paid: { label: 'LUNAS', color: 'bg-green-600' },
        cancelled: { label: 'BATAL', color: 'bg-red-600' },
        default: { label: 'DRAFT', color: 'bg-slate-600' }
    };

    const config = statusConfig[status] || statusConfig.default;

    return (
        <span className={`${config.color} text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
            {config.label}
        </span>
    );
}