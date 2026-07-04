# Cara Mengedit Desain

Menguasai editor Aura untuk mengedit dan menyesuaikan desain. Pelajari cara beralih mode, menyesuaikan gaya, mengelola aset, dan menyempurnakan setiap detail.

## Mode Tampilan

### Mode Pratinjau

Lihat situs Anda persis seperti yang akan dilihat pengunjung. Interaksikan dengan tombol, tautan, dan animasi tanpa gangguan saat mengedit.

### Mode Desain

Pembangun visual. Klik elemen untuk mengedit teks, mengganti gambar, dan menyesuaikan gaya menggunakan kontrol samping.

### Mode Kode

Untuk kontrol penuh. Edit HTML mentah dan kelas Tailwind secara langsung. Perubahan diperbarui secara real-time.

## Gaya & Aset

### Mengatur Font & Tipografi

Panel Pemilihan Font (dapat diakses dari toolbar) menyediakan manajemen tipografi komprehensif. Secara otomatis mendeteksi font yang digunakan dalam desain Anda dan menawarkan kemampuan pengeditan massal yang powerful.

### Font Terimpor

Lihat semua Google Font yang saat ini dimuat di halaman Anda. Font secara otomatis diimpor saat Anda menggunakannya. Anda dapat menghapus font yang tidak terpakai untuk mengoptimalkan pemuatan halaman.

• Lihat font yang aktif digunakan vs tidak terpakai
• Hapus font individual atau hapus massal font yang tidak terpakai
• Font dimuat otomatis saat dipilih dari pemilih font

### Kombinasi Font

Preset cepat yang menerapkan font komplementer untuk judul dan teks tubuh secara bersamaan. Termasuk kombinasi populer seperti Inter/Inter, Playfair/Geist, dan lainnya.

• Aplikasi satu klik untuk kombinasi font judul + teks tubuh
• Secara otomatis mengatur bobot font yang sesuai
• Menghapus font yang tidak terpakai setelah menerapkan kombinasi

### Mengubah Font Berdasarkan Gaya

Edit massal font berdasarkan ukuran teks:

• Judul: Ubah semua teks lebih besar dari 20px sekaligus
• Teks Tubuh: Ubah semua teks 20px atau lebih kecil sekaligus
• Sesuaikan bobot font dan spasi huruf (tracking) untuk setiap kelompok gaya
• Arahkan kursor untuk menyoroti elemen yang cocok di pratinjau

### Gaya Font Terdeteksi

Secara otomatis mendeteksi semua kombinasi gaya font unik yang digunakan dalam desain Anda berdasarkan gaya yang dihitung:

• Menampilkan keluarga font, ukuran, bobot, gaya, dan spasi huruf
• Menampilkan jumlah penggunaan untuk setiap gaya
• Edit bobot dan tracking untuk setiap gaya terdeteksi
• Arahkan kursor untuk menyoroti semua elemen yang menggunakan gaya tersebut

### Font Terdeteksi

Mendaftar semua kelas keluarga font yang ditemukan di HTML Anda (misalnya, font-sans, font-playfair):

• Ubah keluarga font untuk semua elemen yang menggunakan kelas font tertentu
• Sesuaikan bobot dan spasi huruf per font
• Mendukung font yang telah ditentukan dan nilai arbitrer seperti font-[Space_Mono]
• Arahkan kursor untuk menyoroti elemen yang menggunakan setiap font

### Mengatur Warna

Panel Pemilihan Warna (dapat diakses dari toolbar) secara otomatis mendeteksi semua warna yang digunakan dalam desain Anda dan menyediakan tools manajemen warna yang powerful.

### Toggle Mode Warna

Beralih antara Mode Terang dan Mode Gelap. Saat beralih, intensitas warna secara otomatis dibalik (misalnya, text-gray-200 menjadi text-gray-800) untuk mempertahankan kontras yang tepat.

• Secara otomatis mendeteksi mode saat ini berdasarkan warna teks
• Membalik intensitas warna saat beralih mode
• Mempertahankan nilai opacity (misalnya, putih/70)
• Membalik warna hitam/putih dengan tepat

### Warna Tema

Mendeteksi nama warna dasar (misalnya, "biru", "merah", "abu-abu") yang digunakan di seluruh desain Anda:

• Menampilkan jumlah penggunaan untuk setiap nama warna
• Ganti semua instance nama warna dengan warna lain (misalnya, ganti semua "biru" dengan "indigo")
• Preset warna: Pertukaran tema cepat (Netral, Abu-abu, Batu, Indigo, Biru, Oranye, Hijau)
• Arahkan kursor untuk menyoroti semua elemen yang menggunakan warna tema

### Warna Terdeteksi

Secara otomatis menemukan semua kelas warna yang digunakan dalam desain Anda:

• Jenis: Warna teks, warna latar belakang, warna border, gradien, state hover
• Filter: Semua, Warna, Gradien, Teks, Latar Belakang, Border, Hover
• Menampilkan jumlah penggunaan untuk setiap kelas warna
• Ubah warna individual menggunakan Color Picker
• Mendukung kelas Tailwind, kode hex, RGB/RGBA, HSL/HSLA
• Menangani gradien (linear, radial, konik) sebagai unit tunggal
• Arahkan kursor untuk menyoroti elemen yang menggunakan setiap warna

