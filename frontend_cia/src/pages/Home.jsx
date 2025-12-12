import { useNavigate } from "react-router-dom";
import { MonitorSmartphone, Shield, ShoppingBag } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* BACKGROUND GRADIENT + NOISE */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.3),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <main className="relative z-10 flex min-h-screen flex-col px-4 pb-10 pt-8 md:px-10">
        {/* HERO */}
        <section className="flex flex-1 flex-col items-center">
          <div className="w-full max-w-5xl">
            {/* top bar tipis */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="uppercase tracking-[0.25em] text-cyan-300/80">Aradabiya • Cybercafe</span>

            </div>

            {/* judul utama */}
            <div className="mt-10 flex flex-col items-center text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-400/90">Welcome To</p>
              <h1 className="mt-3 text-5xl font-extrabold tracking-[0.18em] text-slate-50 drop-shadow-xl md:text-6xl">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">ARADABIYA</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
                Masuki Dunia Digital Tanpa Batas
              </p>
            </div>

            {/* garis + teks kecil kayak “timeline” */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <span className="h-px w-10 bg-slate-500/60" />
              <span>Choose Your Portal</span>
              <span className="h-px w-10 bg-slate-500/60" />
            </div>

            {/* 3 PORTAL DALAM STRIP MELENGKUNG */}
            <div className="mt-6 flex justify-center">
              <div className="relative w-full max-w-4xl rounded-[32px] border border-slate-800/80 bg-slate-950/80 px-4 py-5 shadow-[0_0_60px_rgba(15,23,42,0.9)] backdrop-blur">
                {/* garis “timeline” */}
                <div className="pointer-events-none absolute left-6 right-6 top-1/2 hidden -translate-y-1/2 items-center justify-between md:flex">
                  <span className="h-px flex-1 bg-gradient-to-r from-fuchsia-500/40 via-cyan-400/70 to-emerald-400/50" />
                </div>

                <div className="relative grid gap-3 md:grid-cols-3">
                  {/* ADMIN */}
                  <PortalCard
                    accent="cyan"
                    title="Admin Portal"
                    description="Pantau statistik, kelola menu & staff, dan atur konfigurasi utama warnet."
                    icon={Shield}
                    onClick={() => navigate("/login/admin")}
                    highlight="Akses khusus"
                  />

                  {/* STAFF */}
                  <PortalCard
                    accent="emerald"
                    title="Kasir Portal"
                    description="Terima booking ruangan, mulai/stop sesi, dan proses pembayaran."
                    icon={MonitorSmartphone}
                    onClick={() => navigate("/login/staff")}
                    highlight="Frontline"
                  />

                  {/* CUSTOMER */}
                  <PortalCard
                    accent="fuchsia"
                    title="Pelanggan Portal"
                    description="Booking ruangan Regular/VIP, top up saldo, dan pesan makanan/minuman."
                    icon={ShoppingBag}
                    onClick={() => navigate("/login/customer")}
                    highlight="Experience"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PortalCard({ accent, title, description, icon: Icon, onClick, highlight, footer }) {
  const accentColor = accent === "cyan" ? "from-cyan-400 to-sky-400" : accent === "emerald" ? "from-emerald-400 to-lime-300" : "from-fuchsia-400 to-pink-400";

  const borderColor = accent === "cyan" ? "border-cyan-500/70" : accent === "emerald" ? "border-emerald-500/70" : "border-pink-500/70";

  const shadowColor = accent === "cyan" ? "shadow-cyan-500/40" : accent === "emerald" ? "shadow-emerald-500/40" : "shadow-pink-500/40";

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col justify-between rounded-2xl border ${borderColor} bg-slate-950/80 px-4 py-4 text-left shadow-[0_0_35px_rgba(15,23,42,0.9)] transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:${shadowColor}`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <div className={`inline-flex items-center rounded-full bg-gradient-to-r ${accentColor} px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-950`}>{highlight}</div>
          <h3 className="mt-2 text-sm font-semibold text-slate-50">{title}</h3>
          <p className="mt-1 text-[11px] text-slate-400">{description}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-2 group-hover:scale-110 group-hover:border-slate-500">
          <Icon className="h-5 w-5 text-slate-100" />
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>{footer}</span>
        <span className="text-xs font-semibold text-slate-200">Masuk →</span>
      </div>
    </button>
  );
}
