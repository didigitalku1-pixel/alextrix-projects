#!/usr/bin/env node
/**
 * Chrome Cookie Extractor (Node.js version)
 * ==========================================
 *
 * Lighter alternative to chrome_cookies.py — uses better-sqlite3 + native
 * crypto for AES-256-GCM decryption. No Python dependency.
 *
 * USAGE:
 *   node chrome_cookies.js --domain aura.build
 *   node chrome_cookies.js --domain supabase.co --output cookies.json --pretty
 *   node chrome_cookies.js --list-profiles
 *
 * REQUIREMENTS:
 *   npm install better-sqlite3
 *
 * LIMITATIONS:
 *   - Linux only (for now). macOS/Windows decryption not implemented.
 *     Use chrome_cookies.py for cross-platform support.
 *   - Assumes Linux "peanuts" fallback password OR Local State v10 key.
 *
 * DISCLAIMER:
 *   For debugging YOUR OWN sessions on YOUR OWN machine only.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { ArgumentParser } = require("argparse");

// ============================================================================
// Path resolution
// ============================================================================

function getChromeCookiePaths() {
  const home = os.homedir();
  const platform = process.platform;
  const candidates = [];

  if (platform === "linux") {
    const bases = [
      path.join(home, ".config/google-chrome"),
      path.join(home, ".config/chromium"),
    ];
    for (const base of bases) {
      if (fs.existsSync(base)) {
        for (const entry of fs.readdirSync(base)) {
          const full = path.join(base, entry);
          if (fs.statSync(full).isDirectory() && (entry === "Default" || entry.startsWith("Profile "))) {
            candidates.push(path.join(full, "Cookies"));
            candidates.push(path.join(full, "Network", "Cookies"));
          }
        }
      }
    }
  } else if (platform === "darwin") {
    const bases = [
      path.join(home, "Library/Application Support/Google/Chrome"),
      path.join(home, "Library/Application Support/Chromium"),
    ];
    for (const base of bases) {
      if (fs.existsSync(base)) {
        for (const entry of fs.readdirSync(base)) {
          const full = path.join(base, entry);
          if (fs.statSync(full).isDirectory() && (entry === "Default" || entry.startsWith("Profile "))) {
            candidates.push(path.join(full, "Cookies"));
            candidates.push(path.join(full, "Network", "Cookies"));
          }
        }
      }
    }
  } else if (platform === "win32") {
    const localApp = process.env.LOCALAPPDATA || "";
    const bases = [
      path.join(localApp, "Google/Chrome/User Data"),
    ];
    for (const base of bases) {
      if (fs.existsSync(base)) {
        for (const entry of fs.readdirSync(base)) {
          const full = path.join(base, entry);
          if (fs.statSync(full).isDirectory() && (entry === "Default" || entry.startsWith("Profile "))) {
            candidates.push(path.join(full, "Network", "Cookies"));
            candidates.push(path.join(full, "Cookies"));
          }
        }
      }
    }
  }
  return candidates.filter(p => fs.existsSync(p));
}

function getLocalStatePath() {
  const home = os.homedir();
  if (process.platform === "linux") return path.join(home, ".config/google-chrome/Local State");
  if (process.platform === "darwin") return path.join(home, "Library/Application Support/Google/Chrome/Local State");
  if (process.platform === "win32") return path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/User Data/Local State");
  return null;
}

// ============================================================================
// Master key decryption
// ============================================================================

function getMasterKey() {
  // Try Local State (v10/v11 scheme)
  const localStatePath = getLocalStatePath();
  if (localStatePath && fs.existsSync(localStatePath)) {
    try {
      const localState = JSON.parse(fs.readFileSync(localStatePath, "utf-8"));
      const encryptedKeyB64 = localState?.os_crypt?.encrypted_key;
      if (encryptedKeyB64) {
        let encryptedKey = Buffer.from(encryptedKeyB64, "base64");
        if (encryptedKey.slice(0, 5).toString() === "DPAPI") {
          // Windows DPAPI — not implemented in Node (use Python script)
          throw new Error("Windows DPAPI encryption detected — use chrome_cookies.py instead");
        }
        // Linux: PBKDF2 with "peanuts" or keyring password
        const password = getLinuxKeyringPassword() || Buffer.from("peanuts");
        const key = crypto.pbkdf2Sync(password, "saltysalt", 1, 16, "sha1");
        const iv = Buffer.alloc(16, 0x20); // 16 spaces
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedKey), decipher.final()]);
        return decrypted.slice(0, 32); // first 32 bytes = AES-256 key
      }
    } catch (e) {
      console.error(`⚠️  Failed to read Local State master key: ${e.message}`);
    }
  }
  // Linux fallback: use "peanuts" directly
  if (process.platform === "linux") {
    return crypto.pbkdf2Sync(Buffer.from("peanuts"), "saltysalt", 1, 16, "sha1");
  }
  throw new Error("Could not determine master key");
}

function getLinuxKeyringPassword() {
  try {
    const { execSync } = require("child_process");
    const out = execSync("secret-tool lookup application chrome 2>/dev/null", { encoding: "utf-8" }).trim();
    return Buffer.from(out);
  } catch {
    return null;
  }
}

// ============================================================================
// Cookie value decryption
// ============================================================================

function decryptCookieValue(encryptedValue, masterKey) {
  if (!encryptedValue || encryptedValue.length === 0) return "";

  // v10/v11 prefix → AES-256-GCM
  const prefix = encryptedValue.slice(0, 3).toString();
  if (prefix === "v10" || prefix === "v11") {
    try {
      const nonce = encryptedValue.slice(3, 15); // 12 bytes
      const ciphertext = encryptedValue.slice(15, -16);
      const tag = encryptedValue.slice(-16); // 16 bytes
      const decipher = crypto.createDecipheriv("aes-256-gcm", masterKey, nonce);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString("utf-8");
    } catch (e) {
      return `<decryption-failed: ${e.message}>`;
    }
  }

  // Old Linux scheme: AES-128-CBC with "peanuts"
  if (process.platform === "linux") {
    try {
      const key = crypto.pbkdf2Sync(Buffer.from("peanuts"), "saltysalt", 1, 16, "sha1");
      const iv = Buffer.alloc(16, 0x20);
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
      const decrypted = Buffer.concat([decipher.update(encryptedValue), decipher.final()]);
      // Strip PKCS7 padding
      const padLen = decrypted[decrypted.length - 1];
      return decrypted.slice(0, -padLen).toString("utf-8");
    } catch (e) {
      // fall through
    }
  }

  // Plaintext fallback
  try {
    return encryptedValue.toString("utf-8");
  } catch {
    return `<binary: ${encryptedValue.length} bytes>`;
  }
}

// ============================================================================
// SQLite reader
// ============================================================================

function readCookies(cookieDbPath, domainFilter, masterKey) {
  // Copy to temp file (Chrome locks the original)
  const tmpPath = path.join(os.tmpdir(), `chrome-cookies-${Date.now()}.db`);
  fs.copyFileSync(cookieDbPath, tmpPath);
  const walPath = path.join(path.dirname(cookieDbPath), path.basename(cookieDbPath) + "-wal");
  if (fs.existsSync(walPath)) {
    fs.copyFileSync(walPath, tmpPath + "-wal");
  }

  try {
    const Database = require("better-sqlite3");
    const db = new Database(tmpPath, { readonly: true });
    const rows = db.prepare(`
      SELECT host_key, name, path, encrypted_value, value, expires_utc,
             is_secure, is_httponly, samesite, priority
      FROM cookies
      WHERE host_key LIKE ?
      ORDER BY host_key, name
    `).all(`%${domainFilter}%`);
    db.close();

    return rows.map(row => {
      const value = row.value || decryptCookieValue(row.encrypted_value, masterKey);
      let expiresIso = null;
      if (row.expires_utc) {
        // Chrome stores microseconds since 1601-01-01
        const epoch = Date.UTC(1601, 0, 1);
        const expiresMs = epoch + row.expires_utc / 1000;
        expiresIso = new Date(expiresMs).toISOString();
      }
      const samesiteNames = ["no_restriction", "lax", "strict"];
      const priorityNames = ["low", "medium", "high"];
      return {
        host: row.host_key,
        name: row.name,
        value: value,
        value_preview: value.length > 80 ? value.slice(0, 80) + "…" : value,
        path: row.path,
        expires: expiresIso,
        secure: !!row.is_secure,
        httponly: !!row.is_httponly,
        samesite: samesiteNames[row.samesite] || `unknown(${row.samesite})`,
        priority: priorityNames[row.priority] || `unknown(${row.priority})`,
      };
    });
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
    try { fs.unlinkSync(tmpPath + "-wal"); } catch {}
  }
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const parser = new ArgumentParser({
    description: "Extract and decrypt Chrome cookies for a given domain.",
  });
  parser.add_argument("--domain", "-d", { help: "Filter cookies by domain (substring match)" });
  parser.add_argument("--output", "-o", { help: "Write JSON output to file (default: stdout)" });
  parser.add_argument("--list-profiles", { action: "store_true", help: "List available Chrome profiles and exit" });
  parser.add_argument("--pretty", { action: "store_true", help: "Pretty-print JSON output" });
  const args = parser.parse_args();

  const cookieDbs = getChromeCookiePaths();
  if (cookieDbs.length === 0) {
    console.error(`❌ No Chrome cookie databases found for ${process.platform}.`);
    process.exit(1);
  }

  if (args.list_profiles) {
    console.log("Available Chrome cookie databases:");
    cookieDbs.forEach(p => console.log(`  ${p}`));
    return;
  }

  if (!args.domain) {
    parser.error("--domain is required (e.g., --domain aura.build)");
  }

  console.error(`🔍 Found ${cookieDbs.length} Chrome profile(s)`);
  cookieDbs.forEach(p => console.error(`   • ${p}`));

  let masterKey;
  try {
    masterKey = getMasterKey();
    console.error(`🔓 Master key retrieved (${masterKey.length} bytes)`);
  } catch (e) {
    console.error(`⚠️  Could not get master key: ${e.message}`);
    masterKey = Buffer.alloc(0);
  }

  let allCookies = [];
  for (const dbPath of cookieDbs) {
    console.error(`\n📖 Reading cookies from ${dbPath}...`);
    try {
      const cookies = readCookies(dbPath, args.domain, masterKey);
      console.error(`   Found ${cookies.length} cookies matching '${args.domain}'`);
      allCookies = allCookies.concat(cookies);
    } catch (e) {
      console.error(`   ❌ Error: ${e.message}`);
    }
  }

  // Dedupe
  const seen = new Set();
  const unique = allCookies.filter(c => {
    const key = `${c.host}|${c.name}|${c.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const output = {
    extracted_at: new Date().toISOString(),
    domain_filter: args.domain,
    platform: process.platform,
    total_cookies: unique.length,
    cookies: unique,
  };

  const json = JSON.stringify(output, null, args.pretty ? 2 : 0);
  if (args.output) {
    fs.writeFileSync(args.output, json);
    console.error(`\n✅ Wrote ${unique.length} cookies to ${args.output}`);
  } else {
    console.log(json);
  }

  // Summary table to stderr
  console.error(`\n${"=".repeat(80)}`);
  console.error(`Summary: ${unique.length} unique cookies for '${args.domain}'`);
  console.error(`${"=".repeat(80)}`);
  console.error(`${"HOST".padEnd(35)} ${"NAME".padEnd(30)} ${"VALUE (preview)".padEnd(40)} EXPIRES`);
  console.error(`${"-".repeat(35)} ${"-".repeat(30)} ${"-".repeat(40)} ${"-".repeat(30)}`);
  for (const c of unique) {
    const expiresShort = (c.expires || "session").slice(0, 19);
    console.error(`${c.host.padEnd(35)} ${c.name.padEnd(30)} ${c.value_preview.padEnd(40)} ${expiresShort}`);
  }
}

main();