### Gradien Teks

Saat mengubah warna teks menjadi gradien, sistem secara otomatis menerapkan kelas bg-clip-text dan text-transparent untuk mengaktifkan efek gradien teks.

### Mengubah Aset

Pemilih Aset (ditemukan di bagian "Embed" Popover Edit) memungkinkan Anda mengganti elemen dengan komponen yang telah dibuat sebelumnya dari pustaka Aura.

•
Pustaka Komponen: Telusuri dan sisipkan tombol, kartu, formulir, dan komponen UI lainnya
•
Pencarian & Filter: Temukan komponen berdasarkan nama, kategori, atau tag
•
Ganti Elemen: Pilih elemen dan pilih komponen untuk menggantinya sambil mempertahankan posisi
•
Kustomisasi Setelah Sisipan: Semua komponen yang disisipkan dapat diedit seperti elemen lainnya

### Pemilih Gambar

Pemilih Gambar menyediakan beberapa cara untuk menambahkan gambar ke desain Anda. Akses dari Popover Edit saat memilih elemen gambar atau latar belakang.

#### Pustaka Aura

Telusuri gambar berkualitas tinggi yang telah dipilih dari koleksi Aura. Cari berdasarkan kata kunci dan filter berdasarkan kategori.

#### Unsplash

Akses jutaan foto gratis dari Unsplash. Cari berdasarkan kata kunci dan unduh langsung.

#### Gambar Saya

Lihat dan gunakan kembali gambar yang telah Anda unggah sebelumnya. Diatur berdasarkan tanggal untuk akses mudah.

#### Opsi Unggah
•
Drag & Drop: Letakkan file gambar langsung ke Pemilih Gambar untuk unggahan instan
•
Tombol Unggah: Klik "Unggah" untuk memilih satu atau beberapa gambar dari perangkat Anda
•
URL Gambar: Tempel URL gambar apa pun untuk menggunakan gambar eksternal secara instan
•
Analisis AI: Gambar yang diunggah secara otomatis dianalisis untuk metadata, warna, dan kata kunci

### Remiks Gambar

Hasilkan variasi berbasis AI dari gambar Anda menggunakan fitur Remiks. Tersedia di Pemilih Gambar, ini memungkinkan Anda:

•
Buat variasi gaya (misalnya, "buatnya lebih vibrant", "tambahkan tampilan vintage")
•
Sesuaikan komposisi dan framing
•
Hasilkan beberapa opsi untuk dipilih
•
Gunakan berbagai model AI termasuk Gemini 3 Pro, GPT Image, dan Ideogram

### Panel Aset Pilihan

Tombol Aset Pilihan di toolbar membuka panel yang secara otomatis mendeteksi semua gambar dalam desain Anda (baik tag <img> maupun gambar latar belakang). Anda dapat:

• Melihat semua gambar di satu tempat dengan thumbnail
• Arahkan kursor untuk menyoroti gambar di pratinjau
• Klik thumbnail atau gunakan Pemilih Gambar untuk mengganti gambar apa pun
• Lihat tipe gambar (Tag Gambar vs Latar Belakang) dan nomor instance
• Akses Bagian Latar Belakang untuk pengaturan latar belakang halaman

### Mengatur Latar Belakang

Latar belakang dapat diatur untuk elemen apa pun menggunakan bagian Latar Belakang di Popover Edit atau Panel Aset Pilihan. Anda dapat menggunakan Embed (3D), Video, atau latar belakang Gambar, plus overlay warna untuk efek berlapis.

#### Embed (3D)
• Latar belakang Spline 3D
• Embed Unicorn Studio
• Adegan 3D interaktif
• Tempel URL Spline/Unicorn

#### Video
• URL YouTube/Vimeo
• URL file video langsung
• Otonya putar dan loop
• Putar dengan suara dimatikan

#### Gambar
• Unggah atau pilih dari Pemilih Gambar
• Ukuran latar belakang: cover, contain, auto
• Kontrol posisi latar belakang
• Posisi fixed atau absolute

#### Efek Latar Belakang

Semua tipe latar belakang mendukung efek visual:

• Rotasi hue, blur, saturasi, kecerahan
• Opacity dan mode blend
• Alpha mask untuk fade gradien
• Kontrol tinggi (penuh, 3/4, setengah, custom)
• Z-index untuk penumpukan

#### Latar Belakang Warna
• Warna solid menggunakan kode hex atau kelas Tailwind
• Latar belakang gradien (linear, radial)
• Warna yang sadar breakpoint (warna berbeda per perangkat)
• Dapat dikombinasikan dengan latar belakang gambar/video/embed

## Edit Lanjutan

### Popover Edit

Mengklik elemen apa pun di Mode Desain membuka Popover Edit di sisi kanan. Diatur menjadi bagian yang dapat diciutkan yang muncul berdasarkan tipe elemen dan kelas saat ini.

