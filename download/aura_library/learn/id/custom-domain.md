# Panduan Domain Kustom | Aura

### Memulai
Pendahuluan
- Cara Mengedit Desain
- Domain Kustom
- Pengaturan SEO
- Menjual Template
- Tips untuk Prompt
- Typography Prompting
- Styling Prompting
- Animation Prompting
- Layout Prompting
### Video

- Interactive Rain Hero
- Brutalist Landing Page
- $20K Website Prompt
- $20K AI Workflow
- GPT Images + Grok
- Hindari AI Slop
- Claude 4.8 vs GPT-5.5
- AI Landing Pages with Media
- GPT Image to Landing Page
- DESIGN.md Workflow
- GPT 5.5 + DESIGN.md
- Complex Animations
- DESIGN.md Better AI Design
- Animated WebGL Pages
- Gemini 3 Landing Pages
- Gemini 3 Animations
- Gemini 3 Changes Everything
- Using GPT 5.1 for Creating UIs
- Aura Compose Workflow
- Turn AI Designs to Pro-level
- Master Customizations
- Image to HTML with AI
- Improve your AI Designs
- How to Prompt for UI
### Sumber

- Video Tutorial
- Dokumentasi
- FAQ
# Cara Mengatur Domain Kustom

Hubungkan domain Anda sendiri ke proyek Aura untuk pengalaman yang profesional dan terbranding. Pengunjung Anda akan melihat domain kustom Anda bukan subdomain Aura default.

