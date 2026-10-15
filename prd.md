# DOKUMEN SPESIFIKASI PRODUK (PRD): PORTOFOLIO ARCHANA
================================================================================
VERSI DOKUMEN   : v1.0.0 (Master Blueprint & Living Context)
ARSITEK SISTEM  : ZettBOT by Zettbos
STATUS PROJEK   : KODE EKSISTING TERVERIFIKASI (READY FOR PRODUCTION / ITERATION)
LINGKUNGAN      : Google Apps Script Web App + Google Sheets Database
================================================================================

================================================================================
ZONA ATAS: SPESIFIKASI KEBUTUHAN PRODUK (BLUEPRINT AWAL)
================================================================================

1. NAMA PROJEK & PROBLEM STATEMENT
--------------------------------------------------------------------------------
- Nama Projek: Portofolio Personal Branding & Interactive CMS Archana
- Deskripsi & Nilai Tambah:
  Archana adalah seorang profesional multitalenta yang menggabungkan tiga pilar utama:
  Desain Grafis (estetika visual & identitas merek), Vibe Coding (pengembangan aplikasi web interaktif cepat bertenaga AI), dan Copywriting Konversi Tinggi (psikologi penjualan & narasi persuasif).
- Problem Statement:
  1. Membutuhkan platform etalase digital yang tidak hanya menampilkan karya statis, melainkan sebuah web app interaktif yang hidup, modern, dan merefleksikan keahlian vibe coding tingkat tinggi.
  2. Pemilik portofolio membutuhkan kemudahan memperbarui konten (bio, statistik, proyek baru, artikel blog, testimoni klien, logo klien) secara instan tanpa perlu menyentuh atau membongkar ulang kode sumber aplikasi (zero-code content management).
  3. Klien atau calon pemberi kerja membutuhkan cara cepat untuk mencetak ringkasan portofolio terkurasi dalam format dokumen PDF/katalog siap rapat tanpa elemen website yang mengganggu.
  4. Pesan calon klien dari formulir kontak harus terdata secara terpusat, aman, dan memiliki nomor tiket/referensi transaksi otomatis.

2. PERAN PENGGUNA (USER ROLES)
--------------------------------------------------------------------------------
- Role 1: Pengunjung / Calon Klien (Public Visitor)
  * Mengakses dan menjelajahi seluruh section portofolio.
  * Menyaring proyek portofolio berdasarkan kategori (All, Graphic Design, Vibe Coding, Copywriting) dan kata kunci pencarian.
  * Membuka modal detail proyek (*See Detail*) dan modal artikel blog (*Read Article*).
  * Membuka dan mencetak ringkasan CV profesional.
  * Menggunakan fitur *Export Portfolio PDF* untuk mencetak katalog proyek terpilih langsung dari browser.
  * Mengirim pesan penawaran proyek melalui formulir kontak dan menerima ID referensi sekuensial harian.
- Role 2: Pemilik Situs / Admin (Archana)
  * Melakukan autentikasi menggunakan PIN keamanan (`archana123`).
  * Mengaktifkan *Admin CMS Mode* dengan status bar melayang dan tombol edit langsung pada tiap komponen kartu.
  * Mengakses *CMS Control Center Modal* multi-tab untuk mengelola Profile, Portfolio, Blogs, Services, Process, Testimonials, Clients, serta Inbox Messages.
  * Memperbarui data teks dan tautan gambar yang langsung tersinkronisasi dua arah ke Google Sheets.
  * Mengubah status pesan kontak (New -> Read -> Archived).

