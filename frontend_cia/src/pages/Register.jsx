import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Mail, User, UserPlus, CreditCard, Loader2, Key } from "lucide-react";
import { register, login } from "../lib/api"; // Import fungsi API

export default function Register() {
  const navigate = useNavigate();
  const { role } = useParams(); // staff | customer

  // State Form
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // Wajib ada sesuai Postman
  const [ktp, setKtp] = useState("");         // Wajib ada sesuai Postman
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
 

  
  // State UI
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const effectiveRole = role === "staff" || role === "customer" ? role : null;
  const roleLabel = effectiveRole === "staff" ? "Kasir" : effectiveRole === "customer" ? "Pelanggan" : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (!effectiveRole) {
      setErrorMsg("Role tidak valid.");
      setIsLoading(false);
      return;
    }

    // Validasi input
    if (!name || !username || !ktp || !email || !password || !confirm) {
      setErrorMsg("Semua field wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Konfirmasi password tidak sama.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. PROSES REGISTRASI KE BACKEND
      // Payload disesuaikan dengan Postman kamu (name, username, ktp_number, email, password)
      await register({
        name: name,
        username: username,
        ktp_number: ktp,
        email: email,
        password: password,
        role: effectiveRole // Opsional, tergantung backend baca ini atau tidak
      });

      // 2. AUTO LOGIN SETELAH SUKSES DAFTAR
      // Karena endpoint register biasanya tidak mengembalikan token (hanya data user),
      // kita panggil fungsi login otomatis menggunakan username & password yang barusan diketik.
      const { user } = await login({ username, password });

      // 3. REDIRECT
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "staff") navigate("/staff");
      else if (user.role === "customer") navigate("/customer");
      else navigate("/");

    } catch (err) {
      console.error(err);
      // Menampilkan pesan error dari backend (misal: "Username sudah dipakai")
      setErrorMsg(err.message || "Gagal mendaftar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackHome = () => navigate("/");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      {/* BACKGROUND DEKORASI */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.3),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_0_60px_rgba(15,23,42,0.9)] backdrop-blur">
        <button onClick={handleBackHome} className="mb-4 text-[11px] text-slate-400 hover:text-slate-100">
          ⬅ Kembali ke Beranda
        </button>

        <div className="mb-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Aradabiya System</p>
          <h1 className="mt-3 text-xl font-semibold text-slate-50">Registrasi {roleLabel}</h1>
          <p className="mt-1 text-xs text-slate-400">Isi data lengkap sesuai KTP untuk mendaftar.</p>
        </div>

        {!effectiveRole && (
          <div className="mb-3 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
            Role URL salah. Kembali ke beranda.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          {/* NAMA LENGKAP */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Nama Lengkap</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
              <User className="h-4 w-4 text-slate-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="Nama sesuai KTP" disabled={isLoading}/>
            </div>
          </div>

          {/* USERNAME & KTP (GRID) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Username</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                <Key className="h-4 w-4 text-slate-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="User unik" disabled={isLoading}/>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">No. KTP</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <input type="text" value={ktp} onChange={(e) => setKtp(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="NIK KTP" disabled={isLoading}/>
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="email@anda.com" disabled={isLoading}/>
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="Minimal 6 karakter" disabled={isLoading}/>
            </div>
          </div>

          {/* KONFIRMASI PASSWORD */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Konfirmasi Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="Ulangi password" disabled={isLoading}/>
            </div>
          </div>

          {errorMsg && <p className="text-center text-[11px] text-red-400">{errorMsg}</p>}

          <button
            type="submit"
            disabled={!effectiveRole || isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mendaftarkan...</span>
                </>
            ) : (
                <>
                    <UserPlus className="h-4 w-4" />
                    <span>Daftar & Masuk</span>
                </>
            )}
          </button>
        </form>

        {effectiveRole && (
          <p className="mt-4 text-center text-[11px] text-slate-400">
            Sudah punya akun?{" "}
            <Link to={`/login/${effectiveRole}`} className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
              Kembali ke login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
} 