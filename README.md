# 🎓 Portal Semakan ID & Kata Laluan DELIMa 3.0 Murid (PWA)
### SK Ranggu, Tawau, Sabah (Kod Sekolah: XBA3037)

Aplikasi **Progressive Web App (PWA)** moden, ringan dan pantas untuk memudahkan ibu bapa menyemak **ID DELIMa** (`@moe-dl.edu.my`) dan **Kata Laluan** anak-anak mereka bagi log masuk ke **Portal DELIMa 3.0 Kementerian Pendidikan Malaysia (KPM)**: [https://d3.delima.edu.my/applications](https://d3.delima.edu.my/applications).

---

## 🌟 Ciri-Ciri Utama Aplikasi

- 🪪 **Carian Pantas No. Kad Pengenalan / MyKid**: Ibu bapa hanya perlu memasukkan nombor KP (dengan atau tanpa tanda sempang) untuk mendapatkan maklumat anak secara serta-merta.
- 🏫 **Carian Mengikut Kelas & Nama**: Pilihan carian mengikut Tahun 1 hingga Tahun 6 (Kelas: *ILTIZAM, JAYYID, KHOIR, MUMTAZ*) dan penapis nama secara *live*.
- 📋 **Satu Klik Salin (1-Click Copy)**: Butang salin pantas untuk ID DELIMa dan Kata Laluan dengan animasi maklum balas (*toast notification*).
- 👁️ **Papar / Sembunyi Kata Laluan**: Memudahkan ibu bapa menyemak kata laluan sebelum memasukkannya ke portal DELIMa.
- 🚀 **Pautan Terus ke DELIMa 3.0**: Butang pantas untuk terus membuka portal aplikasi DELIMa KPM.
- 📱 **Kongsi ke WhatsApp**: Menjana mesej kemas maklumat akaun murid secara automatik untuk dihantar kepada pasangan, anak, atau disimpan sendiri.
- ⚡ **100% Berfungsi Luar Talian (Offline)**: Dilengkapi *Service Worker* dan *Cache Storage*, aplikasi boleh dibuka walaupun tiada sambungan internet selepas dibuka kali pertama.
- 📲 **Boleh Dipasang Sebagai Aplikasi Telefon (PWA)**: Boleh ditambah ke skrin utama (*Add to Home Screen*) pada Android dan iOS (iPhone/iPad) tanpa memerlukan muat turun dari Play Store / App Store.
- 🌙 **Mod Cerah & Gelap (Dark Mode)**: Selesa dipandang pada waktu malam atau siang mengikut keutamaan peranti.

---

## 📁 Struktur Fail Projek

```text
delima-pwa/
├── index.html           # Halaman utama aplikasi web
├── style.css            # Penggayaan CSS responsif moden (Mobile & Desktop)
├── app.js               # Enjin carian, penyalinan & logik PWA
├── data.js              # Pangkalan data murid berstruktur (766 murid)
├── students.json        # Data murid dalam format JSON
├── manifest.json        # Konfigurasi PWA (Web App Manifest)
├── sw.js                # Service Worker untuk mod luar talian (offline cache)
├── icons/               # Ikon aplikasi pelbagai saiz (192x192, 512x512, SVG)
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   ├── icon-maskable-512.png
│   ├── apple-touch-icon.png
│   └── favicon-32.png
├── tools/
│   └── update_data.py   # Skrip untuk kemas kini data murid dari fail CSV baru
├── .gitignore
└── README.md            # Dokumentasi lengkap
```

---

## 🚀 Panduan Memuat Naik ke GitHub & Deploy GitHub Pages (Percuma)

Aplikasi ini boleh dihoskan secara **100% percuma** menggunakan **GitHub Pages** dengan pautan rasmi `https://<nama-username>.github.io/<nama-repo>/`.

### Langkah 1: Cipta Repositori Baharu di GitHub
1. Log masuk ke akaun [GitHub](https://github.com/).
2. Tekan butang **New** (atau ikon **+** di sudut kanan atas -> **New repository**).
3. Masukkan nama repositori, contohnya: `delima-sk-ranggu` atau `delima-id-pwa`.
4. Pilih **Public**.
5. Jangan tandakan *Add a README file* (kerana kita sudah mempunyai fail tempatan).
6. Tekan **Create repository**.

### Langkah 2: Tolak (*Push*) Kod Tempatan ke GitHub
Buka terminal dan jalankan arahan berikut (gantikan `<USERNAME>` dan `<NAMA-REPO>` dengan nama akaun anda):

```bash
# Masuk ke direktori projek
cd /Users/momon/.gemini/antigravity/scratch/delima-pwa

# Tetapkan remote repository GitHub anda
git remote add origin https://github.com/<USERNAME>/<NAMA-REPO>.git

# Tolak kod ke branch main
git branch -M main
git push -u origin main
```

*(Jika anda menggunakan GitHub Desktop atau muat naik melalui laman web GitHub, anda juga boleh muat naik semua fail di dalam folder ini terus ke repositori).*

---

### Langkah 3: Aktifkan GitHub Pages (Hosting Percuma)
1. Buka repositori GitHub anda di pelayar web.
2. Pergi ke tab **Settings** (di sebelah kanan atas tab *Insights*).
3. Pada menu sebelah kiri, tekan **Pages** (di bawah bahagian *Code and automation*).
4. Di bawah **Build and deployment**:
   - **Source**: Pilih `Deploy from a branch`.
   - **Branch**: Pilih `main` dan folder `/(root)`.
   - Tekan butang **Save**.
5. Tunggu kira-kira 1 hingga 2 minit. GitHub akan memaparkan pautan laman web anda, contohnya:
   ```text
   Your site is live at https://<USERNAME>.github.io/<NAMA-REPO>/
   ```

Pautan inilah yang boleh dikongsikan kepada ibu bapa dan guru melalui kumpulan WhatsApp atau Telegram sekolah!

---

## 📲 Cara Ibu Bapa Memasang Aplikasi (Add to Home Screen)

### Pada Telefon Android (Google Chrome)
1. Buka pautan laman web di pelayar Chrome.
2. Banner **"Pasang Aplikasi ke Telefon Anda"** akan muncul secara automatik. Tekan butang **"Pasang Sekarang"**.
3. Sekiranya tidak muncul, tekan ikon **Tiga Titik (⋮)** di sudut kanan atas Chrome dan pilih **"Install app"** atau **"Add to Home screen"**.
4. Ikon aplikasi **DELIMa ID** akan muncul di skrin utama telefon anda.

### Pada iPhone / iPad (Safari)
1. Buka pautan laman web di pelayar Safari.
2. Tekan butang **Kongsi (Share)** di bahagian bawah skrin (ikon kotak dengan anak panah ke atas: `⎋`).
3. Skrol ke bawah dan tekan **"Add to Home Screen" (Tambah ke Skrin Utama)** `➕`.
4. Tekan **"Add" (Tambah)** di sudut kanan atas.

---

## 🔄 Cara Kemas Kini Senarai Murid pada Masa Hadapan

Jika terdapat murid baharu berpindah masuk atau pertukaran kelas pada masa akan datang:
1. Sediakan fail CSV baharu dengan lajur:
   `KELAS, NAMA, ID DELIMA, ID MURID, NO. KAD PENGENALAN, PASSWORD`
2. Jalankan skrip kemas kini:
   ```bash
   python3 tools/update_data.py nama_fail_baru.csv
   ```
3. Lakukan *commit* dan *push* ke GitHub:
   ```bash
   git add data.js students.json
   git commit -m "Kemas kini senarai murid baharu"
   git push origin main
   ```
   Laman web GitHub Pages anda akan dikemas kini secara automatik dalam masa seminit!

---

## 🛡️ Hak Cipta & Maklumat Pembangun
- **Pembangun Sistem**: **Mohammad Fikrey bin Abdul Gapar** ([@momon-ux](https://github.com/momon-ux)).
- **Aplikasi**: Sistem PWA Semakan ID & Kata Laluan Murid DELIMa 3.0 (SK Ranggu, Tawau).
- **Pautan Rasmi DELIMa 3.0 KPM**: [https://d3.delima.edu.my/applications](https://d3.delima.edu.my/applications)
