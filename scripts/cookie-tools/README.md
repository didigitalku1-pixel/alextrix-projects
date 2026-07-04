# Cookie & Token Inspector Toolkit

Tools untuk debugging session autentikasi di aplikasi web. Berguna untuk:
- Mengembangkan scraper yang butuh authenticated session (e.g., aura.build)
- Debugging Supabase auth flow di aplikasi sendiri
- Inspecting cookies yang disimpan Chrome untuk domain tertentu
- Decoding JWT tokens untuk pahami claims dan expiry

## 📦 Tools

### 1. `chrome_cookies.py` — Chrome Cookie Extractor (Python)

Extract & decrypt cookies dari Chrome SQLite database untuk domain tertentu.

```bash
# Install dependency
pip install pycryptodome

# Basic usage
python3 chrome_cookies.py --domain aura.build

# Pretty print + save to file
python3 chrome_cookies.py --domain aura.build --pretty --output cookies.json

# List semua Chrome profiles
python3 chrome_cookies.py --list-profiles

# Filter domain lain
python3 chrome_cookies.py --domain supabase.co
python3 chrome_cookies.py --domain .build
```

**Cara kerja:**
1. Locate Chrome's `Cookies` SQLite database (Default + Profile 1, 2, ...)
2. Copy DB ke temp file (Chrome locks the original)
3. Decrypt master key dari `Local State` JSON (Linux/macOS) atau DPAPI (Windows)
4. AES-256-GCM decrypt setiap cookie value (v10/v11 prefix)
5. Output: JSON + summary table

**Cross-platform:**
- ✅ Linux (GNOME keyring / KWallet / "peanuts" fallback)
- ✅ macOS (Keychain, password = "chrome")
- ✅ Windows (DPAPI, requires `pywin32`)

### 2. `chrome_cookies.js` — Chrome Cookie Extractor (Node.js)

Alternative Node.js version (lighter, no Python).

```bash
# Install dependency
npm install better-sqlite3 argparse

# Usage
node chrome_cookies.js --domain aura.build
node chrome_cookies.js --domain aura.build --output cookies.json --pretty
node chrome_cookies.js --list-profiles
```

> ⚠️ Node.js version cuma mendukung Linux & macOS untuk sekarang. Untuk Windows, gunakan `chrome_cookies.py`.

### 3. `browser_console_snippet.js` — DevTools F12 Snippet

JavaScript snippet yang di-paste ke Browser Console (F12) untuk dump semua session info dari current page.

**Cara pakai:**
1. Buka website target (e.g., `https://www.aura.build/`)
2. Login jika perlu
3. Tekan **F12** → pilih tab **Console**
4. Copy-paste isi `browser_console_snippet.js` ke Console
5. Tekan **Enter**

**Output:**
- 🍌 Cookies table (yang accessible via JS — HttpOnly cookies tidak terlihat)
- 💾 localStorage items (dengan preview)
- 💾 sessionStorage items
- 🔑 JWT tokens yang ter-decode (header, payload, expiry)
- 🔐 Supabase sessions (khusus key `sb-*-auth-token`)
- 📋 Full JSON di-copy ke clipboard

**Sebagai bookmarklet:** Save snippet sebagai URL bookmark (prepend `javascript:`). Klik bookmark di halaman mana pun untuk dump session.

### 4. `jwt_inspector.py` — JWT Decoder

Decode JWT tokens dari berbagai sumber.

```bash
# Decode JWT langsung
python3 jwt_inspector.py "eyJhbGciOiJIUzI1NiIs..."

# Dari file berisi JWT(s)
python3 jwt_inspector.py --file cookies.json

# Dari Supabase session JSON
python3 jwt_inspector.py --supabase session.json

# Output sebagai JSON
python3 jwt_inspector.py --supabase session.json --json
```

**Output:**
- Header (alg, typ)
- Payload (iss, sub, aud, exp, iat, role, email, dll.)
- Expiry status (valid / expired / not yet valid)
- Time to expiry

## 🔄 Workflow: Extract aura.build Session

Untuk scraper yang butuh aura.build auth session:

```bash
# Step 1: Login ke aura.build di Chrome secara manual
# (Buka https://www.aura.build/, login dengan akun Anda)

# Step 2: Extract cookies + localStorage via DevTools snippet
# (F12 → Console → paste browser_console_snippet.js → Enter)
# Output JSON akan ke-copy ke clipboard. Save sebagai session.json

# Step 3: Decode Supabase session untuk dapat access_token + refresh_token
python3 jwt_inspector.py --supabase session.json

# Step 4 (optional): Extract cookies langsung dari Chrome DB
python3 chrome_cookies.py --domain aura.build --output aura_cookies.json

# Step 5: Use di scraper Python
# (lihat scripts/scrape_aura.py — sudah expect AURA_REFRESH_TOKEN env var)
```

## 🔐 Security Notes

- Tools ini hanya untuk debugging **session Anda sendiri** di **mesin Anda sendiri**
- Cookies di Chrome di-encrypt dengan key yang terikat ke user account OS — tidak bisa diekstrak di mesin lain
- JWT tokens punya expiry — cek selalu `is_expired` sebelum dipakai
- Jangan commit file `cookies.json` / `session.json` ke git — tambahkan ke `.gitignore`
- `browser_console_snippet.js` hanya bisa akses cookies non-HttpOnly. Cookie auth biasanya HttpOnly (aman dari XSS) — gunakan `chrome_cookies.py` untuk akses lengkap

## 📋 File Layout

```
scripts/cookie-tools/
├── README.md                       ← dokumentasi ini
├── chrome_cookies.py               ← Python Chrome cookie extractor (cross-platform)
├── chrome_cookies.js               ← Node.js Chrome cookie extractor (Linux/macOS)
├── browser_console_snippet.js      ← DevTools F12 snippet (copy-paste ke Console)
└── jwt_inspector.py                ← JWT decoder & inspector
```

## 🛠️ Adding to .gitignore

Tambahkan ke `.gitignore` agar file output tidak ter-commit:

```gitignore
# Cookie & session outputs (jangan commit!)
*.cookies.json
session.json
aura_session.json
cookies.json
```

Atau jalankan: `echo "*.cookies.json\nsession.json\ncookies.json" >> .gitignore`