3. ARSITEKTUR & LINGKUNGAN KERJA
--------------------------------------------------------------------------------
- Model Arsitektur: Modular 6-File Google Apps Script Web App.
- Komponen Berkas:
  1. `Setup.gs`: Engine inisialisasi basis data, migrasi aman (*Safe Migrate*), dan penyedia dummy data awal.
  2. `code.gs`: Backend controller, penangan HTTP `doGet()`, helper include modular, dan endpoint CRUD API.
  3. `index.html`: Kerangka layout HTML5 utama, semantic markup, dan deklarasi pemanggilan scriptlet.
  4. `css.html`: Desain sistem CSS modern, variabel tema (Clean Light Mode + Violet Accent + Dark Contrast), responsive media queries, dan `@media print`.
  5. `js.html`: Logika aplikasi frontend, Optimistic UI, pelindung runtime Google API / Canvas, client caching, dan manipulasi DOM (string concatenation murni tanpa nested backtick).
  6. `modals.html`: Template modal interaktif detail karya, pembaca blog, CV exporter, login admin, dan CMS control center.
- Database: Google Sheets (SpreadsheetApp API) dengan pembacaan aman menggunakan `getDisplayValues()`.
- Hosting / Runtime: Google Apps Script Web App Engine (Eksekusi: Me, Akses: Anyone) + Standalone Browser Preview (`preview.html`).

4. ALUR KERJA APLIKASI (USER FLOW)
--------------------------------------------------------------------------------
- Flow 1: Eksplorasi Publik
  1. Pengunjung membuka URL Web App -> Navbar, Hero, dan seluruh grid dimuat secara dinamis via `getAllAppData()`.
  2. Pengunjung memilih filter kategori portofolio -> JS menyaring array di memori klien secara instan (0 detik).
  3. Pengunjung klik "See Detail" -> Modal detail proyek terbuka dengan gambar resolusi tinggi dan tautan demo.
  4. Pengunjung klik "Export Portfolio PDF" -> Browser memicu `window.print()` dengan layout katalog bersih tanpa navbar/tombol.
- Flow 2: Pengiriman Pesan & Tiket
  1. Pengunjung mengisi formulir kontak (Nama, Email, Subjek, Pesan) -> Klik "Send Message".
  2. Frontend mengekstrak data menjadi tipe primitif -> Mengirim ke `submitContactMessage()` di `code.gs`.
  3. Backend menghasilkan ID sekuensial harian (`MSG-YYYYMMDD-0001`), mencatat waktu, dan melakukan append ke sheet `Messages`.
  4. Eksekusi `SpreadsheetApp.flush()` memastikan data tersimpan permanen.
  5. Pengunjung menerima notifikasi sukses beserta nomor ID referensi tiket.
- Flow 3: Manajemen Konten Admin (CMS)
  1. Admin klik tombol melayang di pojok kanan bawah atau tombol "Admin" di navbar.
  2. Muncul modal PIN -> Admin memasukkan PIN (`archana123`) -> Backend memvalidasi via `verifyAdminPassword()`.
  3. Sesi admin aktif: Bar notifikasi atas muncul, tombol "Edit" muncul di setiap kartu, dan modal *CMS Control Center* terbuka.
  4. Admin mengedit teks profil atau menambah proyek portofolio baru -> Form disimpan.
  5. Antarmuka melakukan *Optimistic UI Update* seketika, dan backend menyinkronkan baris ke sheet terkait di Google Sheets.

5. DESAIN BASIS DATA (GOOGLE SHEETS)
--------------------------------------------------------------------------------
*Kaidah Penamaan: Seluruh nama sheet DILARANG menggunakan karakter underscore (_).*

Sheet 1: `Profile`
- Kolom: `ConfigKey` (A), `ConfigValue` (B)
- Kunci Konfigurasi: HeroTitle, HeroSub, BioText, StatYears, StatProjects, StatClients, ContactEmail, ContactPhone, ContactLocation, ProfileImage, AboutTitle, AboutDesc, AdminPIN.

Sheet 2: `Services`
- Kolom: `ServiceID` (A), `Title` (B), `Description` (C), `Icon` (D), `SortOrder` (E)
- Data Sampel: SRV-001 (Brand Identity), SRV-002 (Vibe Coding Web Apps), SRV-003 (Copywriting).

Sheet 3: `Process`
- Kolom: `ProcessID` (A), `StepNumber` (B), `Title` (C), `Description` (D), `Icon` (E)
- Data Sampel: PRC-001 (Research), PRC-002 (Concept & Vibe Coding), PRC-003 (Crafting), PRC-004 (Launch).

