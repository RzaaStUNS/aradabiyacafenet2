### Aradabiya Cafe Net

Selamat datang di repositori **Aradabiya Cafe Net**!  
Proyek ini mengembangkan sistem manajemen **cafe net (warnet modern)** dengan fitur:

- Role-based access (Admin, Staff, Customer)
- Pemesanan PC
- Top-up saldo waktu
- Dashboard interaktif

**Tech Stack:**
- Backend: Laravel 12 (API + Blade untuk testing)
- Frontend: React 18 + Vite

Repositori ini untuk **kolaborasi tim**.  
Setiap anggota bekerja di branch pribadi, lalu membuat **Pull Request (PR)** ke branch `main` untuk review dan merge.

---

## 👥 Anggota Tim

| Nama | Tugas |
|------|-------|
| Abimanyu | Backend (API & Database) |
| Ranu | Frontend (React Dashboard) |
| Bryan | CRUD & Authentication |
| Aldifa | UI/UX |
| Suciana | Scheduler & Laporan |

---

## ⚙️ Setup Proyek di Visual Studio Code

# 1. Fork & Clone Repositori

```bash
# Fork repo ini ke akun GitHub kamu
# Clone ke komputer lokal
git clone https://github.com/RzaaStUNS/Aradabiyacafnet2.git

# Masuk ke folder proyek
cd Aradabiyacafnet
```
# 2. Buat Branch Pribadi
```bash
# Buat branch untuk kerja pribadi
git checkout -b [nama-branch-mu]

# Contoh
git checkout -b ranu-frontend
```
# 3. Setup Backend (Laravel)
```bash
# Masuk ke folder backend
cd backend

# Install dependencies Laravel
composer install

# Duplikasi file environment
cp .env.example .env

# Generate app key
php artisan key:generate
```
Edit konfigurasi database di file .env:
```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aradabiya
DB_USERNAME=root
DB_PASSWORD=
```
```bash
# Jalankan migration dan seeder (otomatis isi data awal)
php artisan migrate:fresh --seed

# Install API & Auth (Laravel Breeze)
php artisan install:api
composer require laravel/breeze --dev
php artisan breeze:install blade

# Install dependensi frontend (untuk uji Blade)
npm install && npm run dev

# Jalankan server backend
php artisan serve
```
Akses di browser:
http://127.0.0.1:8000
✅ Seeder otomatis membuat akun admin, staff, dan customer sehingga tidak perlu input manual.
# 4. Setup Frontend (React)
```bash
# Kembali ke folder utama
cd ..

# Buat folder frontend jika belum ada
mkdir frontend && cd frontend

# Buat project React baru
npm create vite@latest . -- --template react

# Install dependencies
npm install
npm install axios

# Jalankan React
npm run dev
```
Akses di browser:
http://localhost:5173
# 5. Test Alur Sistem
Login Dashboard (Blade):
| Role     | Username | Password |
| -------- | -------- | -------- |
| Admin    | admin    | password |
| Staff    | staff1   | password |
| Customer | budi123  | 123456   |

Test API via Tinker:
```bash
php artisan tinker
```
Test Scheduler (pengurangan saldo otomatis):
```bash
php artisan schedule:run
```
## 🚀 Workflow Kolaborasi Git
1. Mulai Kerja
Sync dengan main branch
```bash
git pull origin main
```
Buat branch baru untuk fitur
```bash
git checkout -b [fitur-baru]
```
2. Commit & Push
Tambahkan perubahan
```bash
git add .
```
Commit dengan pesan jelas
```
git commit -m "feat: tambah form top-up customer"
```
Push ke branch kamu
```
git push origin [nama-branch]
```
3. Pull Request (PR)

Buka GitHub repo fork kamu

Klik Compare & pull request

Isi deskripsi PR (jelaskan perubahan & tambahkan screenshot bila UI)

Assign reviewer (contoh: @RzaaStUNS)

Diskusikan di grup sebelum merge

4. Merge & Update
Setelah PR di-approve dan merge ke main
```
git checkout main
git pull origin main
```
##💡 Tips Kolaborasi
Gunakan format commit: feat:, fix:, docs:, style:
Test semua fitur sebelum PR
Gunakan nama branch: [nama]-[fitur], contoh: ranu-topup-form
Diskusikan ide di Issues GitHub atau grup WA
Push rutin agar progress aman

## ⚠️ Catatan Penting
JANGAN PUSH LANGSUNG KE MAIN! Selalu lewat Pull Request
JANGAN HAPUS BRANCH ORANG LAIN tanpa izin
Selalu PULL MAIN sebelum mulai coding
Update dependency jika menambah package (composer.json / package.json)
JANGAN COMMIT .env, gunakan .env.example
JAGA KEAMANAN, jangan commit password atau API key

## 🖥️ Jalankan di Visual Studio Code
Buka dua terminal di VS Code:

Terminal 1 – Backend
```
cd backend
php artisan serve
```
Terminal 2 – Frontend
```
cd frontend
npm run dev
```
Akses:
Backend → http://127.0.0.1:8000
Frontend → http://localhost:5173
