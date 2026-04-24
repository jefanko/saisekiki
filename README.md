# YT再生機器 (YT Playback Machine) 📺

**YT再生機器** adalah sebuah YouTube client modern yang dirancang untuk memberikan pengalaman menonton yang bersih, premium, dan bebas iklan. Proyek ini menggabungkan kekuatan **React 18** dengan backend **Serverless Functions** untuk menghadirkan platform video yang independen dan berkinerja tinggi.

---

## 🌟 Fitur Utama

- **Zero Ads Experience**: Blokir iklan secara total melalui ekstraksi stream mentah (raw stream) langsung dari server YouTube.
- **Premium Dark UI**: Antarmuka berbasis *Glassmorphism* yang elegan, menggunakan Materialize CSS yang telah dimodifikasi.
- **Background Playback**: Dukungan penuh untuk memutar audio di latar belakang (layar mati/aplikasi diminimalkan) melalui Media Session API.
- **PWA (Progressive Web App)**: Bisa diinstal di Android, iOS (Safari), dan Desktop dengan ikon khusus dan performa layaknya aplikasi native.
- **Fitur Lengkap**:
  - **Trending & Search**: Menjelajahi video populer dan mencari video apa pun.
  - **Channel Profiles**: Melihat profil lengkap kreator beserta koleksi video mereka.
  - **Smart Suggestions**: Prediksi pencarian real-time saat mengetik.
  - **Comments Section**: Membaca diskusi komunitas di setiap video.
  - **Watch History**: Riwayat tontonan tersimpan otomatis di perangkat lokal.

---

## 🛠 Tech Stack & Arsitektur

### Frontend
- **Framework**: [React 18](https://reactjs.org/) dengan **TypeScript**.
- **Build Tool**: [Vite](https://vitejs.dev/) untuk pengembangan yang super cepat.
- **Styling**: Vanilla CSS + [Materialize CSS](https://materializecss.com/) (Custom Dark Mode).
- **Icons**: Material Icons (Google Fonts).

### Backend (Serverless)
- **Runtime**: Node.js (Vercel Serverless Functions).
- **Library Inti**: [`youtubei.js`](https://github.com/LuanRT/YouTube.js) - Digunakan untuk melakukan *scraping* dan ekstraksi data YouTube secara legal dan efisien tanpa API Key resmi.

### Alur Kerja (Flow) Aplikasi
1. **Request Data**: Frontend mengirim permintaan ke `/api/yt?action=...` (misal: trending atau search).
2. **Backend Processing**: Fungsi Serverless di `/api/yt.ts` menerima permintaan, menginisialisasi sesi `youtubei.js`, dan mengambil data langsung dari YouTube.
3. **Stream Extraction**: Untuk pemutaran video, backend mencoba mengambil URL stream mentah (`.mp4` atau HLS).
4. **Playback Logic**: 
   - Aplikasi mencoba memutar video menggunakan tag `<video>` asli agar bisa mendukung *background play*.
   - Jika stream diblokir oleh YouTube (CORS/Signature), aplikasi secara otomatis melakukan *fallback* ke `<iframe>` YouTube yang telah dimodifikasi agar tetap bisa ditonton.
5. **Persistence**: Data pencarian dan riwayat tontonan disimpan menggunakan `localStorage` agar privasi pengguna tetap terjaga.

---

## 📂 Struktur Folder

```text
├── api/                # Vercel Serverless Functions (Backend)
│   └── yt.ts           # Logika utama ekstraksi data YouTube
├── src/
│   ├── api/            # Wrapper frontend untuk memanggil API backend
│   ├── components/     # Komponen UI (NavBar, VideoCard, Comments, dll)
│   ├── pages/          # Halaman utama (Home, Watch, Channel, NotFound)
│   ├── utils/          # Helper (History, Formatters)
│   └── types/          # Definisi tipe data TypeScript
├── public/             # Aset statis (Logo, Manifest PWA)
└── index.html          # Entry point utama
```

---

## 🚀 Cara Instalasi & Pengembangan

Jika Anda ingin berkontribusi atau menjalankan proyek ini di lingkungan lokal:

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/username/yt-playback-machine.git
   cd yt-playback-machine
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Mode Pengembangan**:
   ```bash
   npm run dev
   ```
   *Vite akan menjalankan server di `http://localhost:5173`. Request ke `/api/*` akan otomatis ditangani oleh middleware di `vite.config.ts` untuk mensimulasikan lingkungan Vercel.*

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 📖 Cara Penggunaan

1. **Mencari Video**: Gunakan bar pencarian di atas. Pilih dari saran yang muncul atau tekan Enter.
2. **Menonton**: Klik pada kartu video. Jika Anda menggunakan HP, video akan otomatis menyesuaikan layar.
3. **Background Play**: Putar video, lalu kunci HP Anda. Kontrol media akan muncul di lockscreen.
4. **Instal Aplikasi**:
   - **Chrome (Desktop/Android)**: Klik ikon "Install" di bar alamat.
   - **Safari (iOS)**: Klik tombol Share -> "Add to Home Screen".

---

## 🤝 Kontribusi

Kontribusi selalu diterima! Jika Anda menemukan bug atau memiliki ide fitur baru:
1. Fork repositori ini.
2. Buat branch fitur baru (`git checkout -b fitur-keren`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4. Push ke branch (`git push origin fitur-keren`).
5. Buat Pull Request.

---
Dibuat dengan ❤️ oleh [慎吾](https://github.com/yourusername)
