/*
  ============================================================
  FILE     : app.js
  APLIKASI : VioKin Hydrate — Pengingat Minum Air
  BERISI   : Semua logika aplikasi
  ============================================================
  DAFTAR ISI:
    1.  State (Data Aplikasi)
    2.  Penyimpanan (localStorage)
    3.  Tambah & Hapus Air
    4.  Pembaruan Tampilan UI
    5.  Render Log Hari Ini
    6.  Render Halaman Riwayat
    7.  Navigasi Tab
    8.  Sistem Pengingat (Notifikasi)
    9.  Pengaturan Target
   10.  Toast (Pesan Singkat)
   11.  Efek Percikan SVG
   12.  Gelembung Animasi
   13.  Tanggal & Jam
   14.  Inisialisasi Aplikasi
  ============================================================
*/


/* ============================================================
   1. STATE — DATA APLIKASI
   Semua data yang dibutuhkan aplikasi disimpan di sini.
   ============================================================ */
let data = {
  hariIni    : ambilKunciHari(), // Format: "2024-01-15"
  target     : 2000,             // Target minum harian dalam ml
  pengingatOn: false,            // Status pengingat (aktif/tidak)
  interval   : 60,              // Jeda antar pengingat (menit)
  log        : {}                // Riwayat: { "2024-01-15": [{id, jumlah, waktu}] }
};

// Menyimpan referensi setInterval agar bisa dihentikan
let timerPengingat = null;


/* ============================================================
   2. PENYIMPANAN DATA (localStorage)
   Data tersimpan di browser — tidak hilang saat refresh.
   ============================================================ */

// Simpan semua data ke localStorage
function simpan() {
  localStorage.setItem('viokin_hydrate', JSON.stringify(data));
}

// Muat data dari localStorage saat aplikasi dibuka
function muat() {
  const tersimpan = localStorage.getItem('viokin_hydrate');
  if (tersimpan) {
    const d          = JSON.parse(tersimpan);
    data.target      = d.target      || 2000;
    data.pengingatOn = d.pengingatOn || false;
    data.interval    = d.interval    || 60;
    data.log         = d.log         || {};
  }
}

