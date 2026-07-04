# Tips untuk Prompting

Pelajari cara membuat prompt yang efektif untuk pembuatan HTML dan dapatkan hasil lebih baik dengan alat desain berbasis AI Aura. Prompt yang terstruktur dengan baik adalah kunci untuk mendapatkan output yang presisi dan dapat digunakan dari alat AI.

## Tips Pembuatan HTML

Membuat prompt yang efektif untuk pembuatan HTML dapat secara signifikan meningkatkan hasil Anda. Berikut beberapa tips spesifik:

### 1. Spesifikasikan framework atau library

Sebutkan apakah Anda ingin vanilla HTML/CSS atau framework tertentu seperti Tailwind CSS, Bootstrap, atau Material UI.

* Buat formulir kontak menggunakan Tailwind CSS dengan desain responsif dan validasi formulir.

### 2. Definisikan struktur komponen

Rincikan elemen kunci yang Anda butuhkan.

* Buat kartu produk dengan gambar di bagian atas, judul produk, harga, deskripsi singkat, dan tombol 'Tambah ke Keranjang'.

### 3. Sertakan persyaratan perilaku responsif

Spesifikasikan bagaimana desain Anda harus menyesuaikan dengan ukuran layar yang berbeda.

* Buat navbar yang berubah menjadi menu hamburger pada perangkat mobile di bawah 768px lebar.

### 4. Rujuk panduan gaya atau warna merek

Berikan kode warna atau informasi gaya.

* Gunakan palet warna #3A86FF (utama), #FF006E (aksent), dan #FFFFFF (latar belakang) dengan sudut melengkung (jari-jari 8px).

### 5. Sebutkan elemen interaktif

Deskripsikan animasi atau efek apa pun.

* Sertakan efek hover yang memperbesar kartu hingga 1.05x dan menambahkan bayangan halus saat pengguna mengarahkan kursor ke produk.

### 6. Berikan referensi atau inspirasi

Arahkan ke desain yang sudah ada.

* Buat bagian testimonial mirip dengan yang ada di halaman utama Airbnb dengan avatar, kutipan, dan nama pelanggan.

## Contoh Hero Section

## Template Prompt

Template ini adalah titik awal. Untuk hasil terbaik, sesuaikannya dengan persyaratan desain spesifik Anda.

Gunakan contoh prompt ini sebagai template untuk komponen UI umum:

### Hero Section

* Buat bagian hero modern untuk produk SaaS dengan Tailwind CSS. Sertakan judul utama, subjudul, tombol CTA, dan gambar mockup mengambang di sisi kanan. Buat sepenuhnya responsif.

### Tabel Harga

* Buat tabel harga 3 tingkat dengan Tailwind CSS. Setiap kartu harus memiliki nama paket, harga, daftar fitur dengan centang, dan tombol pendaftaran. Sorot paket yang direkomendasikan dan buat responsif.

### Baris Navigasi

* Desain baris navigasi yang menempel dengan logo di kiri, tautan navigasi di tengah, dan tombol login/daftar di kanan. Buat menjadi menu hamburger pada mobile, dengan animasi slide-in yang halus.

### Kartu Testimonial

* Buat bagian testimonial dengan 3 kartu dalam satu baris. Setiap kartu harus memiliki gambar pelanggan, kutipan, nama, dan posisi. Gunakan desain bersih dengan bayangan halus dan sudut melengkung. Tambahkan peringkat bintang di bagian atas setiap kartu.

## Desain Responsif

Menulis prompt yang efektif untuk desain responsif:

### Strategi Desain Responsif

### 1. Spesifikasikan breakpoint

Definisikan kapan tata letak harus berubah.

* Buat tata letak yang berubah dari 3 kolom di desktop (1024px+) menjadi 2 kolom di tablet (768px hingga 1023px) dan 1 kolom di mobile (di bawah 768px).

### 2. Deskripsikan perilaku spesifik mobile

Rincikan bagaimana elemen harus menyesuaikan.

