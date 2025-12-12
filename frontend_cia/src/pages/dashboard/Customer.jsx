import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, Activity, UtensilsCrossed, ShoppingBag, LogOut,
  Plus, Minus, Monitor, History, RefreshCw, Clock,
  CheckCircle, XCircle, Gamepad2, X
} from "lucide-react";
import * as API from "../../lib/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/Integrasi/backend_ranu/public/";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    user: null,
    menus: [],
    rooms: [],
    sessions: [],
    orders: []
  });

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("session");
  const [roomForm, setRoomForm] = useState({ id: null, duration: 1 });
  const [showCart, setShowCart] = useState(false);
  const [category, setCategory] = useState("all");

  const parseItems = (items) => {
    try {
      if (!items) return [];
      if (typeof items === "string") return parseItems(order.items)[0]?.image
      if (Array.isArray(items)) return items;
      return [];
    } catch {
      return [];
    }
  };

  // ===== TIMER REALTIME =====
  const [elapsed, setElapsed] = useState(0);

  const loadData = async (bg = false) => {
    if (!bg) setLoading(true);
    else setRefreshing(true);

    try {
      const [u, m, r, s, o] = await Promise.all([
        API.fetchUserProfile(),
        API.fetchMenus(),
        API.fetchRooms(),
        API.fetchSessions(),
        API.fetchMyOrders(),
      ]);

      setData({
        user: u,
        menus: Array.isArray(m) ? m : [],
        rooms: Array.isArray(r)
          ? r.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          )
          : [],
        sessions: Array.isArray(s) ? s : [],
        orders: Array.isArray(o)
          ? o.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : [],
      });
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      if (!bg) setLoading(false);
      else setRefreshing(false);
    }
  };

  const filteredMenus =
    category === "all"
      ? data.menus
      : data.menus.filter((m) => m.category === category);


  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const mySession = data.sessions.find(
    (s) => s.user_id === data.user?.id
  );

  // ===== TIMER REALTIME MENGHITUNG DURASI BERJALAN =====
  useEffect(() => {
    if (!mySession?.start_time) return;

    const startTime = new Date(mySession.start_time);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - startTime;
      const hours = diff / 1000 / 60 / 60;
      setElapsed(hours);
    }, 1000);

    return () => clearInterval(interval);
  }, [mySession]);

  // ===== BOOKING PC =====
  const handleBooking = async () => {
    const mySession = data.sessions.find(
      (s) => s.user_id === data.user?.id
    );

    if (mySession) {
      return alert("❌ Anda sedang bermain! Selesaikan session terlebih dahulu.");
    }

    if (!roomForm.id || !roomForm.duration) {
      return alert("❌ Pilih PC dan durasi dahulu!");
    }

    const room = data.rooms.find((r) => r.id === roomForm.id);
    const cost = parseInt(room.price || 0) * parseInt(roomForm.duration || 0);

    if (!cost || cost <= 0) {
      return alert("❌ Biaya booking tidak valid!");
    }
    if ((data.user?.balance_time || 0) < cost) {
      return alert(
        `❌ Saldo tidak cukup!\n\nBiaya: Rp ${cost.toLocaleString()}\nSaldo Anda: Rp ${(data.user?.balance_time || 0).toLocaleString()}`
      );
    }

    if (
      !confirm(
        `🎮 Konfirmasi Booking:\n\nPC: ${room.name}\nDurasi: ${roomForm.duration} jam\nBiaya: Rp ${cost.toLocaleString()}\n\nSaldo akan dipotong otomatis.`
      )
    ) {
      return;
    }

    try {
      await API.createOrder({
        user_id: data.user.id,
        type: "rental",
        room_id: roomForm.id,
        duration: roomForm.duration,
        total: Number(cost),
        status: "pending",
        note: `Booking ${room.name} - ${roomForm.duration} jam`
      });


      alert("✅ Booking berhasil dikirim!");
      setRoomForm({ id: null, duration: 1 });
      setActiveTab("history");
      loadData(true);
    } catch (e) {
      console.error("Booking error:", e);
      alert(
        `❌ Gagal booking: ${e.response?.data?.message || e.message}`
      );
    }
  };

  // ===== ORDER MAKANAN =====
  const handleFoodOrder = async () => {
    if (cart.length === 0) {
      return alert("❌ Keranjang kosong!");
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    if ((data.user?.balance_time || 0) < total) {
      return alert(
        `❌ Saldo tidak cukup!\n\nTotal: Rp ${total.toLocaleString()}\nSaldo: Rp ${(data.user?.balance_time || 0).toLocaleString()}`
      );
    }

    if (
      !confirm(
        `🍔 Konfirmasi Order Makanan:\n\nTotal: Rp ${total.toLocaleString()}\n\nSaldo akan dipotong otomatis.`
      )
    ) {
      return;
    }

    try {
      await API.createOrder({
        user_id: data.user.id,
        type: "food",
        items: JSON.stringify(cart),
        total_price: total,
        status: "pending",
        note: `Order ${cart.length} item`,
      });

      alert("✅ Pesanan berhasil dikirim!");
      setCart([]);
      setShowCart(false);
      setActiveTab("history");
      loadData(true);
    } catch (e) {
      console.error("Food order error:", e);
      alert(
        `❌ Gagal memesan: ${e.response?.data?.message || e.message}`
      );
    }
  };

  // ===== CART FUNCTIONS =====
  const addToCart = (menu) => {
    const exists = cart.find((item) => item.id === menu.id);

    if (exists) {
      setCart(
        cart.map((item) =>
          item.id === menu.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...menu, qty: 1 }]);
    }
  };

  const updateCartQty = (id, change) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const qty = item.qty + change;
            return qty > 0 ? { ...item, qty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // ===== CART SUMMARY =====
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-32 font-sans relative">

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Halo, {data.user?.name || "Guest"} 👋
          </h1>

          <div className="flex items-center gap-3 mt-2">
            {/* Saldo */}
            <div className="bg-emerald-900/30 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
              <p className="text-xs text-emerald-400 font-semibold">Saldo</p>
              <p className="text-lg font-bold text-emerald-300 font-mono">
                Rp {(data.user?.balance_time || 0).toLocaleString()}
              </p>
            </div>

            {/* Status bermain */}
            {mySession && (
              <div className="bg-cyan-900/30 border border-cyan-500/30 px-3 py-1.5 rounded-lg">
                <p className="text-xs text-cyan-400 font-semibold">Playing</p>
                <p className="text-sm font-bold text-cyan-300">
                  {mySession.room?.name || "PC"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Refresh + Logout */}
        <div className="flex gap-2">
          <button
            onClick={() => loadData()}
            disabled={refreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

          <button
            onClick={() => {
              API.logout();
              navigate("/");
            }}
            className="p-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ===== ACTIVE SESSION BANNER ===== */}
      {mySession ? (
        <div className="bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 border border-cyan-500/30 p-6 rounded-2xl mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">
                🎮 SEDANG BERMAIN
              </p>
              <h2 className="text-3xl font-bold text-white mb-1">
                {mySession.room?.name || "PC"}
              </h2>
              {/* TIMER REALTIME */}
              <p className="text-sm text-slate-300 font-mono">
                Durasi berjalan: <span className="text-cyan-300 font-bold">
                  {elapsed.toFixed(2)} jam
                </span>
              </p>
              {/* Durasi total dari booking */}
              <p className="text-xs text-slate-500 mt-1">
                Durasi dipesan: {mySession.duration} jam
              </p>
            </div>
            <Gamepad2 className="w-16 h-16 text-cyan-400 opacity-50" />
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl mb-6 text-center">
          <p className="text-slate-500 text-sm">
            Belum ada session aktif. Booking PC untuk mulai bermain!
          </p>
        </div>
      )}

      {/* ===== TABS ===== */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "session", label: "Session Info", icon: Monitor },
          { id: "booking", label: "Booking PC", icon: Gamepad2 },
          { id: "food", label: "Order Food", icon: UtensilsCrossed },
          { id: "history", label: "History", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === tab.id
              ? "bg-cyan-600 text-white"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="space-y-6">

        {/* ========= SESSION TAB ========= */}
        {activeTab === "session" && (
          <div className="space-y-4">
            {mySession ? (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-cyan-400" size={20} />
                  Session Aktif
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg">
                    <span className="text-sm text-slate-400">PC/Room</span>
                    <span className="text-sm font-bold text-white">
                      {mySession.room?.name}
                    </span>
                  </div>

                  {/* Durasi Real-Time */}
                  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg">
                    <span className="text-sm text-slate-400">Durasi Berjalan</span>
                    <span className="text-sm font-bold text-cyan-400">
                      {elapsed.toFixed(2)} jam
                    </span>
                  </div>

                  {/* Durasi booking */}
                  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg">
                    <span className="text-sm text-slate-400">Durasi Dipesan</span>
                    <span className="text-sm font-bold text-white">
                      {mySession.duration} jam
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg">
                    <span className="text-sm text-slate-400">Mulai</span>
                    <span className="text-sm font-bold text-white">
                      {new Date(mySession.start_time).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                    <span className="text-sm text-emerald-400">Status</span>
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-slate-400 mb-4">Tidak ada session aktif</p>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2.5 rounded-lg font-bold transition"
                >
                  Booking Sekarang
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========= BOOKING TAB ========= */}
        {activeTab === "booking" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Gamepad2 className="text-cyan-400" size={20} />
                Pilih PC/Room
              </h3>

              {/* List PC */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {data.rooms.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada PC tersedia</p>
                  </div>
                ) : (
                  data.rooms.map((room) => {
                    const isOccupied = data.sessions.some(
                      (s) => s.room_id === room.id
                    );
                    const isSelected = roomForm.id === room.id;

                    return (
                      <button
                        key={room.id}
                        disabled={isOccupied}
                        onClick={() =>
                          setRoomForm({ ...roomForm, id: room.id })
                        }
                        className={`relative p-4 rounded-xl border transition text-left ${isOccupied
                          ? "bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "bg-cyan-900/50 border-cyan-500 shadow-lg"
                            : "bg-slate-950 border-slate-700 hover:border-cyan-500"
                          }`}
                      >
                        <p className="font-bold text-base mb-1">
                          {room.name}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase mb-2">
                          {room.type}
                        </p>
                        <p className="text-sm font-bold text-emerald-400">
                          Rp {parseInt(room.price).toLocaleString()}/jam
                        </p>

                        {isOccupied && (
                          <p className="text-[10px] text-red-400 mt-2 font-bold">
                            OCCUPIED
                          </p>
                        )}

                        {isSelected && (
                          <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-cyan-400" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Pilih Durasi */}
              {roomForm.id && (
                <div className="bg-slate-950 border border-slate-700 p-5 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-3">
                    Pilih Durasi
                  </h4>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                      <button
                        key={h}
                        onClick={() => setRoomForm({ ...roomForm, duration: h })}
                        className={`py-2.5 rounded-lg border text-sm font-bold transition ${roomForm.duration === h
                          ? "bg-cyan-600 border-cyan-600 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                          }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>

                  {/* Price Summary */}
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Harga/jam:</span>
                      <span className="text-white font-semibold">
                        Rp{" "}
                        {parseInt(
                          data.rooms.find((r) => r.id === roomForm.id)?.price || 0
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-400">Durasi:</span>
                      <span className="text-white font-semibold">
                        {roomForm.duration} jam
                      </span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-slate-700">
                      <span className="text-base font-bold">Total:</span>
                      <span className="text-2xl font-bold text-cyan-400">
                        Rp{" "}
                        {(
                          parseInt(
                            data.rooms.find((r) => r.id === roomForm.id)?.price || 0
                          ) * roomForm.duration
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    <Gamepad2 size={18} />
                    BOOKING SEKARANG
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========= FOOD TAB ========= */}
        {activeTab === "food" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UtensilsCrossed className="text-pink-400" size={20} />
                Menu Makanan & Minuman
              </h3>

              {/* FILTER KATEGORI */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {["all", "makanan", "minuman", "cemilan"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${category === cat
                      ? "bg-pink-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* GRID MENU */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMenus.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada menu</p>
                  </div>
                ) : (
                  filteredMenus.map((menu) => {
                    const exists = cart.find((item) => item.id === menu.id);

                    return (
                      <div
                        key={menu.id}
                        className="bg-slate-950 border border-slate-700 p-3 rounded-xl hover:border-slate-600 transition"
                      >
                        {/* GAMBAR MENU */}
                        <img
                          src={`${API_BASE_URL}storage/${menu.image}`}
                          onError={(e) => (e.target.src = "/noimage.png")}
                          className="w-full h-28 object-cover rounded-lg mb-3"
                        />

                        <p className="font-bold text-sm mb-1 truncate">
                          {menu.name}
                        </p>
                        <p className="text-[10px] uppercase text-slate-400 mb-2">
                          {menu.category}
                        </p>
                        <p className="text-lg font-bold text-emerald-400">
                          Rp {parseInt(menu.price).toLocaleString()}
                        </p>

                        {/* ADD TO CART */}
                        {exists ? (
                          <div className="flex items-center mt-3 gap-2">
                            <button
                              onClick={() => updateCartQty(menu.id, -1)}
                              className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
                            >
                              <Minus size={16} className="mx-auto" />
                            </button>

                            <span className="flex-1 text-center font-bold text-lg">
                              {exists.qty}
                            </span>

                            <button
                              onClick={() => updateCartQty(menu.id, 1)}
                              className="flex-1 bg-cyan-600 hover:bg-cyan-700 py-2 rounded-lg"
                            >
                              <Plus size={16} className="mx-auto" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(menu)}
                            className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <Plus size={14} />
                            Tambah
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}


        {/* ========= HISTORY TAB ========= */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <History className="text-purple-400" size={20} />
                Riwayat Transaksi
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {data.orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada riwayat transaksi</p>
                  </div>
                ) : (
                  data.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {order.type === "food" && (
                              <img
                                src={`${API_BASE_URL}storage/${parseItems(order.items)[0]?.image}`}
                                className="w-16 h-16 object-cover rounded-lg mb-3"
                                onError={(e) => (e.target.src = "/noimage.png")}
                              />
                            )}
                            {order.type === "rental"
                              ? "🎮 Booking PC"
                              : order.type === "topup"
                                ? "💰 Top Up Saldo"
                                : "🍔 Food Order"}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(order.created_at).toLocaleString("id-ID")}
                          </p>
                        </div>

                        <OrderStatusBadge status={order.status} />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-xs text-slate-400">
                          Total
                        </span>
                        <span className="text-lg font-bold text-emerald-400">
                          Rp{" "}
                          {parseInt(
                            order.total_price || order.total || 0
                          ).toLocaleString()}
                        </span>
                      </div>

                      {order.note && (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          📝 {order.note}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========= CART FLOATING BUTTON ========= */}
      {cart.length > 0 && activeTab === "food" && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-6 py-4 rounded-full shadow-xl font-bold flex items-center gap-3 z-40"
        >
          <ShoppingBag size={20} />
          <span>
            {cartCount} Item • Rp {cartTotal.toLocaleString()}
          </span>
        </button>
      )}

      {/* ========= CART MODAL ========= */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[80vh] flex flex-col">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Keranjang Belanja 🛒</h3>
              <button onClick={() => setShowCart(false)}>
                <X size={24} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <img
                    src={`${API_BASE_URL}storage/${item.image}`}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        Rp {parseInt(item.price).toLocaleString()} × {item.qty}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-8 text-center font-bold">{item.qty}</span>

                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="font-bold text-emerald-400">
                      Rp {(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="border-t border-slate-700 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-emerald-400">
                  Rp {cartTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleFoodOrder}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                PESAN SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}

    </div> // TUTUP DIV UTAMA
  ); // TUTUP RETURN
} // TUTUP KOMPONEN CUSTOMER DASHBOARD

// === REUSABLE COMPONENT: ORDER STATUS BADGE ===
// === DILETAKKAN DI LUAR KOMPONEN UTAMA ===
function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: "PENDING",
      color: "bg-amber-600",
      icon: Clock,
    },
    processing: {
      label: "DIPROSES",
      color: "bg-blue-600",
      icon: RefreshCw,
    },
    completed: {
      label: "SELESAI",
      color: "bg-emerald-600",
      icon: CheckCircle,
    },
    paid: {
      label: "DIBAYAR",
      color: "bg-green-600",
      icon: CheckCircle,
    },
    cancelled: {
      label: "BATAL",
      color: "bg-red-600",
      icon: XCircle,
    },
  };

  // Jika status tidak dikenali → fallback ke pending
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`${config.color} text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase flex items-center gap-1`}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );
}