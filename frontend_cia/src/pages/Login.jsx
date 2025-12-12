import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Mail, User, LogIn, Loader2 } from "lucide-react";
import { login } from "../lib/api"; // Import fungsi login dari helper API

export default function Login() {
  const navigate = useNavigate();
  const { role } = useParams(); // "admin" | "staff" | "customer"

  const [identifier, setIdentifier] = useState(""); // Bisa username atau email
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State untuk loading

  // Validasi role dari URL hanya untuk tampilan UI (Label)
  const effectiveRole = ["admin", "staff", "customer"].includes(role) ? role : null;
  
  const roleLabel = 
    effectiveRole === "admin" ? "Login Admin" : 
    effectiveRole === "staff" ? "Login Kasir" : 
    effectiveRole === "customer" ? "Login Pelanggan" : "Login";

  const isAdmin = effectiveRole === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    // Validasi input kosong
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg("Semua field wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Panggil API Login (Real Backend)
      // Kita kirim 'username' ke api.js, tapi isinya bisa email/username tergantung backend handle-nya
      const { user } = await login({ 
        username: identifier, 
        password: password 
      });

      // 2. Cek Role User dari respon server vs Halaman Login saat ini
      // Opsional: Jika kamu ingin strict (misal user staff gak boleh login di halaman admin)
      // uncomment logika di bawah ini. Tapi biasanya sistem auto redirect saja.
      
      /* if (effectiveRole && user.role !== effectiveRole) {
        throw new Error(`Akun ini bukan ${effectiveRole}. Silakan login di portal yang benar.`);
      }
      */

      // 3. Redirect berdasarkan Role dari Database (bukan dari URL)
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "staff") {
        navigate("/staff");
      } else if (user.role === "customer") {
        navigate("/customer");
      } else {
        // Fallback jika role tidak dikenali
        navigate("/");
      }

    } catch (err) {
      // Menangkap error dari lib/api.js (misal: "Unauthorized" atau "Connection refused")
      setErrorMsg(err.message || "Gagal login. Periksa koneksi atau kredensial.");
      
      // Jika error, hapus token sisa (opsional, api.js biasanya tidak simpan token jika error)
      localStorage.removeItem("aradabiya_token");
      localStorage.removeItem("aradabiya_user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackHome = () => navigate("/");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.3),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.9)] backdrop-blur">
        <button onClick={handleBackHome} className="mb-4 text-[11px] text-slate-400 hover:text-slate-100">
          ⬅ Kembali ke Beranda
        </button>

        <div className="mb-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Aradabiya System</p>
          <h1 className="mt-3 text-xl font-semibold text-slate-50">{roleLabel}</h1>
          <p className="mt-1 text-xs text-slate-400">
            {isAdmin 
              ? "Masukkan kredensial Administrator." 
              : "Masuk dengan email & password terdaftar."}
          </p>
        </div>

        {!effectiveRole && (
          <div className="mb-3 rounded-lg border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
            Role URL tidak dikenali. Login akan diarahkan otomatis sesuai akun.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* IDENTIFIER (Email/Username) */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">
              {isAdmin ? "Username" : "Email / Username"}
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all">
              {isAdmin ? <User className="h-4 w-4 text-slate-400" /> : <Mail className="h-4 w-4 text-slate-400" />}
              <input
                type={isAdmin ? "text" : "text"} // Ubah ke text agar fleksibel (bisa email atau username)
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600"
                placeholder={isAdmin ? "admin" : "contoh: user@aradabiya.com"}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded border border-red-500/20 bg-red-500/10 p-2 text-center text-[10px] text-red-300">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2.5 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        {/* LINK REGISTER (Hanya untuk Staff & Customer) */}
        {!isAdmin && effectiveRole && (
          <p className="mt-4 text-center text-[11px] text-slate-400">
            Belum punya akun?{" "}
            <Link to={`/register/${effectiveRole}`} className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
              Daftar sekarang
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}