* Pada mobile, menu navigasi harus berubah menjadi ikon hamburger yang, saat diklik, mengungkapkan menu layar penuh dengan tombol tutup di pojok kanan atas.

### 3. Prioritaskan konten untuk mobile

Jelaskan konten mana yang paling penting.

* Pada mobile, prioritaskan formulir pendaftaran dengan menempatkannya di atas daftar fitur. Di desktop, tampilkan mereka berdampingan.

### 4. Spesifikasikan elemen yang ramah sentuhan

Minta ukuran yang sesuai untuk antarmuka sentuhan.

* Buat semua tombol setidaknya 44px tinggi di mobile untuk target sentuhan yang lebih baik, dengan jarak 16px antara elemen interaktif.

### Bingkai Perangkat

Untuk mockup yang lebih realistis, minta UI Anda untuk dipasang dalam wadah perangkat yang sesuai:

### Bingkai Browser Desktop

* Bingkai desain Anda di jendela browser dengan lampu lalu lintas (tombol tutup, minimalkan, maksimalkan).

* Buat halaman landing dan bingkai dalam jendela browser modern dengan tombol lampu lalu lintas gaya macOS (merah, kuning, hijau) di pojok kiri atas.

### Bingkai iPhone

* Tampilkan desain mobile dalam bingkai iPhone dengan notch dan tombol.

* Desain layar aplikasi untuk pelacak kebugaran, dan tempatkan dalam bingkai iPhone modern dengan notch/Dynamic Island di bagian atas.

### Bingkai iPad

* Tampilkan desain tablet dalam bingkai iPad dengan bezel khas.

* Buat versi tablet dari dashboard kami dan tampilkan dalam bingkai iPad Pro dengan bezel tipis dan sudut melengkung.

### Tip Pro

Saat meminta bingkai perangkat, sertakan detail tentang lingkungan perangkat untuk membuat mockup lebih realistis. Misalnya, spesifikasikan wallpaper desktop untuk bingkai browser, atau tambahkan refleksi dan bayangan ke perangkat mobile.

### Tips Implementasi Bingkai

### 1. Spesifikasikan model perangkat yang tepat

"Frame this design in an iPhone 14 Pro" lebih baik daripada "put this in a phone frame."

### 2. Minta elemen kontekstual

Sertakan bilah URL untuk bingkai browser atau bilah status dengan indikator waktu/baterai yang realistis untuk bingkai mobile.

### 3. Tambahkan konteks lingkungan

"Show the iPhone on a wooden desk with soft lighting" membuat mockup lebih realistis.

### 4. Pertimbangkan sudut dan perspektif

"Show the iPad at a slight angle (15°) with a subtle shadow beneath it" menambah kedalaman ke presentasi.

## Gaya & Framework

Tips untuk menentukan gaya dan framework dalam prompt Anda:

### Pemilihan Framework

* Jadilah eksplisit tentang framework CSS

"Generate a contact form using Bootstrap 5 with form validation and floating labels" lebih baik daripada hanya "Create a contact form."

### Pola Kelas

* Sertakan pola kelas tertentu

Untuk pengguna Tailwind: "Use Tailwind's container class with mx-auto and px-4 for proper spacing and centering."

### Pustaka Komponen

* Spesifikasikan sistem desain atau pustaka komponen

"Create a dashboard layout using Material UI components with a sidebar, header, and main content area."

### Arsitektur CSS

* Sebutkan arsitektur CSS

"Use BEM methodology for CSS class naming and organization with separate component-based stylesheets."

### Rujuk Gaya Diketahui

* Rujuk aplikasi favorit Anda

"Design a settings page in the style of Apple's iOS interface" atau "Create a music player with Spotify's dark theme aesthetic."

## Tipografi & Font

Tipografi memainkan peran penting dalam desain UI. Tipografi efektif meningkatkan keterbacaan, menetapkan hierarki, dan memperkuat identitas merek. Berikut cara memanfaatkan font modern dalam desain Anda:

### Dasar-Dasar Tipografi