// Menghasilkan kunci hari ini dalam format "YYYY-MM-DD"
function ambilKunciHari() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`;
}

// Menghitung total ml yang sudah diminum hari ini
function totalHariIni() {
  const log = data.log[data.hariIni] || [];
  return log.reduce((total, item) => total + item.jumlah, 0);
}


/* ============================================================
   3. TAMBAH & HAPUS AIR
   ============================================================ */

/**
 * Menambahkan catatan minum baru.
 * @param {number} ml — jumlah air yang diminum (dalam ml)
 */
function tambahAir(ml) {
  const kunci = data.hariIni;
  if (!data.log[kunci]) data.log[kunci] = [];

  // Buat entri baru dengan ID unik dari timestamp
  const entri = {
    id    : Date.now(),
    jumlah: ml,
    waktu : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  data.log[kunci].unshift(entri); // Tambah di awal (terbaru di atas)
  simpan();

  // Batasi log maksimal 50 entri per hari
  if (data.log[kunci].length > 50) {
    data.log[kunci] = data.log[kunci].slice(0, 50);
  }

  tampilToast(`+${ml} ml berhasil ditambahkan`);
  efekPercikan();
  perbaruiUI();
}

/**
 * Menghapus satu entri dari log hari ini.
 * @param {number} id — ID entri yang akan dihapus
 */
function hapusEntri(id) {
  const kunci = data.hariIni;
  data.log[kunci] = (data.log[kunci] || []).filter(e => e.id !== id);
  simpan();
  perbaruiUI();
}


/* ============================================================
   4. PEMBARUAN TAMPILAN UI
   Dipanggil setiap kali data berubah.
   ============================================================ */
function perbaruiUI() {
  const total  = totalHariIni();
  const persen = Math.min(100, Math.round((total / data.target) * 100));
  const sisa   = Math.max(0, data.target - total);
  const gelas  = Math.round(total / 250);

  // ── Lingkaran Progress ──
  // Rumus: offset = keliling × (1 - persen/100)
  // 502 = keliling lingkaran (2 × π × 80)
  const offset = 502 - (502 * persen / 100);
  document.getElementById('progressLingkaran').style.strokeDashoffset = offset;

  // ── Isi Air dalam Lingkaran ──
  document.getElementById('ombakIsi').style.height = `${persen}%`;

  // ── Teks Jumlah & Statistik ──
  document.getElementById('jumlahSaatIni').textContent = total;
  document.getElementById('statPersen').textContent    = persen + '%';
  document.getElementById('statSisa').textContent      = sisa;
  document.getElementById('statGelas').textContent     = gelas;

  // ── Banner Selamat ──
  document.getElementById('bannerSelamat').style.display = persen >= 100 ? 'flex' : 'none';

  renderLog();
}


/* ============================================================
   5. RENDER LOG HARI INI
   ============================================================ */
function renderLog() {
  const log       = data.log[data.hariIni] || [];
  const container = document.getElementById('logHariIni');

  // Tampilkan empty state jika belum ada log
  if (log.length === 0) {
    container.innerHTML = `
      <div class="riwayat-kosong">
        <span class="ikon-kosong">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M12 2C9 7 5 11.5 5 15a7 7 0 0014 0c0-3.5-3-8-7-13z"/>
            <path d="M9 15.5a3 3 0 004 0" opacity="0.5"/>
          </svg>
        </span>
        Belum ada catatan.<br>Ayo mulai minum air!
      </div>`;
    return;
  }

  // Render setiap entri log
  container.innerHTML = log.map(entri => {
    const lebarBar = Math.min(100, Math.round((entri.jumlah / data.target) * 100));
    return `
      <div class="item-riwayat">
        <div class="titik-riwayat"></div>
        <span class="waktu-riwayat">${entri.waktu}</span>
        <span class="jumlah-riwayat">+${entri.jumlah} ml</span>
        <div class="bar-riwayat-bungkus">
          <div class="bar-riwayat">
            <div class="bar-riwayat-isi" style="width:${lebarBar}%"></div>
          </div>
        </div>
        <button class="tombol-hapus" onclick="hapusEntri(${entri.id})" title="Hapus">✕</button>
      </div>`;
  }).join('');
}


/* ============================================================
   6. RENDER HALAMAN RIWAYAT (7 HARI)
   ============================================================ */
function renderRiwayat() {
  const container = document.getElementById('daftarRiwayat');
  const hariNama  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulanNama = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  // Buat array data untuk 7 hari terakhir (hari ini = indeks 0)
  const tujuhHari = Array.from({ length: 7 }, (_, i) => {
    const tgl   = new Date();
    tgl.setDate(tgl.getDate() - i);

    const kunci = `${tgl.getFullYear()}-${String(tgl.getMonth()+1).padStart(2,'0')}-${String(tgl.getDate()).padStart(2,'0')}`;
    const label = i === 0 ? 'Hari ini'
                : i === 1 ? 'Kemarin'
                : `${hariNama[tgl.getDay()]}, ${tgl.getDate()} ${bulanNama[tgl.getMonth()]}`;

    const log   = data.log[kunci] || [];
    const total = log.reduce((a, b) => a + b.jumlah, 0);

    return { label, total, jumlahMinum: log.length };
  });

  container.innerHTML = tujuhHari.map(hari => {
    const persen = Math.min(100, Math.round((hari.total / data.target) * 100));
    const warna  = persen >= 100 ? '#f0a500' : persen >= 60 ? '#5bb8d4' : '#3a7a8e';

    // SVG ikon dinamis berdasarkan persentase
    const ikonSVG = persen >= 100
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f0a500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>`
      : persen >= 60
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(91,184,212,0.9)"><path d="M12 2C9 7 5 11 5 15a7 7 0 0014 0c0-4-3-8-7-13z"/></svg>`
      : hari.total > 0
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(91,184,212,0.35)"><path d="M12 2C9 7 5 11 5 15a7 7 0 0014 0c0-4-3-8-7-13z"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(91,184,212,0.2)" stroke-width="1.5"><circle cx="12" cy="12" r="9"/></svg>`;

    return `
      <div style="
        background: linear-gradient(145deg, rgba(26,127,160,0.1), rgba(10,77,110,0.22));
        border: 1px solid rgba(91,184,212,0.1);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 10px;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
          <div>
            <div style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--warna-putih); font-weight:500">
              ${ikonSVG} ${hari.label}
            </div>
            <div style="font-size:11px; color:var(--warna-teks-dim); margin-top:2px">${hari.jumlahMinum} kali minum</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'Playfair Display',serif; font-size:20px; color:${warna}">${hari.total}</div>
            <div style="font-size:11px; color:var(--warna-teks-dim)">/ ${data.target} ml</div>
          </div>
        </div>
        <div style="background:rgba(91,184,212,0.07); border-radius:4px; height:6px; overflow:hidden">
          <div style="height:100%; width:${persen}%; background:linear-gradient(90deg,#1a7fa0,#5bb8d4); border-radius:4px; transition:width 0.8s ease"></div>
        </div>
        <div style="font-size:11px; color:var(--warna-teks-dim); margin-top:6px">${persen}% dari target</div>
      </div>`;
  }).join('');
}


/* ============================================================
   7. NAVIGASI TAB
   ============================================================ */

/**
 * Menampilkan halaman tertentu dan menyembunyikan yang lain.
 * @param {string} nama — 'beranda' | 'pengingat' | 'riwayat'
 */
function tampilHalaman(nama) {
  // Sembunyikan semua halaman & nonaktifkan semua tombol nav
  document.querySelectorAll('.halaman').forEach(h => h.classList.remove('aktif'));
  document.querySelectorAll('.tombol-nav').forEach(t => t.classList.remove('aktif'));

  // Tampilkan halaman yang dipilih
  document.getElementById('halaman-' + nama).classList.add('aktif');
  document.getElementById('nav-' + nama).classList.add('aktif');

  // Render riwayat hanya saat tab riwayat dibuka
  if (nama === 'riwayat') renderRiwayat();
}


/* ============================================================
   8. SISTEM PENGINGAT (NOTIFIKASI BROWSER)
   ============================================================ */

// Toggle pengingat ON/OFF
async function togglePengingat() {
  if (!data.pengingatOn) {
    // Minta izin notifikasi dari pengguna
    if ('Notification' in window) {
      const izin = await Notification.requestPermission();
      if (izin === 'granted') {
        data.pengingatOn = true;
        mulaiTimer();
        tampilToast('Pengingat diaktifkan');
      } else {
        tampilToast('Izin notifikasi ditolak');
        return;
      }
    } else {
      tampilToast('Browser tidak mendukung notifikasi');
      return;
    }
  } else {
    data.pengingatOn = false;
    hentikanTimer();
    tampilToast('Pengingat dinonaktifkan');
  }
  simpan();
  perbaruiUIPengingat();
}

// Perbarui tampilan UI toggle & status teks
function perbaruiUIPengingat() {
  const toggle = document.getElementById('togglePengingat');
  const status = document.getElementById('statusPengingat');

  toggle.classList.toggle('aktif', data.pengingatOn);
  status.textContent = data.pengingatOn
    ? `Aktif — setiap ${data.interval} menit`
    : 'Klik untuk mengaktifkan';
}

/**
 * Mengatur jeda waktu pengingat.
 * @param {number} nilai — interval dalam menit
 */
function setInterval_(nilai) {
  data.interval = nilai;

  // Perbarui tampilan tombol interval
  document.querySelectorAll('.tombol-interval').forEach(t => {
    t.classList.toggle('dipilih', parseInt(t.dataset.val) === nilai);
  });

  // Restart timer dengan interval baru jika pengingat aktif
  if (data.pengingatOn) { hentikanTimer(); mulaiTimer(); }
  simpan();
  perbaruiUIPengingat();
}

// Mulai timer pengingat
function mulaiTimer() {
  hentikanTimer();
  // Konversi menit ke milidetik: menit × 60 × 1000
  timerPengingat = setInterval(() => {
    if (totalHariIni() < data.target) kirimNotifikasi();
  }, data.interval * 60 * 1000);
}

// Hentikan timer pengingat
function hentikanTimer() {
  if (timerPengingat) clearInterval(timerPengingat);
  timerPengingat = null;
}

// Kirim notifikasi browser
function kirimNotifikasi() {
  if (Notification.permission === 'granted') {
    const persen = Math.round((totalHariIni() / data.target) * 100);
    new Notification('VioKin Hydrate — Waktunya Minum!', {
      body: `Kamu sudah ${persen}% dari target harian. Ayo minum sekarang!`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C9 7 5 11 5 15a7 7 0 0014 0c0-4-3-8-7-13z" fill="%235bb8d4"/></svg>'
    });
  }
}


/* ============================================================
   9. PENGATURAN TARGET HARIAN
   ============================================================ */

/**
 * Memperbarui target minum saat slider digeser.
 * @param {string} nilai — nilai target dalam ml (string dari input)
 */
function ubahTarget(nilai) {
  data.target = parseInt(nilai);
  document.getElementById('tampilTarget').textContent = nilai + ' ml';
  document.getElementById('gelasTarget').textContent  = Math.round(nilai / 250);
  simpan();
  perbaruiUI();
}


/* ============================================================
   10. TOAST (PESAN SINGKAT)
   Muncul sebentar lalu hilang otomatis setelah 2.5 detik.
   ============================================================ */
let timerToast;

function tampilToast(pesan) {
  const el = document.getElementById('toast');
  el.textContent = pesan;
  el.classList.add('tampil');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => el.classList.remove('tampil'), 2500);
}


/* ============================================================
   11. EFEK PERCIKAN SVG
   Tetes air SVG yang melayang ke bawah saat menekan tombol.
   ============================================================ */
function efekPercikan() {
  const wadah  = document.getElementById('percikan');
  // Variasi warna dan ukuran tetes
  const warna  = [
    'rgba(91,184,212,0.9)',
    'rgba(26,127,160,0.8)',
    'rgba(168,220,233,0.7)',
    'rgba(255,255,255,0.55)'
  ];
  const ukuran = [14, 18, 22, 12];

  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    const w  = ukuran[Math.floor(Math.random() * ukuran.length)];
    const c  = warna[Math.floor(Math.random() * warna.length)];

    el.className    = 'tetes';
    el.style.width  = w + 'px';
    el.style.height = w + 'px';
    el.innerHTML    = `<svg viewBox="0 0 24 24" fill="${c}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C9 7 5 11 5 15a7 7 0 0014 0c0-4-3-8-7-13z"/>
    </svg>`;

    el.style.left            = Math.random() * 80 + 10 + '%';
    el.style.top             = Math.random() * 60 + 20 + '%';
    el.style.animationDelay  = Math.random() * 0.3 + 's';

    wadah.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}


/* ============================================================
   12. GELEMBUNG ANIMASI LATAR BELAKANG
   Dibuat secara dinamis agar terlihat acak dan natural.
   ============================================================ */
function buatGelembung() {
  const scene = document.querySelector('.latar-scene');
  for (let i = 0; i < 12; i++) {
    const g      = document.createElement('div');
    g.className  = 'gelembung';
    const ukuran = Math.random() * 60 + 20;

    g.style.cssText = `
      width: ${ukuran}px;
      height: ${ukuran}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    scene.appendChild(g);
  }
}


