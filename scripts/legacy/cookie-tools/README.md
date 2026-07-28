# Cookie & Token Inspector Toolkit

Tools untuk debugging session autentikasi di aplikasi web. Berguna untuk:
- Mengembangkan scraper yang butuh authenticated session (e.g., aura.build)
- Debugging Supabase auth flow di aplikasi sendiri
- Inspecting cookies yang disimpan Chrome untuk domain tertentu
- Decoding JWT tokens untuk pahami claims dan expiry

## 🚀 Quick Start — Extract aura.build Session

**Cara paling cepat** (recommended):

1. Login ke https://www.aura.build/ dengan akun Google
2. Tekan **F12** → tab **Console**
3. Copy-paste isi `../extract_session_v2.js` ke Console → Enter
4. Modal popup muncul dengan 3 tab: `.ENV` | `JSON` | `CURL`
5. Klik tab `.ENV` → tombol **Copy** → paste ke file `.env` di project
6. Atau klik **Download .env** untuk download file `.env.aura` langsung
7. Klik **Test Token** untuk verifikasi token bekerja

**Bookmarklet** (klik sekali, tanpa F12):
1. Buat bookmark baru, isi URL dengan isi `bookmarklet.min.js`
2. Buka https://www.aura.build/ (sudah login)
3. Klik bookmark → modal popup muncul

## 📦 Tools

### 1. `extract_session_v2.js` — Aura Session Extractor (RECOMMENDED)

Script utama untuk extract session dari aura.build. Run di browser Console (F12).

**Cara pakai:**
```
1. Login ke https://www.aura.build/ dengan Google
2. F12 → Console
3. Copy-paste isi script → Enter
4. Modal popup muncul
```

**Fitur:**
- 🎨 Modal popup UI (dark theme) dengan 3 tab
- 📄 `.ENV` format siap pakai untuk scraper
- 📋 `JSON` format untuk debugging
- 🔧 `cURL` commands untuk test API manual
- 🧪 Tombol "Test Token" untuk verify via live API call
- ⬇️ Tombol "Download .env" untuk download file langsung
- 📋 Auto-copy JSON ke clipboard
- ⚠️ Deteksi token expired/expiring soon dengan warna

### 2. `bookmarklet.min.js` — Bookmarklet Version

Versi minified dari `extract_session_v2.js` (12KB) yang bisa di-save sebagai bookmark URL.

**Cara pakai:**
1. Bookmarks → Bookmark Manager → Add new bookmark
2. Name: `Aura Session Extract`
3. URL: copy-paste isi `bookmarklet.min.js`
4. Save
5. Buka https://www.aura.build/ → klik bookmark

### 3. `refresh_token.py` — Auto-Refresh Access Token

Refresh access_token otomatis menggunakan refresh_token. Berguna untuk scraper jangka panjang.

```bash
# Pakai env var
export AURA_REFRESH_TOKEN="v1.xxx..."
python3 refresh_token.py

# Update file .env otomatis
python3 refresh_token.py --env-file .env

# Output JSON lengkap
python3 refresh_token.py --refresh-token "v1.xxx..." --json

# Hanya print access_token baru (untuk pipe ke command lain)
python3 refresh_token.py --refresh-token "v1.xxx..." --quiet
```

**Token flow:**
- `access_token` expired tiap 1 jam
- `refresh_token` valid 30 hari
- Setiap refresh → dapat refresh_token baru (rotasi)
- Refresh token lama invalid setelah dipakai

### 4. `chrome_cookies.py` — Chrome Cookie Extractor (Python)

Extract & decrypt cookies dari Chrome SQLite database untuk domain tertentu.

```bash
pip install pycryptodome

python3 chrome_cookies.py --domain aura.build
python3 chrome_cookies.py --domain aura.build --output cookies.json --pretty
python3 chrome_cookies.py --list-profiles
```

Cross-platform: Linux, macOS, Windows. Lihat docstring file untuk detail.

### 5. `chrome_cookies.js` — Node.js Alternative

```bash
npm install better-sqlite3 argparse
node chrome_cookies.js --domain aura.build
```

Linux/macOS only. Untuk Windows, gunakan `chrome_cookies.py`.

### 6. `browser_console_snippet.js` — Generic DevTools Snippet

Versi generic dari extract_session_v2.js — dump cookies, localStorage, sessionStorage, JWTs dari website mana pun. Tidak spesifik aura.build.

### 7. `jwt_inspector.py` — JWT Decoder

```bash
python3 jwt_inspector.py "eyJhbGc..."
python3 jwt_inspector.py --file cookies.json
python3 jwt_inspector.py --supabase session.json
```

Decode JWT dari command line, file, atau Supabase session JSON. Output: header, payload, expiry status.

## 🔄 Workflow: Setup Scraper dengan Auth

```bash
# Step 1: Extract session (manual, sekali per 30 hari)
# - Login ke aura.build dengan Google
# - F12 → Console → paste extract_session_v2.js → Enter
# - Klik "Download .env" di modal popup
# - Pindahkan file .env.aura ke root project, rename jadi .env

# Step 2: Verify token masih valid
python3 scripts/cookie-tools/refresh_token.py --env-file .env

# Step 3: Run scraper (akan auto-refresh jika token expired)
python3 scripts/scrape_aura.py

# Step 4: Setup cron untuk auto-refresh token tiap 12 jam
# (tambahkan ke crontab atau GitHub Actions)
0 */12 * * * cd /path/to/web-library && python3 scripts/cookie-tools/refresh_token.py --env-file .env
```

## 🔐 Security Notes

- Tools hanya untuk debugging **session Anda sendiri** di **mesin Anda sendiri**
- Jangan commit file `.env`, `cookies.json`, `session.json` ke git (sudah di `.gitignore`)
- `access_token` expired tiap 1 jam — gunakan `refresh_token` untuk auto-renew
- `refresh_token` valid 30 hari — simpan di tempat aman
- HttpOnly cookies hanya bisa diakses via `chrome_cookies.py`, **bukan** via browser console
- Jangan share token ke siapa pun — siapa pun yang punya refresh_token bisa impersonate akun Anda

## 📋 File Layout

```
scripts/
├── extract_session_v2.js              ← script utama (F12 Console) — RECOMMENDED
├── extract_session.js                 ← versi lama (simple, console output only)
└── cookie-tools/
    ├── README.md                      ← dokumentasi ini
    ├── BOOKMARKLET.md                 ← cara buat bookmarklet
    ├── bookmarklet.min.js             ← bookmarklet compressed (12KB)
    ├── refresh_token.py               ← auto-refresh access_token
    ├── chrome_cookies.py              ← Chrome cookie extractor (Python, cross-platform)
    ├── chrome_cookies.js              ← Chrome cookie extractor (Node.js)
    ├── browser_console_snippet.js     ← generic DevTools snippet
    └── jwt_inspector.py               ← JWT decoder
```

## 🛠️ Adding to .gitignore

Sudah ditambahkan ke `.gitignore` utama project:

```gitignore
# Cookie & session outputs (jangan commit!)
*.cookies.json
session.json
aura_session.json
cookies.json
*_session.json
*_cookies.json
.env*
__pycache__/
```