Saat meminta desain, spesifikasikan preferensi tipografi termasuk keluarga font, berat, ukuran, tinggi baris, dan spasi huruf. Ini memastikan teks yang konsisten, mudah dibaca, dan menarik secara visual di seluruh antarmuka Anda.

### Font Web Modern

#### Sans-Serif UI Fonts

#### Monospace

#### Serif

#### Display

#### Inter

Popular

#### Inter Sans

```
AaBbCcDdEeFfGgHhIiJjKkLl
```

Sans-serif serbaguna dengan keterbacaan tinggi yang dirancang untuk layar.

#### 300

#### 400

#### 500

#### 600

#### 700

#### Geist

Trending

#### Geist Sans

```
AaBbCcDdEeFfGgHhIiJjKkLl
```

Sans-serif modern oleh Vercel dengan spasi kompak dan busur melengkung yang lembut.

#### 300

#### 400

#### 500

#### 600

#### 700

#### Plus Jakarta Sans

#### Jakarta Sans

```
AaBbCcDdEeFfGgHhIiJjKkLl
```

Sans-serif ramah yang dirancang untuk antarmuka digital.

#### 300

#### 400

#### 500

#### 600

#### 700

#### 800

#### Manrope

#### Manrope

```
AaBbCcDdEeFfGgHhIiJjKkLl
```

Sans-serif geometris modern dengan garis bersih dan proporsi seimbang.

#### 300

#### 400

#### 500

#### 600

#### 700

#### 800

#### IBM Plex Sans

#### IBM Plex

```
AaBbCcDdEeFfGgHhIiJjKkLl
```

Typeface korporat dengan keterbacaan luar biasa untuk aplikasi enterprise.

#### 300

#### 400

#### 500

#### 600

#### 700

#### Geist Mono

#### Geist Mono

```
AaBbCcDdEeFfGgHhIiJjKkLl
```

Monospace bersih yang merupakan pendamping Geist Sans, ideal untuk kode.

#### 300

#### 400

#### 500

#### 600

#### 700

## Tipografi & Font

Jelajahi font populer dan panduan tipografi untuk berbagai kebutuhan desain.

### Inter

#### H1 Display
2.5rem - 3rem (40-48px)

#### H2 Heading
1.75rem - 2rem (28-32px)

#### H3 Subheading
1.25rem - 1.5rem (20-24px)

#### Body Text
1rem (16px)

#### Small Text
0.875rem (14px)

#### Micro / Caption
0.75rem (12px)

### Geist

#### H1 Display
2.5rem - 3rem (40-48px)

#### H2 Heading
1.75rem - 2rem (28-32px)

#### H3 Subheading
1.25rem - 1.5rem (20-24px)

#### Body Text
1rem (16px)

#### Small Text
0.875rem (14px)

#### Micro / Caption
0.75rem (12px)

### Manrope

#### H1 Display
2.5rem - 3rem (40-48px)

#### H2 Heading
1.75rem - 2rem (28-32px)

#### H3 Subheading
1.25rem - 1.5rem (20-24px)

#### Body Text
1rem (16px)

#### Small Text
0.875rem (14px)

#### Micro / Caption
0.75rem (12px)

### Plus Jakarta Sans

#### H1 Display
2.5rem - 3rem (40-48px)

#### H2 Heading
1.75rem - 2rem (28-32px)

#### H3 Subheading
1.25rem - 1.5rem (20-24px)

#### Body Text
1rem (16px)

#### Small Text
0.875rem (14px)

#### Micro / Caption
0.75rem (12px)

### Geist Mono

#### H1 Display
2.5rem - 3rem (40-48px)

#### H2 Heading
1.75rem - 2rem (28-32px)

#### H3 Subheading
1.25rem - 1.5rem (20-24px)

#### Body Text
1rem (16px)

#### Small Text
0.875rem (14px)

#### Micro / Caption
0.75rem (12px)

### IBM Plex

#### H1 Display
2.5rem - 3rem (40-48px)

#### H2 Heading
1.75rem - 2rem (28-32px)

#### H3 Subheading
1.25rem - 1.5rem (20-24px)