## Di halaman ini
[Ikhtisar](#ikhtisar)[Persyaratan](#persyaratan)[Membeli Domain](#membeli-domain)[Menghubungkan Domain](#menghubungkan-domain)[Konfigurasi DNS](#konfigurasi-dns)[Verifikasi](#verifikasi)[Pemecahan Masalah](#pemecahan-masalah)

## Ikhtisar

### Dukungan Domain Kustom

Secara default, proyek Aura yang Anda publikasai dihosting di subdomain Aura (misalnya, `yourproject.aura.build`). Dengan langganan PRO, Anda dapat menghubungkan domain kustom sendiri untuk memberikan tampilan yang lebih profesional pada proyek Anda.

Cara kerjanya

Saat Anda menghubungkan domain kustom, pengunjung ke domain Anda (misalnya, `yourdomain.com`) akan melihat proyek Aura Anda sementara URL tetap di domain Anda. Ini sempurna untuk portfolio, landing page, dan proyek klien.

## Persyaratan

Sebelum menghubungkan domain kustom, pastikan Anda memiliki:

**Langganan PRO** — Domain kustom adalah fitur PRO

**Proyek yang dipublikasikan** — Proyek Anda harus dipublikasikan terlebih dahulu

**Domain yang Anda miliki** — Dibeli dari registrar domain (misalnya, Name.com, Namecheap, GoDaddy, Cloudflare)

**Akses ke pengaturan DNS** — Anda perlu menambahkan catatan DNS di registrar domain Anda

## Membeli Domain

Untuk menghubungkan domain kustom ke proyek Aura, Anda perlu membeli domain dari registrar domain terlebih dahulu.

**Pilih Registrar Domain** — Beli domain dari penyedia seperti Name.com, Cloudflare, Namecheap, GoDaddy, atau Porkbun. Harga biasanya berkisar $10-15/tahun untuk ekstensi umum seperti .com.

**Daftarkan Domain Anda** — Cari nama domain yang Anda inginkan dan selesaikan pembelian. Pastikan Anda memiliki akses ke panel manajemen DNS.
#### Registrar Domain Populer

Sebagian besar registrar memiliki panel manajemen DNS di bawah "Pengaturan Domain" atau "Catatan DNS". Berikut panduan untuk menambahkan A Record dan CNAME:[Name.com](https://www.name.com/support/articles/205188538-pointing-your-domain-to-hosting-with-a-records)[Namecheap](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/)[GoDaddy](https://www.godaddy.com/help/add-an-a-record-19238)[Cloudflare](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)[IONOS](https://www.ionos.com/help/domains/configuring-your-ip-address/adding-an-a-record-for-your-domain/)[Porkbun](https://kb.porkbun.com/article/68-how-to-edit-dns-records)

## Menghubungkan Domain

Ikuti langkah-langkah ini untuk menghubungkan domain kustom Anda ke proyek Aura:

Buka proyek Anda di editor Aura dan klik tombol **Publish** di bilah navigasi atas untuk membuka popover Publish.

Di popover Publish, klik **Domain Kustom** (sebelah label URL) untuk melihat pengaturan domain kustom.

Masukkan nama domain Anda di kolom input. Anda dapat menggunakan **apex domain** (misalnya, `yourdomain.com`) atau **subdomain** (misalnya, `blog.yourdomain.com`). Aura akan memeriksa apakah domain tersedia.

Klik **Simpan Domain** untuk menyimpan domain kustom Anda. Aura akan secara otomatis mengonfigurasi sertifikat SSL untuk domain Anda.
#### Penting

Anda harus mempublikasikan proyek Anda terlebih dahulu sebelum dapat menambahkan domain kustom. Opsi Domain Kustom hanya tersedia untuk proyek yang sudah dipublikasikan.

## Konfigurasi DNS

Setelah menyimpan domain Anda di Aura, Anda perlu mengonfigurasi pengaturan DNS di registrar domain Anda. Konfigurasi ini bergantung pada apakah Anda menggunakan **apex domain** atau **subdomain**.
### Opsi 1: Apex Domain (misalnya, yourdomain.com)

Untuk apex domain (juga disebut "root" atau "naked domain"), pertahankan hanya **catatan DNS ini**. Hapus catatan A atau AAAA lainnya untuk apex domain agar SSL dapat diterbitkan dengan benar:TypeNameValueA@75.2.60.5CNAMEwwwaura.build
#### A Record (@)

Menunjuk apex domain Anda (misalnya, `yourdomain.com`) ke server Aura.
#### CNAME Record (www)

Menunjuk subdomain www Anda (misalnya, `www.yourdomain.com`) ke Aura.
### Opsi 2: Subdomain (misalnya, blog.yourdomain.com)

Untuk subdomain (seperti `blog.yourdomain.com`, `app.yourdomain.com`, atau `shop.yourdomain.com`), Anda hanya memerlukan **satu catatan CNAME**:TypeNameValueCNAMEblog (subdomain Anda)aura.build
#### Mengapa subdomain lebih sederhana

Subdomain hanya memerlukan satu catatan CNAME, membuatnya lebih mudah dikonfigurasi. Mereka juga tidak mempengaruhi catatan DNS domain utama Anda, yang berguna jika Anda sudah menggunakan apex domain untuk email atau situs web lainnya.

Tip

Untuk apex domain, pastikan tidak ada catatan A atau AAAA lain yang dikonfigurasi, karena mereka dapat mengganggu pengaturan Aura.

## Verifikasi

Setelah mengonfigurasi catatan DNS, mungkin butuh waktu bagi perubahan untuk tersebar. Berikut yang dapat Anda harapkan:
#### Penyebaran DNS

Perubahan DNS dapat memakan waktu **hingga 48 jam** untuk menyebar ke seluruh dunia, meskipun biasanya jauh lebih cepat.
#### SSL Otomatis

Aura secara otomatis menyediakan sertifikat SSL. Situs Anda dapat diakses melalui HTTPS setelah DNS dikonfigurasi.

Anda dapat memeriksa status penyebaran menggunakan alat seperti [dnschecker.org](https://dnschecker.org)

## Pemecahan Masalah

Masalah saat menghubungkan domain Anda? Berikut beberapa masalah umum dan solusinya:
#### Domain menampilkan "Kesalahan SSL" atau "Tidak Aman"

Ini biasanya berarti DNS belum sepenuhnya tersebar. Tunggu beberapa jam dan coba lagi. Sertifikat SSL disediakan secara otomatis setelah DNS dikonfigurasi dengan benar.
#### Domain menampilkan konten atau halaman beranda yang salah

Pastikan:
- •Catatan DNS Anda dikonfigurasi dengan benar (A record menunjuk ke `75.2.60.5`)
- •Domain disimpan dengan benar di popover Publish
- •Tidak ada catatan A atau AAAA yang bertentangan untuk domain Anda
#### Error "Domain sudah digunakan"

Setiap domain hanya dapat dihubungkan ke satu proyek Aura. Jika melihat error ini, domain mungkin sudah terhubung ke proyek lain. Hapus dari proyek lain terlebih dahulu, atau gunakan subdomain sebagai gantinya.
#### Tidak dapat menambahkan CNAME untuk apex domain (@)

Catatan CNAME tidak dapat digunakan pada apex domain (domain "telanjang" tanpa www). Ini adalah batasan spesifikasi DNS. Gunakan A record (`75.2.60.5`) untuk apex domain Anda dan CNAME untuk subdomain www.
#### Subdomain tidak berfungsi

Jika subdomain Anda (seperti `blog.yourdomain.com`) tidak berfungsi:
- •Verifikasi catatan CNAME menunjuk ke `aura.build`
- •Pastikan Anda memasukkan subdomain yang tepat di Aura (misalnya, `blog.yourdomain.com`, bukan hanya `yourdomain.com`)
- •Subdomain tidak memerlukan A record — hanya CNAME