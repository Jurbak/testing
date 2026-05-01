# Kas Santri - Aplikasi Pencatatan Kas Organisasi

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran kas organisasi santri. Dibangun dengan HTML, CSS, dan JavaScript, menggunakan Supabase sebagai database dan Telegram Bot untuk menyimpan gambar bukti transaksi.

## Fitur

### Halaman Publik (Tanpa Login)
- Tabel status pembayaran kas bulanan
- Menampilkan siapa yang sudah dan belum bayar
- Warna tabel berubah setiap kali halaman dibuka

### Halaman Admin (Login Diperlukan)
- **Dashboard** - Ringkasan pemasukan, pengeluaran, sisa kas, dan daftar yang belum bayar
- **Kelola Santri** - Tambah, edit, hapus data santri
- **Pembayaran** - Input pembayaran kas dengan upload bukti gambar
- **Pengeluaran** - Input pengeluaran organisasi dengan upload bukti gambar
- **Laporan** - Laporan bulanan dengan export ke CSV
- **Pengaturan** - Setting nama organisasi dan jumlah kas per bulan

### PWA (Progressive Web App)
- Install di HP seperti aplikasi native
- Berjalan offline untuk halaman yang sudah dibuka
- Indikator status online/offline
- Notifikasi update otomatis

### Responsive Design
- Tabel berubah jadi kartu di HP
- Menu hamburger untuk navigasi mobile
- Modal tampil sebagai bottom sheet di HP
- Touch-friendly buttons

## Setup

### 1. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buka SQL Editor di dashboard Supabase
4. Copy paste isi file `sql/setup.sql` dan jalankan
5. Buat user untuk login pengurus:
   - Buka menu **Authentication** > **Users**
   - Klik **Add User** > **Create new user**
   - Isi email dan password untuk akun pengurus
   - Pastikan email confirmation dimatikan (di **Authentication** > **Providers** > **Email**, matikan **Confirm email**)
6. Dapatkan credentials:
   - Buka **Project Settings** > **API**
   - Copy **Project URL** dan **anon public** key

### 2. Setup Telegram Bot

1. Buka Telegram dan cari **@BotFather**
2. Kirim perintah `/newbot`
3. Ikuti instruksi untuk membuat bot:
   - Beri nama bot (contoh: `KasSantriBot`)
   - Beri username bot (harus diakhiri `bot`, contoh: `kas_santri_bot`)
4. Setelah berhasil, BotFather akan memberikan **Bot Token**
5. Simpan Bot Token ini
6. Buat grup Telegram untuk menyimpan gambar bukti:
   - Buat grup baru di Telegram
   - Tambahkan bot yang baru dibuat ke grup
7. Dapatkan **Chat ID** grup:
   - Buka browser dan kunjungi:
     ```
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
     ```
   - Kirim pesan test di grup
   - Refresh halaman di atas, cari `chat.id` (biasanya angka negatif untuk grup)
   - Atau gunakan bot **@RawDataBot** - tambahkan ke grup, bot akan menampilkan chat ID

### 3. Konfigurasi Aplikasi

1. Di folder `js/`, salin file `config.template.js` menjadi `config.js`:
   ```
   cp js/config.template.js js/config.js
   ```

2. Edit file `js/config.js` dan isi dengan data Anda:
   ```javascript
   const CONFIG = {
     SUPABASE_URL: 'https://xxxxx.supabase.co',
     SUPABASE_ANON_KEY: 'your_anon_key_here',
     TELEGRAM_BOT_TOKEN: 'your_bot_token_here',
     TELEGRAM_CHAT_ID: 'your_chat_id_here',
   };
   ```

### 4. Generate Icon PWA (Opsional)

1. Buka file `generate-icons.html` di browser
2. Klik tombol **Generate & Download Icons**
3. Akan download 2 file: `icon-192.png` dan `icon-512.png`
4. Pindahkan ke folder `icons/` (replace file yang sudah ada)

### 5. Deploy ke GitHub Pages

1. Buat repository baru di GitHub
2. Upload semua file ke repository
3. Buka **Settings** > **Pages**
4. Pilih branch `main` dan folder `/ (root)`
5. Klik **Save**
6. Website akan tersedia di `https://your-username.github.io/repository-name/`