Sheet 4: `Portfolio`
- Kolom: `PortfolioID` (A), `Title` (B), `Category` (C), `ImageUrl` (D), `Summary` (E), `DetailContent` (F), `ProjectUrl` (G), `SortOrder` (H)
- Kategori Baku: Graphic Design, Vibe Coding, Copywriting.

Sheet 5: `Blogs`
- Kolom: `BlogID` (A), `Title` (B), `Category` (C), `ImageUrl` (D), `Excerpt` (E), `FullContent` (F), `DatePublished` (G), `ReadTime` (H)

Sheet 6: `Testimonials`
- Kolom: `TestimonialID` (A), `ClientName` (B), `ClientRole` (C), `ClientPhoto` (D), `Rating` (E), `QuoteText` (F)

Sheet 7: `Clients`
- Kolom: `ClientID` (A), `ClientName` (B), `LogoUrl` (C), `SortOrder` (D)

Sheet 8: `Messages`
- Kolom: `MessageID` (A), `Timestamp` (B), `SenderName` (C), `SenderEmail` (D), `Subject` (E), `MessageText` (F), `Status` (G)
- Format MessageID: `MSG-YYYYMMDD-0001` (Reset otomatis setiap hari). Status: `New`, `Read`, `Archived`.

6. ATURAN VALIDASI & LOGIKA KHUSUS
--------------------------------------------------------------------------------
- Safe Migration (Idempoten): Fungsi `setupDatabase()` memeriksa keberadaan sheet dan header. Dilarang menggunakan `clear()` atau hapus baris. Kolom baru selalu ditambahkan di sisi paling kanan.
- Safe Data Passing: Seluruh nilai DOM diekstrak menjadi tipe data primitif (String, Number, Boolean) sebelum dikirim via `google.script.run`.
- Pembacaan Aman getDisplayValues(): Backend selalu menggunakan `getDisplayValues()` agar format angka dan tanggal menjadi string murni dan tidak menyebabkan kegagalan parse JSON.
- Sintaks DOM Anti-Crash: Dilarang keras menggunakan Nested Template Literals (backtick bersarang). Menggunakan string concatenation klasik (`+`) dan escape string aman.
- Gemini Canvas & Standalone Friendly: Panggilan backend selalu dibungkus pengecekan `if (typeof google !== 'undefined')` dengan fallback state lokal di `js.html` agar aplikasi dapat dipratinjau secara mandiri tanpa error.

