# Aura Session Extractor v2 — Bookmarklet

Bookmarklet adalah versi compressed dari `extract_session_v2.js` yang bisa di-save sebagai bookmark. Klik bookmark di halaman mana pun di aura.build untuk extract session tanpa perlu F12.

## Cara buat bookmarklet

1. Buka Chrome → Bookmarks → Bookmark Manager (Ctrl+Shift+O)
2. Klik tombol menu (⋮) di kanan atas → "Add new bookmark"
3. Isi:
   - **Name:** `Aura Session Extract`
   - **URL:** Copy-paste kode dari `bookmarklet.min.js` di folder ini
4. Klik **Save**

## Cara pakai

1. Buka https://www.aura.build/ (pastikan sudah login dengan Google)
2. Klik bookmark "Aura Session Extract" di bookmark bar
3. Modal popup akan muncul dengan 3 tab: .ENV, JSON, CURL
4. Pilih tab yang diinginkan → klik "Copy"
5. Paste ke file `.env` (untuk .ENV format) atau dokumentasi (untuk JSON/CURL)

## Bookmarklet source

Kode lengkap (uncompressed) ada di `../extract_session_v2.js`. Bookmarklet di `bookmarklet.min.js` adalah versi yang sudah di-minify dan diawali `javascript:` agar bisa di-paste sebagai URL bookmark.

## Generate bookmarklet sendiri

```bash
# Install terser untuk minify
npm install -g terser

# Generate bookmarklet
terser --compress --mangle --toplevel ../extract_session_v2.js \
  | sed 's/^/javascript:/' \
  > bookmarklet.min.js
```
