-




Panduan Domain Kustom | Aura



### Memulai
Pengantar
- Cara Mengedit Desain
- Domain Kustom
- Pengaturan SEO
- Menjual Template
- Tips untuk Prompting
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
- Avoid AI Slop
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
### Sumber Daya

- Video Tutorial
- Dokumentasi
- FAQ
# Cara Menyiapkan Domain Kustom

Sambungkan domain Anda sendiri ke proyek Aura untuk pengalaman yang profesional dan berbranding. Pengunjung Anda akan melihat domain kustom Anda alih-alih subdomain Aura default.
## Di halaman ini
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)
## Di halaman ini
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)
## Overview

### Dukungan Domain Kustom

Secara default, proyek Aura yang dipublikasikan dihosting pada subdomain Aura (misalnya, `yourproject.aura.build`). Dengan langganan PRO, Anda dapat menghubungkan domain kustom Anda sendiri untuk memberikan proyek Anda tampilan yang lebih profesional.

Cara kerjanya

Saat Anda menghubungkan domain kustom, pengunjung ke domain Anda (misalnya, `yourdomain.com`) akan melihat proyek Aura Anda sambil URL tetap di domain Anda. Ini sempurna untuk portfolio, landing page, dan proyek klien.
## Requirements

Sebelum menghubungkan domain kustom, pastikan Anda memiliki hal berikut:

**Langganan PRO** — Domain kustom adalah fitur PRO

**Proyek yang dipublikasikan** — Proyek Anda harus dipublikasikan terlebih dahulu

**Domain yang Anda miliki** — Dibeli dari registrar domain (misalnya, Name.com, Namecheap, GoDaddy, Cloudflare)

**Akses ke pengaturan DNS** — Anda perlu menambahkan catatan DNS di registrar domain Anda
## Purchase a Domain

Untuk menghubungkan domain kustom ke proyek Aura, Anda pertama-tama perlu membeli domain dari registrar domain.1

**Pilih Registrar Domain** — Beli domain dari penyedia seperti Name.com, Cloudflare, Namecheap, GoDaddy, atau Porkbun. Harga biasanya berkisar $10-15/tahun untuk ekstensi umum seperti .com.2

**Registrasi Domain Anda** — Cari nama domain yang diinginkan dan lengkapkan pembelian. Pastikan Anda memiliki akses ke panel manajemen DNS.
#### Popular Domain Registrars