### 6. Install sebagai PWA

**Di Android (Chrome):**
1. Buka website di Chrome
2. Klik menu (titik tiga) > **Install App** atau **Add to Home screen**
3. Ikuti instruksi

**Di iOS (Safari):**
1. Buka website di Safari
2. Tap tombol **Share** (kotak dengan panah)
3. Tap **Add to Home Screen**

## Struktur File

```
kas-santri/
├── index.html              # Halaman publik (status pembayaran)
├── login.html              # Halaman login pengurus
├── admin.html              # Dashboard admin
├── manifest.json           # Manifest untuk PWA
├── sw.js                   # Service Worker untuk PWA
├── generate-icons.html     # Tool untuk generate icon PNG
├── css/
│   └── style.css           # Styling dengan tema pastel & responsive
├── js/
│   ├── config.js           # Konfigurasi (buat sendiri)
│   ├── config.template.js  # Template konfigurasi
│   ├── app.js              # Fungsi-fungsi utama
│   ├── admin.js            # Logika dashboard admin
│   └── pwa.js              # PWA registration & offline detection
├── sql/
│   ├── setup.sql           # SQL untuk setup database
│   └── seeder.sql          # Data testing/sample
├── icons/
│   ├── icon.svg            # Icon SVG
│   ├── icon-192.png        # Icon 192x192
│   └── icon-512.png        # Icon 512x512
└── README.md
```

## Tema Warna

Tabel akan secara otomatis berubah warna setiap kali halaman dibuka. Tema yang tersedia:
- Sage (hijau lembut)
- Pastel Yellow (kuning lembut)
- Pastel Green (hijau pastel)
- Lavender (ungu lembut)
- Peach (oranye lembut)
- Sky (biru langit)
- Rose (merah muda)
- Mint (hijau mint)

## Keamanan

> **Penting:** Karena aplikasi ini menggunakan GitHub Pages (static site), credentials Supabase dan Telegram Bot Token akan terlihat di source code. Pastikan:
> - Hanya berikan akses admin kepada pengurus yang terpercaya
> - Gunakan Row Level Security (RLS) di Supabase untuk membatasi akses
> - Jangan gunakan password yang sama dengan akun penting lainnya

## Penggunaan

### Menambah Santri Baru
1. Login sebagai pengurus
2. Buka tab **Kelola Santri**
3. Klik **Tambah Santri**
4. Isi data santri dan simpan

### Mencatat Pembayaran Kas
1. Login sebagai pengurus
2. Buka tab **Pembayaran**
3. Klik **Input Pembayaran**
4. Pilih santri, isi bulan/tahun, upload bukti pembayaran
5. Simpan

### Mencatat Pengeluaran
1. Login sebagai pengurus
2. Buka tab **Pengeluaran**
3. Klik **Input Pengeluaran**
4. Pilih kategori, isi jumlah, upload bukti pengeluaran
5. Simpan

### Melihat Laporan
1. Login sebagai pengurus
2. Buka tab **Laporan**
3. Pilih bulan dan tahun
4. Klik **Tampilkan**
5. Export ke CSV jika diperlukan

## Troubleshooting

### Data tidak muncul di halaman publik
- Pastikan file `js/config.js` sudah dibuat dengan credentials yang benar
- Cek browser console untuk error
- Pastikan tabel sudah diisi data di Supabase

### Gambar bukti tidak terupload
- Pastikan Bot Token dan Chat ID sudah benar
- Pastikan bot sudah ditambahkan ke grup Telegram
- Cek apakah bot memiliki izin untuk mengirim pesan di grup

### Login tidak berhasil
- Pastikan email confirmation sudah dimatikan di Supabase
- Cek email dan password sudah benar
- Cek browser console untuk error detail

### PWA tidak bisa install
- Pastikan website diakses via HTTPS (GitHub Pages sudah otomatis HTTPS)
- Pastikan file `manifest.json` dan `sw.js` terupload dengan benar
- Cek browser console untuk error service worker

### Service Worker tidak update
- Buka DevTools > Application > Service Workers
- Klik **Unregister** lalu refresh halaman

## Lisensi

MIT License - Bebas digunakan untuk keperluan pribadi maupun organisasi.
