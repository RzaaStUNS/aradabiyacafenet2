# ☕ Aradabiya Cafe Net
Selamat datang di repositori Aradabiya Cafe Net! Ini adalah proyek pengembangan sistem manajemen cafe net (warnet modern) dengan fitur role-based access (admin, staff, customer), pemesanan PC, top-up saldo waktu, dan dashboard interaktif. Backend dibangun dengan Laravel 12 (API + Blade untuk test), frontend dengan React 18 + Vite.
Repositori ini dirancang untuk kolaborasi tim. Setiap anggota bekerja di branch pribadi, kemudian submit Pull Request (PR) ke branch main untuk review dan merge.

# 👥 Anggota Tim

Abimanyu - Backend (API & database)
Ranu - Frontend (React dashboard)
Bryan - CRUD & authentication
Aldifa - UI/UX 
Suciana - Scheduler & laporan

# 🔧 Cara Clone, Setup, dan Jalankan Proyek
1. Fork & Clone Repositori

Fork repositori ini ke akun GitHub masing-masing: https://github.com/RzaaStUNS/Aradabiyacafnet
Clone fork kamu ke lokal:textgit clone https://github.com/[username-kamu]/Aradabiyacafnet.git
Masuk ke folder proyek:textcd Aradabiyacafnet

2. Buat Branch Pribadi
Selalu kerja di branch sendiri untuk menghindari konflik:
textgit checkout -b [nama-kamu-branch]
Contoh:
textgit checkout -b ranu-frontend
3. Setup Backend (Laravel)

Masuk ke folder backend:textcd backend
Install dependencies:textcomposer install
Copy .env.example ke .env:textcp .env.example .env
Generate app key:textphp artisan key:generate
Setup database (MySQL/SQLite):
Buat database aradabiya di phpMyAdmin.
Edit .env:textDB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aradabiya
DB_USERNAME=root
DB_PASSWORD=
Jalankan migration & seeder:textphp artisan migrate:fresh --seed

Install Sanctum untuk API:textphp artisan install:api
Install Breeze untuk auth test (Blade):textcomposer require laravel/breeze --dev
php artisan breeze:install blade
npm install && npm run dev
Jalankan server:textphp artisan serveAkses: http://127.0.0.1:8000

4. Setup Frontend (React)

Masuk ke folder frontend (jika belum ada, buat dulu):textcd ..
mkdir frontend && cd frontend
npm create vite@latest . -- --template react
Install dependencies:textnpm install
npm install axios  # Untuk API calls
Jalankan dev server:textnpm run devAkses: http://localhost:5173

5. Test Alur Sistem

Login Test (Blade Dashboard):RoleUsernamePasswordAdminadminpasswordStaffstaff1passwordCustomerbudi123123456
API Test: Gunakan Tinker (php artisan tinker) atau Postman untuk endpoint /api/*.
Scheduler: Jalankan php artisan schedule:run untuk test kurangi saldo.

# 🚀 Workflow Kolaborasi Git
1. Mulai Kerja

Selalu sync branch main terlebih dahulu:textgit pull origin main
Buat branch baru jika belum:textgit checkout -b [fitur-baru]

2. Commit & Push

Add perubahan:textgit add .
Commit dengan pesan jelas:textgit commit -m "feat: tambah form top-up customer"
Push ke branch kamu:textgit push origin [nama-branch]

3. Pull Request (PR)

Buka GitHub repo fork kamu.
Klik Compare & pull request.
Deskripsikan PR: Apa yang ditambah/ubah? Screenshot jika UI.
Assign reviewer (misal @RzaaStUNS).
Diskusikan di grup sebelum merge.

4. Merge & Update

Setelah PR di-approve: Merge ke main.
Update lokal:textgit checkout main
git pull origin main


# 💡 Tips Kolaborasi

Pesan Commit: Gunakan konvensi (feat:, fix:, docs:, style:).
Konflik: Jika ada, resolve manual lalu commit ulang.
Testing: Selalu test fitur baru di lokal sebelum PR.
Branch Naming: [nama-kamu]-[fitur], contoh: ranu-topup-form.
Diskusi: Gunakan Issues atau grup WA untuk ide baru.
Backup: Push sering-sering, jangan simpan kode di lokal saja.

# ⚠️ Catatan Penting

JANGAN PUSH LANGSUNG KE MAIN! Selalu via PR.
JANGAN HAPUS BRANCH ORANG LAIN tanpa izin.
SEBELUM CODING: Selalu git pull origin main untuk sync.
DEPENDENSI: Jika tambah package, update composer.json/package.json dan PR.
Environment: Jangan commit .env — gunakan .env.example.
Security: Jangan commit password atau API key.
