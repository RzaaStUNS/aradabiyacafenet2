import { useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Mail, User, UserPlus, CreditCard, Loader2, Key, CheckCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha"; // Import Library Google
import { register, login, api } from "../lib/api"; // Import fungsi API & axios instance

export default function Register() {
  const navigate = useNavigate();
  const { role } = useParams(); // staff | customer
  const recaptchaRef = useRef(null);

  // --- STATE LOGIKA STEP ---
  const [step, setStep] = useState(1); // 1 = Register, 2 = Verifikasi OTP
  const [registeredEmail, setRegisteredEmail] = useState("");

  // --- STATE FORM REGISTER ---
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [ktp, setKtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  // --- STATE OTP ---
  const [otpCode, setOtpCode] = useState("");

  // --- STATE KEAMANAN ---
  const [captchaToken, setCaptchaToken] = useState(null); 

  // --- STATE UI ---
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const effectiveRole = role === "staff" || role === "customer" ? role : null;
  const roleLabel = effectiveRole === "staff" ? "Kasir" : effectiveRole === "customer" ? "Pelanggan" : "";

  // --- FUNGSI VERIFIKASI OTP ---
  const verifyOtpApi = async (data) => {
      try {
          const res = await api.post("/api/verify-otp", data);
          if (res.data.status) {
              // Simpan token login (Sama seperti fungsi login biasa)
              localStorage.setItem("aradabiya_token", res.data.data.token);
              localStorage.setItem("aradabiya_user", JSON.stringify(res.data.data.user));
          }
          return res.data;
      } catch (err) {
          throw new Error(err.response?.data?.message || "Verifikasi Gagal");
      }
  };

  // --- HANDLER CAPTCHA ---
  const onCaptchaChange = (token) => {
      setCaptchaToken(token); 
  };

  // --- HANDLER REGISTER (STEP 1) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (!effectiveRole) { setErrorMsg("Role tidak valid."); setIsLoading(false); return; }
    if (!name || !username || !ktp || !email || !password || !confirm) { setErrorMsg("Semua field wajib diisi."); setIsLoading(false); return; }
    if (password !== confirm) { setErrorMsg("Konfirmasi password tidak sama."); setIsLoading(false); return; }
    if (!captchaToken) { setErrorMsg("Silakan centang 'Saya bukan robot'."); setIsLoading(false); return; }

    try {
      // 1. Register Data ke Backend
      await register({
        name, username, ktp_number: ktp, email, password,
        password_confirmation: confirm, role: effectiveRole,
        captcha_token: captchaToken // Token penting buat backend
      });

      // 2. SUKSES -> PINDAH KE STEP 2 (OTP)
      setRegisteredEmail(email);
      setStep(2);
      setIsLoading(false);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Gagal mendaftar.");
      if(recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
      setIsLoading(false);
    }
  };

  // --- HANDLER VERIFIKASI OTP (STEP 2) ---
  const handleVerifyOtp = async (e) => {
      e.preventDefault();
      setErrorMsg("");
      setIsLoading(true);

      try {
          // Panggil API Verify OTP
          const res = await verifyOtpApi({
              email: registeredEmail,
              otp: otpCode
          });

          // 3. SUKSES -> REDIRECT KE DASHBOARD
          const userRole = res.data.user.role;
          if (userRole === "admin") navigate("/admin");
          else if (userRole === "staff") navigate("/staff");
          else if (userRole === "customer") navigate("/customer");
          else navigate("/");

      } catch (err) {
          setErrorMsg(err.message || "Kode OTP Salah");
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
        
        {step === 1 ? (
            // ================= STEP 1: FORM REGISTER =================
            <>
                <button onClick={handleBackHome} className="mb-4 text-[11px] text-slate-400 hover:text-slate-100">⬅ Kembali ke Beranda</button>
                <div className="mb-4 text-center">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Aradabiya System</p>
                    <h1 className="mt-3 text-xl font-semibold text-slate-50">Registrasi {roleLabel}</h1>
                    <p className="mt-1 text-xs text-slate-400">Isi data lengkap sesuai KTP untuk mendaftar.</p>
                </div>

                {!effectiveRole && (
                    <div className="mb-3 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">Role URL salah.</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    {/* INPUT FIELDS (Sama seperti kode lama) */}
                    <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Nama Lengkap</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="Nama sesuai KTP" disabled={isLoading}/>
                        </div>
                    </div>
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
                                <input type="number" value={ktp} onChange={(e) => setKtp(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="NIK KTP" disabled={isLoading}/>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Email</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="email@anda.com" disabled={isLoading}/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Password</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                            <Lock className="h-4 w-4 text-slate-400" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="Min 8 karakter" disabled={isLoading}/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Konfirmasi Password</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                            <Lock className="h-4 w-4 text-slate-400" />
                            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="Ulangi password" disabled={isLoading}/>
                        </div>
                    </div>

                    {/* CAPTCHA WIDGET */}
                    <div className="flex justify-center my-2">
                        <ReCAPTCHA ref={recaptchaRef} sitekey="6LdCeBIsAAAAAPxGuV0tuH6Y2kOTmgSY1NGGRYQa" onChange={onCaptchaChange} theme="dark" size="normal" />
                    </div>

                    {errorMsg && <p className="text-center text-[11px] text-red-400 bg-red-900/20 p-2 rounded">{errorMsg}</p>}

                    <button type="submit" disabled={!effectiveRole || isLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 transition-all shadow-lg hover:shadow-emerald-500/20">
                        {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Memproses...</span></> : <><UserPlus className="h-4 w-4" /><span>Daftar & Kirim OTP</span></>}
                    </button>
                </form>

                {effectiveRole && (
                    <p className="mt-4 text-center text-[11px] text-slate-400">Sudah punya akun? <Link to={`/login/${effectiveRole}`} className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">Kembali ke login</Link></p>
                )}
            </>
        ) : (
            // ================= STEP 2: FORM VERIFIKASI OTP =================
            <div className="text-center">
                <div className="mb-6 flex justify-center"><div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30"><CheckCircle className="h-10 w-10 text-emerald-400"/></div></div>
                <h2 className="text-xl font-bold text-white mb-2">Verifikasi OTP</h2>
                <p className="text-xs text-slate-400 mb-6 px-4">Kode OTP telah dikirim ke email <strong>{registeredEmail}</strong>. Silakan cek inbox/spam Anda.</p>
                
                <form onSubmit={handleVerifyOtp} className="space-y-4 px-4">
                    <input 
                        type="number" 
                        value={otpCode} 
                        onChange={(e)=>setOtpCode(e.target.value)} 
                        className="w-full text-center text-2xl font-mono tracking-widest bg-slate-900 border border-slate-700 rounded-xl py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700" 
                        placeholder="000000"
                        autoFocus
                        required
                    />
                    
                    {errorMsg && <p className="text-center text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">{errorMsg}</p>}
                    
                    <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 px-3 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin h-4 w-4"/> : null}
                        {isLoading ? "Memverifikasi..." : "Verifikasi & Masuk"}
                    </button>
                </form>
                
                <button onClick={()=>setStep(1)} className="mt-6 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">Salah email? Kembali ke form registrasi</button>
            </div>
        )}
      </div>
    </div>
  );
}