/* ============================================================
   13. TANGGAL & JAM
   Memperbarui header setiap 30 detik.
   ============================================================ */
function perbaruiTanggal() {
  const skrg  = new Date();
  const hari  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  document.getElementById('headerTanggal').innerHTML =
    `<strong>${hari[skrg.getDay()]}, ${skrg.getDate()} ${bulan[skrg.getMonth()]}</strong>
    ${skrg.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
}


/* ============================================================
   14. INISIALISASI APLIKASI
   Dijalankan SEKALI saat halaman selesai dimuat.
   ============================================================ */
function init() {
  muat();                          // Muat data yang tersimpan
  data.hariIni = ambilKunciHari(); // Set kunci hari ini

  // Terapkan nilai tersimpan ke elemen UI
  document.getElementById('sliderTarget').value       = data.target;
  document.getElementById('tampilTarget').textContent = data.target + ' ml';
  document.getElementById('gelasTarget').textContent  = Math.round(data.target / 250);

  // Tandai tombol interval yang sesuai dengan data tersimpan
  document.querySelectorAll('.tombol-interval').forEach(t => {
    t.classList.toggle('dipilih', parseInt(t.dataset.val) === data.interval);
  });

  // Mulai jam & perbarui tiap 30 detik
  perbaruiTanggal();
  setInterval(perbaruiTanggal, 30000);

  // Cek pergantian hari setiap menit (untuk reset log harian)
  setInterval(() => {
    const hariCek = ambilKunciHari();
    if (hariCek !== data.hariIni) {
      data.hariIni = hariCek;
      perbaruiUI();
    }
  }, 60000);

  buatGelembung();       // Buat animasi gelembung latar
  perbaruiUI();          // Perbarui semua tampilan
  perbaruiUIPengingat(); // Perbarui status toggle

  // Aktifkan kembali timer pengingat jika sebelumnya aktif
  if (data.pengingatOn && Notification.permission === 'granted') {
    mulaiTimer();
  }

  // Daftarkan Service Worker untuk fitur PWA offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker terdaftar'))
      .catch(err => console.log('SW gagal:', err));
  }
}

// Jalankan saat seluruh halaman selesai dimuat
window.addEventListener('DOMContentLoaded', init);