### Mengedit Kelas Tailwind

Area teks Kelas Tailwind memungkinkan Anda mengedit kelas utility secara langsung. Area teks secara otomatis menyesuaikan ukuran saat Anda mengetik.

•
Pratinjau Real-time: Perubahan diterapkan secara instan ke elemen yang dipilih
•
Sinkronisasi Kontrol Visual: Mengedit kelas memperbarui kontrol visual (slider, picker) secara otomatis
•
Filter Breakpoint: Filter kelas berdasarkan breakpoint untuk melihat hanya kelas mobile, tablet, atau desktop
•
Kelas Umum: Contoh termasuk p-4, flex, rounded-lg, shadow-lg

### Mengedit Gaya CSS

Bagian Inline CSS memungkinkan Anda menulis CSS kustom yang diterapkan melalui atribut style.

•
Sintaks: Tulis properti CSS standar (misalnya, transform: rotate(45deg);)
•
Gabung dengan yang Ada: Gaya baru digabungkan dengan gaya inline yang ada
•
Kasus Penggunaan: Transformasi kompleks, animasi kustom, properti yang tidak ada di Tailwind
•
Auto-expand: Area teks memuai saat gaya inline terdeteksi

### Edit Visual

Kontrol visual menyediakan slider, picker, dan dropdown yang intuitif untuk properti umum. Semua perubahan diterapkan secara real-time.

#### Layout & Spasi
• Lebar & Tinggi (dengan max/min)
• Margin (semua sisi atau individual)
• Padding (semua sisi atau individual)
• Posisi (static, relative, absolute)
• Z-index

#### Efek Visual
• Border (warna, lebar, radius)
• Shadow (beberapa preset)
• Opacity & Mode blend
• Filter (blur, grayscale, brightness)
• Transform (rotate, scale, translate)

### Pengukuran

Panel Pengukuran menampilkan nilai dimensi dan spasi yang dihitung untuk elemen yang dipilih.

•
Dimensi: Lebar dan tinggi aktual dalam piksel
•
Spasi: Nilai margin dan padding yang dihitung
•
Posisi: Offset atas, kanan, bawah, kiri untuk elemen yang diposisikan
•
Kasus Penggunaan: Pastikan spasi konsisten, sejarkan elemen dengan tepat, debug masalah layout

### Edit yang Sadar Breakpoint

Sebagian besar kontrol visual mendukung nilai spesifik breakpoint. Gunakan dropdown filter breakpoint untuk mengatur nilai berbeda untuk desktop, tablet, dan mobile. Popover Edit menunjukkan indikator breakpoint saat mengedit properti spesifik breakpoint.

## Desain Responsif

### Breakpoint Responsif

Beralih antara Tampilan Desktop, Tablet, dan Mobile menggunakan toggle mode perangkat di bilah atas. Editor menyesuaikan pratinjau untuk mencocokkan setiap breakpoint.

### Prefix Responsif

Gunakan prefix responsif Tailwind untuk menargetkan breakpoint tertentu:

• sm: Layar kecil (640px+)
• md: Layar sedang (768px+)
• lg: Layar besar (1024px+)
• xl: Ekstra besar (1280px+)

### Kontrol yang Sadar Breakpoint

Saat mengedit di mode perangkat tertentu, kontrol visual secara otomatis menerapkan prefix breakpoint. Misalnya, mengubah ukuran font di mode mobile menambahkan text-sm sementara desktop tetap text-xl.

• Pratinjau layout di semua perangkat
• Sesuaikan tipografi untuk keterbacaan mobile
• Ubah arah layout (flex-col di mobile)
• Sembunyikan/tampilkan elemen per breakpoint

## Animasi

### Animasi

Tambahkan animasi halus ke elemen menggunakan bagian Animasi di Popover Edit. Animasi meningkatkan pengalaman pengguna dan menarik perhatian ke konten penting.

### Animasi Masuk

Elemen beranimasi saat masuk ke viewport:

• Fade In
• Slide Up
• Slide Left
• Scale

### Efek Hover

Animasi interaktif saat hover:

• Lift (translate up)
• Scale (grow/shrink)
• Perubahan shadow
• Transisi warna

### Animasi Kustom

Gunakan CSS transforms dan transitions di bagian Inline CSS untuk animasi lanjutan seperti rotasi, transforms 3D, dan animasi keyframe kompleks.

---

Pada halaman ini
Mode Tampilan
Gaya & Aset
Edit Lanjutan
Desain Responsif
Animasi

PRODUK
Create
Templates
Components
Assets
Pricing
Changelog

SUMBER DAYA
Introduction
How to Prompt
How to Edit
SEO Settings
Sell Templates
Affiliates
FAQ

APA YANG KITA GUNAKAN
Mobbin
HTML Designs
Courses
UI Kit
Screen Recording
Mockups

KONEKSI
Privacy
Terms
Support
Report Issue
LinkedIn
X

© 2026 Aura. All rights reserved. Made with Cursor.