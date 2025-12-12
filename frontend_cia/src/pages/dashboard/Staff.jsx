import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wifi, LogOut, Wallet, Search, Monitor, Play, Square,
  Clock, User, ShoppingBag, History, RefreshCw, AlertCircle,
  DollarSign, Users, Activity
} from "lucide-react";
import * as API from "../../lib/api";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    customers: [],
    sessions: [],
    rooms: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Forms
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sessionForm, setSessionForm] = useState({ username: "", user_id: null, duration: 1 });
  const [topupForm, setTopupForm] = useState({ username: "", user_id: null, amount: "" });
  const [search, setSearch] = useState("");
  const [searchTopup, setSearchTopup] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [showTopupSuggest, setShowTopupSuggest] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms'); // rooms, orders, sessions, history

  const searchRef = useRef(null);
  const topupRef = useRef(null);

  const loadData = async (bg = false) => {
    if (!bg) setLoading(true);
    else setRefreshing(true);

    try {
      const [cust, sess, rooms, ord] = await Promise.all([
        API.fetchCustomers(),
        API.fetchSessions(),
        API.fetchRooms(),
        API.fetchOrders()
      ]);

      setData({
        customers: Array.isArray(cust) ? cust : [],
        sessions: Array.isArray(sess) ? sess : [],
        rooms: Array.isArray(rooms) ? rooms.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        ) : [],
        orders: Array.isArray(ord) ? ord.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        ) : []
      });
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      if (!bg) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh setiap 5 detik untuk monitoring real-time
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggest(false);
      }
      if (topupRef.current && !topupRef.current.contains(e.target)) {
        setShowTopupSuggest(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();

    if (!sessionForm.user_id) {
      return alert("❌ Pilih customer terlebih dahulu!");
    }

    if (!selectedRoom) {
      return alert("❌ Pilih room terlebih dahulu!");
    }

    const duration = parseInt(sessionForm.duration);
    if (duration < 1 || duration > 12) {
      return alert("❌ Durasi harus 1-12 jam!");
    }

    const customer = data.customers.find(c => c.id === sessionForm.user_id);
    const cost = parseInt(selectedRoom.price) * duration;

    if (!confirm(`🎮 Start session?\n\nPC: ${selectedRoom.name}\nCustomer: ${customer.name}\nDurasi: ${duration} jam\nBiaya: Rp ${cost.toLocaleString()}`)) {
      return;
    }

    try {
      await API.startSession({
        user_id: sessionForm.user_id,
        room_id: selectedRoom.id,
        duration_hours: Number(sessionForm.duration)
      });


      alert("✅ Session berhasil dimulai!");
      setSelectedRoom(null);
      setSessionForm({ username: "", user_id: null, duration: 1 });
      setSearch("");
      loadData(true);
    } catch (e) {
      console.error("Start session error:", e);
      alert(`❌ Gagal start session: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleStop = async (session) => {
    if (!confirm(`⏹️ Stop session ${session.room?.name || 'PC'}?\n\nCustomer: ${session.customer?.name || 'Unknown'}`)) {
      return;
    }

    try {
      await API.stopSession({ id: session.id });
      alert("✅ Session berhasil dihentikan!");
      loadData(true);
    } catch (e) {
      console.error("Stop session error:", e);
      alert(`❌ Gagal stop session: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();

    if (!topupForm.user_id) {
      return alert("❌ Pilih customer terlebih dahulu!");
    }

    const amount = parseInt(topupForm.amount);
    if (!amount || amount < 1000) {
      return alert("❌ Minimal top up Rp 1.000!");
    }

    const customer = data.customers.find(c => c.id === topupForm.user_id);

    if (!confirm(`💰 Top Up Saldo?\n\nCustomer: ${customer.name}\nJumlah: Rp ${amount.toLocaleString()}`)) {
      return;
    }

    try {
      await API.topupBilling({
        username: customer.username,
        amount: amount
      });

      alert(`✅ Top up berhasil!\nSaldo baru: Rp ${(parseInt(customer.balance_time || 0) + amount).toLocaleString()}`);
      setTopupForm({ username: "", user_id: null, amount: "" });
      setSearchTopup("");
      loadData(true);
    } catch (e) {
      console.error("Topup error:", e);
      alert(`❌ Gagal top up: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleOrderAction = async (order, newStatus) => {
    const actionText = {
      'processing': 'KLAIM',
      'completed': 'SELESAI',
      'cancelled': 'BATALKAN'
    }[newStatus] || 'PROSES';

    if (!confirm(`${actionText} order ini?\n\nCustomer: ${order.customer?.name || 'Unknown'}\nTotal: Rp ${parseInt(order.total_price || order.total || 0).toLocaleString()}`)) {
      return;
    }

    try {
      await API.updateOrderStatus(order.id, { status: newStatus });
      alert(`✅ Order ${actionText.toLowerCase()} berhasil!`);
      loadData(true);
    } catch (e) {
      console.error("Update order error:", e);
      alert(`❌ Gagal update order: ${e.response?.data?.message || e.message}`);
    }
  };

  const filteredCustomers = data.customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTopupCustomers = data.customers.filter(c =>
    c.name.toLowerCase().includes(searchTopup.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTopup.toLowerCase())
  );

  const activeOrders = data.orders.filter(o =>
    o.status !== 'completed' && o.status !== 'paid' && o.status !== 'cancelled'
  );

  const stats = {
    totalRooms: data.rooms.length,
    activeRooms: data.sessions.length,
    availableRooms: data.rooms.length - data.sessions.length,
    pendingOrders: activeOrders.length
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
          <p>Loading Staff Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">STAFF DASHBOARD</h1>
          <p className="text-xs text-slate-500 mt-1">Monitoring & Management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadData()}
            disabled={refreshing}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refresh..." : "Refresh"}
          </button>
          <button
            onClick={() => { API.logout(); navigate("/"); }}
            className="text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 px-3 py-2 rounded flex items-center gap-2 transition"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <QuickStat icon={Monitor} label="Total PC" value={stats.totalRooms} color="text-cyan-400" />
        <QuickStat icon={Activity} label="PC Aktif" value={stats.activeRooms} color="text-emerald-400" />
        <QuickStat icon={Monitor} label="PC Tersedia" value={stats.availableRooms} color="text-slate-400" />
        <QuickStat icon={ShoppingBag} label="Order Pending" value={stats.pendingOrders} color="text-amber-400" />
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'rooms', label: 'PC Monitor', icon: Monitor },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'sessions', label: 'Active Sessions', icon: Activity },
          { id: 'history', label: 'History', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${activeTab === tab.id
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.id === 'orders' && stats.pendingOrders > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.pendingOrders}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* MAIN CONTENT AREA */}
        <div className="space-y-6">
          {/* PC MONITOR TAB */}
          {activeTab === 'rooms' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Monitor size={18} className="text-cyan-400" />
                Status PC/Room
                <span className="ml-auto text-xs text-slate-500">
                  {stats.activeRooms}/{stats.totalRooms} aktif
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.rooms.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada PC terdaftar</p>
                  </div>
                ) : (
                  data.rooms.map(room => {
                    const session = data.sessions.find(s => s.room_id === room.id);
                    const isActive = !!session;

                    return (
                      <div
                        key={room.id}
                        onClick={() => !isActive && (
                          setSelectedRoom(room),
                          setSessionForm({ username: "", user_id: null, duration: 1 }),
                          setSearch("")
                        )}
                        className={`p-4 rounded-xl border text-center cursor-pointer transition ${isActive
                            ? 'bg-red-900/20 border-red-500/50 cursor-not-allowed'
                            : 'bg-slate-950 border-slate-700 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10'
                          }`}
                      >
                        <p className="font-bold text-lg font-mono mb-1">{room.name}</p>
                        <p className="text-[10px] text-slate-400 mb-2">
                          {room.type} • Rp {parseInt(room.price).toLocaleString()}/jam
                        </p>

                        {isActive ? (
                          <div className="space-y-2">
                            <p className="text-xs text-white truncate font-semibold">
                              {session.customer?.name || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-red-300">
                              {session.duration || 0} jam
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStop(session);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] w-full py-1.5 rounded font-bold transition flex items-center justify-center gap-1"
                            >
                              <Square size={12} />
                              STOP
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-emerald-500 text-[11px] font-bold">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            AVAILABLE
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2">
                <ShoppingBag size={18} />
                Orderan Masuk
                {stats.pendingOrders > 0 && (
                  <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingOrders}
                  </span>
                )}
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {activeOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada order aktif</p>
                  </div>
                ) : (
                  activeOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {order.customer?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {order.type === 'rental' ? '🎮 Booking PC' : '🍔 Food Order'} •
                            {new Date(order.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-emerald-400">
                          Rp {parseInt(order.total_price || order.total || 0).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleOrderAction(order, 'processing')}
                              className="bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs rounded font-bold transition"
                            >
                              KLAIM
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => handleOrderAction(order, 'completed')}
                              className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs rounded font-bold transition"
                            >
                              SELESAI
                            </button>
                          )}
                        </div>
                      </div>

                      {order.note && (
                        <p className="text-xs text-slate-400 mt-2 italic">
                          📝 {order.note}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Activity size={18} />
                Active Sessions
                <span className="ml-auto text-xs text-slate-500">
                  {data.sessions.length} aktif
                </span>
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {data.sessions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada session aktif</p>
                  </div>
                ) : (
                  data.sessions.map(session => (
                    <div
                      key={session.id}
                      className="p-4 bg-slate-950 border border-emerald-500/30 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {session.room?.name || 'PC'}
                          </p>
                          <p className="text-xs text-emerald-400 mt-0.5">
                            {session.customer?.name || 'Unknown'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStop(session)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 text-xs rounded font-bold transition flex items-center gap-1"
                        >
                          <Square size={12} />
                          STOP
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {session.elapsed_hours?.toFixed(2) || "0.00"} jam

                        </span>
                        <span>
                          Mulai: {new Date(session.start_time).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                <History size={18} />
                Riwayat Transaksi
                <span className="ml-auto text-xs text-slate-500">
                  {data.orders.length} transaksi
                </span>
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {data.orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada riwayat transaksi</p>
                  </div>
                ) : (
                  data.orders.map(order => {
                    const customer = data.customers.find(c => c.id === (order.user_id || order.user_id));
                    const room = data.rooms.find(r => r.id === order.room_id);
                    const isPaid = order.status === 'completed' || order.status === 'paid';

                    return (
                      <div
                        key={order.id}
                        className={`p-4 bg-slate-950 border rounded-lg hover:border-slate-700 transition ${isPaid ? 'border-emerald-500/30' : 'border-slate-800'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-bold text-white">
                              {customer?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {order.type === 'rental' ? '🎮 Booking PC' : '🍔 Food Order'}
                              {room && ` • ${room.name}`}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(order.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                          <div>
                            <p className="text-xs text-slate-400">Total</p>
                            <p className="text-lg font-bold text-emerald-400">
                              Rp {parseInt(order.total_price || order.total || 0).toLocaleString()}
                            </p>
                          </div>

                          {isPaid && (
                            <div className="text-right">
                              <p className="text-xs text-emerald-400 font-bold">✓ LUNAS</p>
                              <p className="text-[10px] text-slate-500">
                                Revenue masuk
                              </p>
                            </div>
                          )}
                        </div>

                        {order.note && (
                          <p className="text-xs text-slate-500 mt-2 italic">
                            📝 {order.note}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR - TOP UP */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl h-fit sticky top-6">
          <h2 className="font-bold text-emerald-400 mb-4 text-base flex items-center gap-2">
            <Wallet size={18} />
            Top Up Saldo
          </h2>

          <form onSubmit={handleTopup} className="space-y-4">
            {/* Customer Search */}
            <div className="relative" ref={topupRef}>
              <label className="text-xs text-slate-400 mb-1.5 block">Pilih Customer</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none transition"
                  placeholder="Cari nama atau username..."
                  value={searchTopup}
                  onChange={(e) => {
                    setSearchTopup(e.target.value);
                    setShowTopupSuggest(true);
                  }}
                  onFocus={() => setShowTopupSuggest(true)}
                />
              </div>

              {showTopupSuggest && searchTopup && filteredTopupCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg max-h-48 overflow-y-auto z-20 shadow-xl">
                  {filteredTopupCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="p-3 hover:bg-slate-700 cursor-pointer transition border-b border-slate-700 last:border-0"
                      onClick={() => {
                        setTopupForm({ ...topupForm, username: customer.username, user_id: customer.id });
                        setSearchTopup(customer.name);
                        setShowTopupSuggest(false);
                      }}
                    >
                      <p className="text-sm font-semibold text-white">{customer.name}</p>
                      <p className="text-xs text-slate-400">@{customer.username}</p>
                      <p className="text-xs text-emerald-400 mt-1">
                        Saldo: Rp {parseInt(customer.balance_time || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Jumlah Top Up</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none transition"
                  placeholder="Masukkan nominal..."
                  value={topupForm.amount}
                  onChange={(e) => setTopupForm({ ...topupForm, amount: e.target.value })}
                  min="1000"
                  step="1000"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[10000, 25000, 50000, 100000, 250000, 500000].map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTopupForm({ ...topupForm, amount: amount.toString() })}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 py-2 rounded text-xs font-bold transition"
                >
                  {amount >= 1000000 ? `${amount / 1000000}jt` : `${amount / 1000}k`}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!topupForm.user_id || !topupForm.amount}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 py-3 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Wallet size={16} />
              PROSES TOP UP
            </button>
          </form>

          {/* Customer Info Preview */}
          {topupForm.user_id && (
            <div className="mt-4 p-3 bg-slate-950 border border-slate-700 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Preview:</p>
              <p className="text-sm font-bold text-white">
                {data.customers.find(c => c.id === topupForm.user_id)?.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Saldo saat ini: Rp {parseInt(
                  data.customers.find(c => c.id === topupForm.user_id)?.balance_time || 0
                ).toLocaleString()}
              </p>
              {topupForm.amount && (
                <p className="text-xs text-emerald-400 mt-1">
                  → Saldo baru: Rp {(
                    parseInt(data.customers.find(c => c.id === topupForm.user_id)?.balance_time || 0) +
                    parseInt(topupForm.amount)
                  ).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* START SESSION MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">🎮 Start Session</h3>
            <p className="text-sm text-cyan-400 font-mono mb-4">{selectedRoom.name}</p>

            <form onSubmit={handleStart} className="space-y-4">
              {/* Customer Search */}
              <div className="relative" ref={searchRef}>
                <label className="text-xs text-slate-400 mb-1.5 block">Pilih Customer</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none transition"
                    placeholder="Cari pelanggan..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSuggest(true);
                    }}
                    onFocus={() => setShowSuggest(true)}
                    required
                  />
                </div>

                {showSuggest && search && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg max-h-48 overflow-y-auto z-20 shadow-xl">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="p-3 hover:bg-slate-700 cursor-pointer transition border-b border-slate-700 last:border-0"
                        onClick={() => {
                          setSessionForm({ ...sessionForm, username: customer.username, user_id: customer.id });
                          setSearch(customer.name);
                          setShowSuggest(false);
                        }}
                      >
                        <p className="text-sm font-semibold text-white">{customer.name}</p>
                        <p className="text-xs text-slate-400">@{customer.username}</p>
                        <p className="text-xs text-emerald-400 mt-1">
                          Saldo: Rp {parseInt(customer.balance_time || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration Selection */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Durasi (jam)</label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setSessionForm({ ...sessionForm, duration: hours })}
                      className={`py-2 rounded-lg border text-sm font-bold transition ${sessionForm.duration === hours
                          ? 'bg-cyan-600 border-cyan-600 text-white'
                          : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      {hours}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Preview */}
              {sessionForm.user_id && (
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Harga/jam:</span>
                    <span className="text-white">Rp {parseInt(selectedRoom.price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Durasi:</span>
                    <span className="text-white">{sessionForm.duration} jam</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between">
                    <span className="text-sm font-bold text-white">Total:</span>
                    <span className="text-lg font-bold text-cyan-400">
                      Rp {(parseInt(selectedRoom.price) * sessionForm.duration).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoom(null);
                    setSessionForm({ username: "", user_id: null, duration: 1 });
                    setSearch("");
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-lg text-sm font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!sessionForm.user_id}
                  className="flex-[2] bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  START SESSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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

function QuickStat({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center hover:border-slate-700 transition">
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
      <Icon className={`w-8 h-8 ${color} opacity-80`} />
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: 'PENDING', color: 'bg-amber-600' },
    processing: { label: 'PROSES', color: 'bg-blue-600' },
    completed: { label: 'SELESAI', color: 'bg-emerald-600' },
    cancelled: { label: 'BATAL', color: 'bg-red-600' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`${config.color} text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase`}>
      {config.label}
    </span>
  );
}