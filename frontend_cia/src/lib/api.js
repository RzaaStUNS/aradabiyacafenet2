import axios from "axios";

// Base URL backend Laravel
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost/Integrasi/backend_ranu/public/";

export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false // False karena kita pakai Bearer Token manual
});

// Attach token ke semua request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aradabiya_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// --- SAFE FETCH ---
async function safeFetch(requestPromise, defaultValue = []) {
  try {
    const res = await requestPromise;
    const val = res.data;

    // Handle berbagai format return Laravel
    if (val && val.data) return val.data;
    if (Array.isArray(val) || typeof val === "object") return val;
    return defaultValue;
  } catch (err) {
    console.warn("API Warning:", err.message);
    return defaultValue;
  }
}

// =======================
// 🔐 AUTH
// =======================

export const login = async (creds) => {
  try {
    const res = await api.post("/api/login", creds);
    const d = res.data.data || res.data;

    localStorage.setItem("aradabiya_token", d.token);
    localStorage.setItem("aradabiya_user", JSON.stringify(d.user));

    return d;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

// [UPDATE] Register dengan Error Handling yang lebih baik untuk Captcha/Validasi
export const register = async (payload) => {
  try {
    const res = await api.post("/api/register", payload);
    return res.data;
  } catch (err) {
    // Ambil pesan error spesifik dari backend (misal: "Captcha salah")
    throw new Error(err.response?.data?.message || "Registrasi Gagal");
  }
};

export const logout = async () => {
  try {
    await api.post("/api/logout");
  } catch {}
  finally {
    localStorage.clear();
    window.location.href = "/";
  }
};

// =======================
// 🛠️ SYSTEM & UTILS (SKD TOPICS)
// =======================

// [BARU] Untuk Backup Database (Topik 4)
export const triggerBackup = async () => {
    try {
        const res = await api.get("/api/system/backup");
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Backup Gagal");
    }
};

// =======================
// 📌 FETCHING DATA
// =======================

export const fetchDashboardStats = () =>
  safeFetch(api.get("/api/reports/stats"), {
    totalComputers: 0,
    activeComputers: 0,
    todayRevenue: 0,
  });

export const fetchRooms = () => safeFetch(api.get("/api/rooms"), []);
export const fetchMenus = () => safeFetch(api.get("/api/menus"), []);
export const fetchStaff = () => safeFetch(api.get("/api/staff"), []);
export const fetchCustomers = () => safeFetch(api.get("/api/customers"), []);
export const fetchSessions = () => safeFetch(api.get("/api/sessions"), []);
export const fetchOrders = () => safeFetch(api.get("/api/orders"), []);

export const fetchUserProfile = async () => {
  try {
    const res = await api.get("/api/user");
    return res.data;
  } catch {
    return null;
  }
};

// =======================
// 🖥️ ROOMS CRUD
// =======================

export const createRoom = (d) => api.post("/api/rooms", d);
export const updateRoom = (id, d) => api.put(`/api/rooms/${id}`, d);
export const deleteRoom = (id) => api.delete(`/api/rooms/${id}`);

// =======================
// 🍔 MENUS CRUD (FILE UPLOAD SECURITY)
// =======================

export const createMenu = (data) => {
  const form = new FormData();
  form.append("name", data.name || "");
  form.append("price", data.price || "0");
  form.append("category", data.category || "makanan");
  form.append("description", data.description || "");

  if (data.image && data.image instanceof File) {
    form.append("image", data.image);
  }

  return api.post("/api/menus", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const updateMenu = (id, data) => {
  const form = new FormData();
  form.append("name", data.name || "");
  form.append("price", data.price || "0");
  form.append("category", data.category || "makanan");
  form.append("description", data.description || "");

  if (data.image && data.image instanceof File) {
    form.append("image", data.image);
  }

  form.append("_method", "PUT"); // Trik Laravel untuk PUT file

  return api.post(`/api/menus/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const deleteMenu = (id) => api.delete(`/api/menus/${id}`);

// =======================
// 👥 USERS (STAFF / CUSTOMER)
// =======================

export const createStaff = (d) => api.post("/api/staff", d);
export const updateStaff = (id, d) => api.put(`/api/staff/${id}`, d);
export const deleteStaff = (id) => api.delete(`/api/staff/${id}`);

export const createCustomer = (d) => api.post("/api/customers", d);
export const updateCustomer = (id, d) => api.put(`/api/customers/${id}`, d);
export const deleteCustomer = (id) => api.delete(`/api/customers/${id}`);

// =======================
// 💰 BILLING & SESSION
// =======================

export const topupBilling = (d) => api.post("/api/billing/topup", d);
export const startSession = (d) => api.post("/api/sessions/start", d);
export const stopSession = (d) => api.post("/api/sessions/stop", d);

export const createOrder = (d) => api.post("/api/orders", d);
export const updateOrderStatus = (id, d) =>
  api.put(`/api/orders/${id}/status`, d);

// =======================
// 📜 ORDER MILIK USER
// =======================

export const fetchMyOrders = async () => {
  try {
    const res = await api.get("/api/orders");
    const all = res.data.data || [];

    const userStr = localStorage.getItem("aradabiya_user");
    if (!userStr) return [];
    const user = JSON.parse(userStr);

    return all.filter((o) => o.user_id === user.id);
  } catch {
    return [];
  }
};

export { api };