import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 1. INTERCEPTOR REQUEST (Kirim Token Otomatis)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 2. INTERCEPTOR RESPONSE (Kalau Token Basi, Auto Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Sesi habis atau token tidak valid. Logout otomatis.");
            localStorage.clear(); // Hapus semua data kotor
            window.location.href = '/'; // Tendang ke login
        }
        return Promise.reject(error);
    }
);

export default api;