7. RENCANA ANTARMUKA PENGGUNA (UI SPECIFICATIONS)
--------------------------------------------------------------------------------
- Navbar: Brand monogram 'A', tautan navigasi responsif, tombol CTA Hire Me, dan Admin toggle.
- Hero Section: Sapaan nama, headline profesi 3-in-1, ringkasan bio, 3 stat counters, kartu foto potret dengan badge Vibe Coding.
- About Section: Kartu dua kolom dengan foto kerja, narasi gabungan seni-logika-kata, kartu highlight, dan tombol Download CV.
- Work Process: Grid 4 kartu langkah dengan badge step, ikon vektor, judul, dan ringkasan.
- Portfolio Grid: Toolbar filter pill, search box, tombol Export PDF, grid kartu karya, dan paginasi.
- CTA Banner: Banner kontras gelap (#0f172a) dengan pesan diskusi proyek dan tombol auto-scroll ke form kontak.
- Blog Section: Grid artikel dengan badge kategori, tanggal, waktu baca, dan modal baca lengkap.
- Services Section: 3 kartu layanan dengan daftar checklist fitur keunggulan.
- Happy Clients: Baris logo mitra/klien dengan efek grayscale ke warna saat hover.
- Testimonials: Slider kartu kutipan dengan foto, nama, jabatan, dan bintang rating.
- Contact Section: Dua kolom (Info kontak langsung & Formulir kirim pesan interaktif).
- Footer: Latar gelap kontras dengan identitas brand, tautan cepat, dan hak cipta.
- Floating Button: Tombol CMS melayang di sudut kanan bawah dengan efek denyut halus.

8. KRITERIA PENGUJIAN (TESTING CHECKLIST)
--------------------------------------------------------------------------------
- [ ] Database Setup: Menjalankan `setupDatabase()` berhasil membuat 8 sheet lengkap dengan dummy data tanpa menghapus sheet yang ada.
- [ ] Responsive Layout: Tampilan rapi proporsional di layar HP (360px), tablet (768px), dan monitor desktop (1240px).
- [ ] Filter Portofolio: Mengklik filter kategori menyaring kartu dengan tepat dan instan.
- [ ] Modal Details: Mengklik "See Detail" dan "Read Article" menampilkan konten modal lengkap dan tombol close berfungsi.
- [ ] PDF Exporter: Tombol "Export Portfolio PDF" memicu jendela print browser dan menghasilkan dokumen katalog bersih.
- [ ] Contact Form: Mengirim pesan berhasil memunculkan ID `MSG-YYYYMMDD-0001` dan data masuk ke sheet `Messages`.
- [ ] Admin Login: Memasukkan PIN `archana123` berhasil membuka mode CMS dan memunculkan tombol edit.
- [ ] Sinkronisasi Data: Perubahan teks pada CMS tersimpan dan tampil langsung (Optimistic UI) serta terupdate di spreadsheet.


================================================================================
ZONA BAWAH: MASTER CONTEXT & LOGIKA SISTEM TERKINI (LIVING CONTEXT)
================================================================================

A. STATUS ARSITEKTUR & LINGKUNGAN AKTIF
--------------------------------------------------------------------------------
- Status Sistem: AKTIF & TERSTRUKTUR
- Versi Core: v1.0.0
- Model Implementasi: Modular 6 File Google Apps Script
  * File 1: `Setup.gs` (Database safe migration & seeder)
  * File 2: `code.gs` (Backend controller & CRUD endpoints)
  * File 3: `index.html` (Main layout & GAS includes)
  * File 4: `css.html` (Theme styling & print media)
  * File 5: `js.html` (Client state, optimistic UI, DOM rendering via string concat)
  * File 6: `modals.html` (Interactive dialog templates & Admin CMS editor)
- Berkas Tambahan: `preview.html` (Bundled standalone preview) & `build_preview.ps1` (Compiler script lokal).

B. SKEMA DATABASE AKTIF & MAPPING INDEKS
--------------------------------------------------------------------------------
Tabel / Sheet Aktif di Google Sheets:
1. `Profile`     : [0] ConfigKey, [1] ConfigValue
2. `Services`    : [0] ServiceID, [1] Title, [2] Description, [3] Icon, [4] SortOrder
3. `Process`     : [0] ProcessID, [1] StepNumber, [2] Title, [3] Description, [4] Icon
4. `Portfolio`   : [0] PortfolioID, [1] Title, [2] Category, [3] ImageUrl, [4] Summary, [5] DetailContent, [6] ProjectUrl, [7] SortOrder
5. `Blogs`       : [0] BlogID, [1] Title, [2] Category, [3] ImageUrl, [4] Excerpt, [5] FullContent, [6] DatePublished, [7] ReadTime
6. `Testimonials`: [0] TestimonialID, [1] ClientName, [2] ClientRole, [3] ClientPhoto, [4] Rating, [5] QuoteText
7. `Clients`     : [0] ClientID, [1] ClientName, [2] LogoUrl, [3] SortOrder
8. `Messages`    : [0] MessageID, [1] Timestamp, [2] SenderName, [3] SenderEmail, [4] Subject, [5] MessageText, [6] Status

C. LOGIKA BISNIS & FORMULA AKTIF
--------------------------------------------------------------------------------
1. Generator ID Pesan Sekuensial:
   - Format: `MSG-YYYYMMDD-XXXX` (Padding 4 digit).
   - Logika: Menghitung nomor urut tertinggi pada tanggal berjalan (YYYYMMDD) yang ada di sheet `Messages`, kemudian menambahkan 1 (`maxSeq + 1`). Reset ke `0001` setiap pergantian tanggal kalender.
2. Optimistic UI & Sync:
   - Operasi penulisan frontend langsung memperbarui state memori `AppState` lokal.
   - Operasi backend selalu diakhiri dengan `SpreadsheetApp.flush()`.
3. Anti-Lag & Filtering:
   - Portofolio dan Blog mendukung server-side pagination dan in-memory client filtering tanpa reload.
   - DOM dirender menggunakan fungsi escaping aman dan string concatenation klasik (`+`).
4. Standalone Fallback Engine:
   - Objek `emulateLocalBackend()` di dalam `js.html` otomatis meng-handle request ketika `typeof google === 'undefined'`, menjamin preview lokal di Gemini Canvas atau browser biasa berjalan 100% tanpa ReferenceError.

D. LOG PEMBARUAN RESMI (OFFICIAL CHANGELOG)
--------------------------------------------------------------------------------
- [2026-10-13] Inisialisasi Arsitektur Sistem Portofolio Archana v1.0.0.
  * Pembuatan 6 file modular GAS: Setup.gs, code.gs, index.html, css.html, js.html, modals.html.
  * Implementasi Safe Migrate non-destruktif untuk 8 sheet Google Sheets.
  * Implementasi penomoran sekuensial reset harian untuk sheet Messages.
  * Penyusunan fitur interaktif: Filter portofolio, window.print() PDF catalog exporter, modal CMS multi-tab.
  * Penyusunan berkas resmi ZettBOT.md, prd.md, dan revisi.md.
- [2026-10-13] Upgrade v1.1.0: Universal Device Photo Uploader & Google Drive Integration.
  * Penambahan fungsi backend `uploadImageToDrive(base64Data, fileName, mimeType)` menggunakan `DriveApp`.
  * Otomatisasi pembuatan folder Google Drive `Archana_Portfolio_Assets` dengan hak akses publik (Anyone with link view).
  * Pembuatan direct CDN image thumbnail link (`https://drive.google.com/thumbnail?id=...&sz=w1200`) yang 100% kompatibel dengan tag <img> web.
  * Kompresi gambar cerdas berbasis HTML5 Canvas di browser klien (resize max 1200px, 82% quality) mereduksi ukuran file dari 10MB ke ~200KB sebelum upload.
  * Penerapan Universal Image Uploader di seluruh 5 modul gambar CMS: Foto Profil, Proyek Portofolio, Banner Blog, Foto Testimoni, dan Logo Klien.
  * Fleksibilitas dual-mode: Opsi input URL manual tetap tersedia via toggle button.
- [2026-10-13] Patch v1.1.1: Perbaikan Tombol Save CMS & Auto-Format Direct Google Drive Image.
  * Penambahan atribut `novalidate` pada form CMS untuk mencegah silent abort browser pada input tersembunyi.
  * Pengubahan input URL tersembunyi menjadi `type="text"` tanpa atribut `required` agar validasi HTML5 tidak memblokir tombol simpan.
  * Penambahan fungsi `formatDirectImageUrl()` untuk konversi otomatis link Google Drive viewer biasa (/view?usp=sharing) menjadi direct CDN link (thumbnail?id=...&sz=w1200), memperbaiki foto profil yang sempat broken.
  * Mekanisme fail-safe: Tombol Save selalu di-re-enable dan tidak akan pernah macet/terkunci dalam status disabled.
- [2026-10-13] Upgrade v1.2.0: Fitur Dark / Light Mode Switcher & Bilingual Translation (ID / EN).
  * Penambahan modul `ThemeManager` dengan dukungan CSS custom properties `[data-theme="dark"]`, transisi halus (smooth 0.3s), dan persistensi `localStorage` (`archana_theme`).
  * Penambahan tombol toggle tema elegan dengan ikon dinamis Matahari (☀️) dan Bulan (🌙) di Navbar.
  * Penambahan modul `I18nManager` dengan kamus lengkap (Bahasa Indonesia `id` & English `en`), menerjemahkan seluruh menu navigasi, judul seksi, tombol aksi, badge, dan formulir kontak.
  * Penambahan tombol selector bahasa berbentuk pill `[ID | EN]` di Navbar dengan status aktif dan persistensi `localStorage` (`archana_lang`).
  * Integrasi translasi dinamis pada kartu portofolio ("See Detail" / "Lihat Detail Proyek"), kartu blog ("Read Article" / "Baca Artikel"), dan alur kerja ("Step" / "Langkah").
  * Menjaga 100% integritas desain visual, CMS control center, dan sinkronisasi Google Sheets tanpa modifikasi yang tidak diminta.
- [2026-10-15] Upgrade v1.3.0: High-Performance Vercel Edge Hosting & Decoupled GAS REST API.
  * Penambahan JSON REST API handler pada `doGet(e)` dan `doPost(e)` di [code.gs](file:///d:/web%20project/portofolio/code.gs) menggunakan `ContentService`.
  * Integrasi konektor HTTP fetch di [js.html](file:///d:/web%20project/portofolio/js.html) dengan header `text/plain` sederhana untuk mem-bypass batasan browser CORS OPTIONS preflight pada Google Apps Script.
  * Implementasi Instant First Paint & Stale-While-Revalidate (SWR) pada `initApp()`: halaman langsung terbuka (< 300ms) menggunakan in-memory state dan menyinkronkan data Google Sheets di latar belakang.
  * Pembuatan berkas produksi mandiri [index.html](file:///d:/web%20project/portofolio/index.html) dan [preview.html](file:///d:/web%20project/portofolio/preview.html) via [build.ps1](file:///d:/web%20project/portofolio/build.ps1).
  * Penyiapan konfigurasi [vercel.json](file:///d:/web%20project/portofolio/vercel.json) dengan clean URLs dan security headers.
  * Pencadangan berkas template modular Google Apps Script ke [index_gas_modular.html](file:///d:/web%20project/portofolio/index_gas_modular.html).
  * Menjaga 100% integritas desain visual, skema data Google Sheets, dan seluruh fungsionalitas CMS.
- [2026-10-15] Patch v1.3.1: Zero-Reset Local Persistence, Universal Data Sync & Pure SVG Icons.
  * Penambahan auto-persistence client-side (`archana_cached_profile`, `archana_cached_portfolio`, `archana_cached_blogs`) via `localStorage` pada `initApp()`, `handleCmsProfileSave()`, `handleProfileFileSelected()`, dan `handleItemEditorSave()`. Foto profil dan hasil editan tidak akan pernah reset kembali ke asal saat web di-restart, refresh, atau relog.
  * Perbaikan sinkronisasi database Google Sheets di `initApp()`: Menangani struktur respons data `portfolio` dan `blogs` baik dalam bentuk objek paginated (`items`) maupun array langsung, sehingga data riil yang ada di spreadsheet otomatis tampil sempurna di antarmuka web.
  * Pembaruan `code.gs`: Fungsi `getAllAppData()` mengembalikan seluruh baris data Portofolio dan Blog dari Google Sheets, penambahan pembersihan spasi/casing header (`trim()`), serta fleksibilitas parameter `action`, `func`, atau `funcName` pada `doGet(e)`.
  * Perlindungan parser backend di `js.html`: Menggunakan `response.text()` yang diparse secara aman dengan `try/catch` JSON parsing agar tidak terjadi SyntaxError jika Google Apps Script belum dideploy ke New Version.
  * Penggantian seluruh karakter emoji di bagian Kontak (`✉️`, `📞`, `📍`), menu navigasi mobile, proses kerja, dan layanan dengan ikon vektor SVG inline yang tajam, presisi, dan modern sesuai standar ZettBOT Section 8.7.
  * Pembaruan berkas [build.ps1](file:///d:/web%20project/portofolio/build.ps1) menggunakan `[System.IO.File]::ReadAllText` berbasis UTF-8 murni, 100% mengeliminasi cacat karakter (mojibake: `âœ%oï¸`, `ðŸ“ž`, dll.) pada [index.html](file:///d:/web%20project/portofolio/index.html).



