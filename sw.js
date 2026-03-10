/*
  ============================================================
  FILE     : sw.js (Service Worker)
  APLIKASI : VioKin Hydrate — Pengingat Minum Air
  FUNGSI   : Membuat aplikasi bisa berjalan OFFLINE
  ============================================================
  Cara kerja Service Worker:
  1. INSTALL  — Menyimpan semua file ke cache saat pertama dibuka
  2. ACTIVATE — Menghapus cache lama jika ada versi baru
  3. FETCH    — Saat offline, melayani file dari cache
  ============================================================
*/

// Nama & versi cache — ubah versi saat ada update aplikasi
const NAMA_CACHE   = 'viokin-hydrate-v1';

// Daftar semua file yang akan disimpan untuk offline
const FILE_CACHE   = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  // Google Fonts (opsional — butuh koneksi pertama kali)
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap'
];


/* ============================================================
   EVENT: INSTALL
   Dijalankan saat Service Worker pertama kali dipasang.
   Menyimpan semua file ke cache.
   ============================================================ */
self.addEventListener('install', event => {
  console.log('[SW] Menginstall dan menyimpan cache...');

  event.waitUntil(
    caches.open(NAMA_CACHE)
      .then(cache => {
        console.log('[SW] File berhasil disimpan ke cache');
        // Simpan semua file, abaikan jika ada yang gagal
        return cache.addAll(FILE_CACHE).catch(err => {
          console.log('[SW] Beberapa file gagal di-cache:', err);
        });
      })
  );

  // Langsung aktifkan tanpa menunggu tab lama ditutup
  self.skipWaiting();
});


/* ============================================================
   EVENT: ACTIVATE
   Dijalankan saat versi baru Service Worker aktif.
   Menghapus cache lama agar tidak menumpuk.
   ============================================================ */
self.addEventListener('activate', event => {
  console.log('[SW] Mengaktifkan versi baru...');

  event.waitUntil(
    caches.keys().then(namaCache => {
      return Promise.all(
        namaCache
          .filter(nama => nama !== NAMA_CACHE) // Cari cache LAMA
          .map(nama => {
            console.log('[SW] Menghapus cache lama:', nama);
            return caches.delete(nama);        // Hapus cache lama
          })
      );
    })
  );

  // Ambil kendali semua tab yang terbuka segera
  self.clients.claim();
});


/* ============================================================
   EVENT: FETCH
   Dijalankan setiap kali aplikasi meminta file/data.
   Strategi: Cache First — cek cache dulu, baru internet.
   ============================================================ */
self.addEventListener('fetch', event => {
  // Abaikan permintaan non-HTTP (chrome-extension, dll)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(responseDariCache => {

        // Jika file ada di cache → gunakan cache (bisa offline)
        if (responseDariCache) {
          return responseDariCache;
        }

        // Jika tidak ada di cache → ambil dari internet
        return fetch(event.request)
          .then(responseDariInternet => {
            // Simpan salinan ke cache untuk offline berikutnya
            if (responseDariInternet && responseDariInternet.status === 200) {
              const salinan = responseDariInternet.clone();
              caches.open(NAMA_CACHE).then(cache => {
                cache.put(event.request, salinan);
              });
            }
            return responseDariInternet;
          })
          .catch(() => {
            // Jika benar-benar offline & tidak ada cache → tampilkan fallback
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
