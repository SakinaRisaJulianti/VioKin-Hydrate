# 💧 VioKin Hydrate

Aplikasi pengingat minum air harian berbasis **Progressive Web App (PWA)** — bisa diinstall di HP dan PC secara gratis tanpa Play Store.

---

## 📁 Struktur File

```
viokin-hydrate/
├── index.html      — Struktur halaman (HTML)
├── style.css       — Tampilan & animasi (CSS)
├── app.js          — Logika aplikasi (JavaScript)
├── manifest.json   — Konfigurasi PWA (installasi)
├── sw.js           — Service Worker (mode offline)
├── icon-192.png    — Ikon aplikasi 192×192px
└── icon-512.png    — Ikon aplikasi 512×512px
```

---

## ✨ Fitur

- 💧 **Lingkaran progress** dengan animasi air naik
- ➕ **Tambah cepat** — 150ml, 250ml, 330ml, 500ml
- 🔔 **Pengingat otomatis** via notifikasi browser (30 mnt – 2 jam)
- 📊 **Riwayat 7 hari** dengan bar progress
- 🎯 **Target harian** bisa diubah (1000–4000 ml)
- 🏆 **Banner selamat** saat target tercapai
- 📱 **Bisa diinstall** di HP & PC
- 🌐 **Bisa dipakai offline** (setelah sekali dibuka)

---

## 🚀 Cara Deploy (Gratis)

### Opsi 1 — GitHub Pages
```bash
git init
git add .
git commit -m "first commit: VioKin Hydrate"
git remote add origin https://github.com/USERNAME/viokin-hydrate.git
git push -u origin main
```
Lalu aktifkan di: **Settings → Pages → Branch: main → Save**

URL akan jadi: `https://USERNAME.github.io/viokin-hydrate`

### Opsi 2 — Netlify (Drag & Drop)
1. Buka netlify.com → daftar gratis
2. Klik **"Add new site" → "Deploy manually"**
3. Drag & drop seluruh folder
4. Selesai! Dapat link langsung

---

## 📲 Cara Install di HP

**Android:**
1. Buka link di Chrome
2. Tap menu `⋮` → **"Tambahkan ke layar utama"**

**iPhone:**
1. Buka link di Safari
2. Tap ikon Share → **"Add to Home Screen"**

## 💻 Cara Install di PC (Windows/Mac)

1. Buka link di Chrome atau Edge
2. Klik ikon install di address bar (pojok kanan)
3. Klik **"Instal"**

---

## 🖼️ Menambahkan Ikon

Buat 2 file ikon PNG dan simpan di folder yang sama:
- `icon-192.png` — ukuran 192×192 pixel
- `icon-512.png` — ukuran 512×512 pixel

Tool gratis untuk membuat ikon: **favicon.io** atau **Canva**

---

## 📝 Catatan untuk Laporan

| Teknologi | Fungsi |
|-----------|--------|
| HTML5     | Struktur halaman |
| CSS3      | Tampilan, animasi, responsive design |
| JavaScript (Vanilla) | Logika aplikasi, localStorage |
| Web Manifest | Konfigurasi installasi PWA |
| Service Worker | Mode offline & caching |
| Notification API | Pengingat otomatis |
| localStorage API | Penyimpanan data lokal |