Kebanyakan registrar memiliki panel manajemen DNS di bawah "Domain Settings" atau "DNS Records". Berikut adalah panduan untuk menambahkan A Records dan CNAMEs:[Name.com](https://www.name.com/support/articles/205188538-pointing-your-domain-to-hosting-with-a-records)[Namecheap](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/)[GoDaddy](https://www.godaddy.com/help/add-an-a-record-19238)[Cloudflare](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)[IONOS](https://www.ionos.com/help/domains/configuring-your-ip-address/adding-an-a-record-for-your-domain/)[Porkbun](https://kb.porkbun.com/article/68-how-to-edit-dns-records)
## Connect Your Domain

Ikuti langkah-langkah berikut untuk menghubungkan domain kustom Anda ke proyek Aura Anda:1

Buka proyek Anda di editor Aura dan klik tombol **Publish** di bilah navigasi atas untuk membuka popover Publish.2

Di popover Publish, klik **Custom Domain** (di samping label URL) untuk menampilkan pengaturan domain kustom.3

Masukkan nama domain Anda di kolom input. Anda dapat menggunakan **apex domain** (misalnya, `yourdomain.com`) atau **subdomain** (misalnya, `blog.yourdomain.com`). Aura akan memeriksa apakah domain tersedia.4

Klik **Save Domain** untuk menyimpan domain kustom Anda. Aura akan mengonfigurasi sertifikat SSL untuk domain Anda secara otomatis.
#### Important

Anda harus mempublikasikan proyek Anda terlebih dahulu sebelum dapat menambahkan domain kustom. Opsi Custom Domain hanya tersedia untuk proyek yang dipublikasikan.
## DNS Configuration

Setelah menyimpan domain Anda di Aura, Anda perlu mengonfigurasi pengaturan DNS Anda di registrar domain Anda. Konfigurasi bergantung pada apakah Anda menggunakan **apex domain** atau **subdomain**.
### Option 1: Apex Domain (misalnya, yourdomain.com)

Untuk apex domain (juga disebut "root" atau "naked domain"), pertahankan hanya **catatan DNS ini**. Hapus catatan A atau AAAA lainnya untuk apex domain agar SSL dapat diterbitkan dengan benar:TypeNameValueA@75.2.60.5CNAMEwwwaura.build
#### A Record (@)

Menunjuk apex domain Anda (misalnya, `yourdomain.com`) ke server Aura.
#### CNAME Record (www)

Menunjuk subdomain www Anda (misalnya, `www.yourdomain.com`) ke Aura.
### Option 2: Subdomain (misalnya, blog.yourdomain.com)

Untuk subdomain (seperti `blog.yourdomain.com`, `app.yourdomain.com`, atau `shop.yourdomain.com`), Anda hanya memerlukan **satu catatan CNAME**:TypeNameValueCNAMEblog (subdomain Anda)aura.build
#### Why subdomains are simpler

Subdomain hanya memerlukan satu catatan CNAME, membuatnya lebih mudah dikonfigurasi. Mereka juga tidak mempengaruhi catatan DNS domain utama Anda, yang berguna jika Anda sudah menggunakan apex domain Anda untuk email atau situs web lainnya.

Tip

Untuk apex domain, pastikan tidak ada catatan A atau AAAA lain yang dikonfigurasi, karena mereka dapat mengganggu pengaturan Aura.
## Verification

Setelah mengonfigurasi catatan DNS Anda, mungkin membutuhkan waktu bagi perubahan untuk tersebar. Berikut apa yang dapat Anda harapkan:
#### DNS Propagation

Perubahan DNS dapat memakan waktu **hingga 48 jam** untuk tersebar secara global, meskipun biasanya jauh lebih cepat.
#### Automatic SSL

Aura secara otomatis menyediakan sertifikat SSL. Situs Anda akan dapat diakses melalui HTTPS setelah DNS dikonfigurasi.

Anda dapat memeriksa status propagasi menggunakan alat seperti [dnschecker.org](https://dnschecker.org)
## Troubleshooting

Mengalami masalah saat menghubungkan domain Anda? Berikut adalah beberapa masalah umum dan solusinya:
#### Domain menampilkan "SSL Error" atau "Not Secure"

Ini biasanya berarti DNS belum sepenuhnya tersebar. Tunggu beberapa jam dan coba lagi. Sertifikat SSL disediakan secara otomatis setelah DNS dikonfigurasi dengan benar.
#### Domain menampilkan konten atau homepage yang salah

Pastikan:
- •Catatan DNS Anda dikonfigurasi dengan benar (A record menunjuk ke `75.2.60.5`)
- •Domain disimpan dengan benar di popover Publish
- •Tidak ada catatan A atau AAAA yang bertentangan untuk domain Anda
#### "Domain already in use" error

Setiap domain hanya dapat dihubungkan ke satu proyek Aura. Jika Anda melihat error ini, domain mungkin sudah terhubung ke proyek lain. Hapusnya dari proyek lain terlebih dahulu, atau gunakan subdomain sebagai gantinya.
#### Can't add CNAME for apex domain (@)

Catatan CNAME tidak dapat digunakan pada apex domain (domain "naked" tanpa www). Ini adalah batasan spesifikasi DNS. Gunakan A record (`75.2.60.5`) untuk apex domain Anda dan CNAME untuk subdomain www.
#### Subdomain not working

Jika subdomain Anda (seperti `blog.yourdomain.com`) tidak berfungsi:
- •Verifikasi catatan CNAME menunjuk ke `aura.build`
- •Pastikan Anda memasukkan subdomain yang tepat di Aura (misalnya, `blog.yourdomain.com`, bukan hanya `yourdomain.com`)
- •Subdomain tidak memerlukan A record — hanya CNAME
## Di halaman ini
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)
## Di halaman ini
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)