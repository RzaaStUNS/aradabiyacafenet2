import { useState, useEffect } from "react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { 
    TrendingUp, Download, RefreshCw, DollarSign, 
    ShoppingCart, Monitor, Calendar 
} from "lucide-react";
import * as API from "../../lib/api";

export default function ReportsTab() {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState({
        stats: {
            totalRevenue: 0,
            totalTransactions: 0,
            avgTransactionValue: 0,
            totalBookings: 0,
            totalFoodOrders: 0
        },
        daily_revenue: [],
        revenue_by_type: [],
        top_menus: [],
        top_rooms: []
    });

    const loadReport = async () => {
        setLoading(true);
        try {
            const data = await API.fetchMonthlyReport(selectedMonth, selectedYear);
            
            // Transform data untuk chart
            const transformedData = {
                stats: data.stats || {
                    totalRevenue: 0,
                    totalTransactions: 0,
                    avgTransactionValue: 0,
                    totalBookings: 0,
                    totalFoodOrders: 0
                },
                daily_revenue: (data.daily_revenue || []).map(item => ({
                    date: item.date,
                    revenue: parseInt(item.revenue) || 0
                })),
                revenue_by_type: (data.revenue_by_type || []).map(item => ({
                    name: item.type === 'rental' ? 'Sewa PC' : item.type === 'food' ? 'Makanan' : 'Top-up',
                    value: parseInt(item.total) || 0
                })),
                top_menus: data.top_menus || [],
                top_rooms: data.top_rooms || []
            };

            setReportData(transformedData);
        } catch (error) {
            console.error("Error loading report:", error);
            alert("❌ Gagal memuat laporan: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [selectedMonth, selectedYear]);

    const handleExport = () => {
        API.exportMonthlyReport(selectedMonth, selectedYear);
    };

    const COLORS = ['#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b'];

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Laporan Bulanan</h2>
                            <p className="text-sm text-slate-400">Analisis transaksi dan pendapatan</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-400 font-semibold">Periode:</span>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm border border-slate-700 focus:outline-none focus:border-cyan-500"
                            >
                                {months.map((month, idx) => (
                                    <option key={idx} value={idx + 1}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm border border-slate-700 focus:outline-none focus:border-cyan-500"
                            >
                                {[2024, 2025, 2026].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Pendapatan"
                    value={`Rp ${(reportData.stats.totalRevenue || 0).toLocaleString('id-ID')}`}
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    iconColor="text-emerald-100"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Total Transaksi"
                    value={reportData.stats.totalTransactions || 0}
                    color="bg-gradient-to-br from-cyan-500 to-cyan-600"
                    iconColor="text-cyan-100"
                />
                <StatCard
                    icon={Monitor}
                    label="Booking PC"
                    value={reportData.stats.totalBookings || 0}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    iconColor="text-purple-100"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Order Makanan"
                    value={reportData.stats.totalFoodOrders || 0}
                    color="bg-gradient-to-br from-pink-500 to-pink-600"
                    iconColor="text-pink-100"
                />
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DAILY REVENUE CHART */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        Grafik Pendapatan Harian
                    </h3>
                    {reportData.daily_revenue.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500">
                            Tidak ada data untuk periode ini
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportData.daily_revenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                                />
                                <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* REVENUE BY TYPE PIE CHART */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-pink-400" />
                        Pendapatan per Jenis Transaksi
                    </h3>
                    {reportData.revenue_by_type.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500">
                            Tidak ada data untuk periode ini
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportData.revenue_by_type}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {reportData.revenue_by_type.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* TOP ITEMS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TOP MENUS */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        🍔 Top 5 Menu Terlaris
                    </h3>
                    {reportData.top_menus.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">Belum ada data menu</div>
                    ) : (
                        <div className="space-y-3">
                            {reportData.top_menus.map((menu, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{menu.name}</p>
                                            <p className="text-slate-400 text-xs">{menu.total_sold} terjual</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold text-sm">
                                            Rp {parseInt(menu.total_revenue).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* TOP ROOMS */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        🖥️ Top 5 PC Tersewa
                    </h3>
                    {reportData.top_rooms.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">Belum ada data booking</div>
                    ) : (
                        <div className="space-y-3">
                            {reportData.top_rooms.map((room, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{room.name}</p>
                                            <p className="text-slate-400 text-xs">{room.total_bookings} kali disewa • {room.total_hours} jam</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold text-sm">
                                            Rp {parseInt(room.total_revenue).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, iconColor }) {
    return (
        <div className={`${color} p-5 rounded-xl shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
        </div>
    );
}