#### Body Text
1rem (16px)

#### Small Text
0.875rem (14px)

#### Micro / Caption
0.75rem (12px)

### Ukuran Font

#### H1 Display
2.5rem - 3rem (40-48px)

#### H2 Heading
1.75rem - 2rem (28-32px)

#### H3 Subheading
1.25rem - 1.5rem (20-24px)

#### Body Text
1rem (16px)

#### Small Text
0.875rem (14px)

#### Micro / Caption
0.75rem (12px)

### Berat Font

#### Light (300)
Subjudul, teks sekunder

#### Regular (400)
Teks tubuh, paragraf

#### Medium (500)
Penekanan, subjudul

#### Semibold (600)
Tombol, teks penting

#### Bold (700)
Judul, penekanan kuat

### Spasi Huruf

#### Tight (-0.025em)
Untuk judul besar

#### Normal (0em)
Untuk teks tubuh

#### Wide (0.025em)
Untuk keterbacaan yang lebih baik

#### EXTRA WIDE (0.1EM)
Untuk teks kapital

### Pembuat Prompt Tipografi

Gunakan alat interaktif ini untuk membuat prompt tipografi yang tepat. Sesuaikan slider untuk membuat instruksi tipografi yang sempurna:

### 1. Pilih Keluarga Typeface

#### Sans-Serif

Inter, Geist, Manrope, Plus Jakarta Sans

#### Serif

Merriweather, IBM Plex Serif, Libre Baskerville

#### Monospace

Geist Mono, IBM Plex Mono, JetBrains Mono

### 2. Skala Ukuran Font

#### Headings
40-60px

#### Subheadings
28-36px

#### Body Text
14-16px

### 3. Distribusi Berat Font

#### Headings
640

#### Subheadings
560

#### Body Text
460

### 4. Spasi Huruf

#### Headings
-0.06em

#### Body Text
0.00em

#### ALL CAPS
0.05em

### Prompt yang Dihasilkan

* Buat halaman landing menggunakan font Inter dengan skala tipografi berikut:

• Headings: 40-60px, font-weight: 640, letter-spacing: -0.06em
• Subheadings: 28-36px, font-weight: 560, letter-spacing: 0.00em
• Body text: 14-16px, font-weight: 460, line-height: 1.5
• Button text: 14px, font-weight: 560
• Pastikan kontras dan hierarki yang tepat antar elemen teks

### Pratinjau Tipografi Langsung

### CONTOH TAG

#### Contoh Judul Utama

#### Contoh Subjudul

Ini adalah contoh teks tubuh yang akan digunakan untuk konten utama situs web atau aplikasi Anda. Ukuran font, berat, dan spasi dioptimalkan untuk keterbacaan di berbagai perangkat dan ukuran layar.

### Tombol Primer

## Teknik Animasi

Tingkatkan UI Anda dengan teknik animasi ini yang membawa desain menjadi hidup:

### Efek Fade-in

Secara bertahap perlihatkan elemen untuk masuk yang halus dan elegan.

* Tambahkan animasi fade-in sederhana ke bagian hero yang bertransisi dari opacity 0 ke 1 selama 800ms dengan fungsi timing ease-in-out.

### Animasi Slide-in

Pindahkan elemen ke posisi dari luar layar.

* Buat animasi slide-in untuk sidebar yang masuk dari kiri dengan transisi transform: translateX(-100%) ke translateX(0).

### Efek Blur

Transisikan dari blur menjadi jelas untuk pengungkapan dramatis.

* Terapkan efek blur-in ke gambar di mana mereka dimulai dengan filter: blur(10px) dan bertransisi ke filter: blur(0) saat masuk ke viewport.

### Animasi Berurutan

Sebar animasi di beberapa elemen.

* Buat masukan bertahap untuk item daftar di mana setiap item muncul 150ms setelah item sebelumnya menggunakan nilai animation-delay bertahap.

### Contoh Animasi

Fade In

Slide In

Bounce

Pulse

Delayed Animation

Blur Effect