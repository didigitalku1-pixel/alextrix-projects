#!/usr/bin/env python3
"""
Chrome Cookie Extractor (cross-platform)
==========================================

Extracts and decrypts cookies from Chrome's local SQLite database for a
given domain. Useful for debugging scrapers that need authenticated
session cookies (e.g., aura.build, supabase, etc.).

HOW CHROME STORES COOKIES:
- Linux:   ~/.config/google-chrome/Default/Cookies  (SQLite, encrypted with PBKDF2 + AES-256-GCM, key from kwallet/gnome-keyring or fallback "peanuts" password)
- macOS:   ~/Library/Application Support/Google/Chrome/Default/Cookies  (encrypted with Keychain, password = "chrome")
- Windows: %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Network\\Cookies  (encrypted with DPAPI)

USAGE:
    python3 chrome_cookies.py --domain aura.build
    python3 chrome_cookies.py --domain supabase.co --output cookies.json
    python3 chrome_cookies.py --domain .build --browser chrome
    python3 chrome_cookies.py --list-profiles

REQUIREMENTS:
    pip install pycryptodome

NOTE:
    - Close Chrome before running on Windows (file lock)
    - On Linux, you may need to unlock the keyring or use --password peanuts
    - Cookies are decrypted using Chrome's local encryption key — this only
      works on the SAME machine where Chrome stored them. You cannot extract
      cookies from another user's machine.

DISCLAIMER:
    For debugging YOUR OWN sessions on YOUR OWN machine only.
    Do not use to extract cookies from machines you do not own.
"""

import argparse
import base64
import json
import os
import sqlite3
import sys
import tempfile
from pathlib import Path
from typing import Optional

# ============================================================================
# Browser paths
# ============================================================================

def get_chrome_paths(browser: str = "chrome") -> list[Path]:
    """Return list of possible Chrome cookie database paths for the current OS."""
    home = Path.home()
    candidates = []

    if sys.platform.startswith("linux"):
        bases = [
            home / ".config/google-chrome",
            home / ".config/chromium",
            home / ".config/google-chrome-beta",
            home / ".snap/chromium/current/.config/chromium",
        ]
        for base in bases:
            if base.exists():
                # Find all profile folders (Default, Profile 1, Profile 2, ...)
                for profile in sorted(base.iterdir()):
                    if profile.is_dir() and (profile.name == "Default" or profile.name.startswith("Profile ")):
                        candidates.append(profile / "Cookies")
                        # Newer Chrome stores cookies in Network/ subfolder
                        candidates.append(profile / "Network" / "Cookies")

    elif sys.platform == "darwin":
        bases = [
            home / "Library/Application Support/Google/Chrome",
            home / "Library/Application Support/Chromium",
        ]
        for base in bases:
            if base.exists():
                for profile in sorted(base.iterdir()):
                    if profile.is_dir() and (profile.name == "Default" or profile.name.startswith("Profile ")):
                        candidates.append(profile / "Cookies")
                        candidates.append(profile / "Network" / "Cookies")

    elif sys.platform == "win32":
        local_app = Path(os.environ.get("LOCALAPPDATA", ""))
        bases = [
            local_app / "Google/Chrome/User Data",
            local_app / "Google/Chrome SxS/User Data",
        ]
        for base in bases:
            if base.exists():
                for profile in sorted(base.iterdir()):
                    if profile.is_dir() and (profile.name == "Default" or profile.name.startswith("Profile ")):
                        candidates.append(profile / "Network" / "Cookies")
                        candidates.append(profile / "Cookies")

    return [p for p in candidates if p.exists()]


def get_chrome_local_state(browser: str = "chrome") -> Optional[Path]:
    """Path to Chrome's Local State JSON (contains encrypted master key on Linux/Windows)."""
    home = Path.home()
    if sys.platform.startswith("linux"):
        return home / ".config/google-chrome/Local State"
    elif sys.platform == "darwin":
        return home / "Library/Application Support/Google/Chrome/Local State"
    elif sys.platform == "win32":
        return Path(os.environ.get("LOCALAPPDATA", "")) / "Google/Chrome/User Data/Local State"
    return None


# ============================================================================
# Decryption
# ============================================================================

def get_master_key() -> bytes:
    """
    Decrypt Chrome's master key.
    - Linux: from Local State (encrypted with v10 prefix → PBKDF2 with "peanuts" password or keyring)
    - macOS: from Keychain (password "chrome")
    - Windows: from Local State (encrypted with DPAPI)
    """
    # Try v10/v11 prefix scheme (Linux/Windows with Local State)
    local_state_path = get_chrome_local_state()
    if local_state_path and local_state_path.exists():
        try:
            local_state = json.loads(local_state_path.read_text("utf-8"))
            encrypted_key_b64 = local_state.get("os_crypt", {}).get("encrypted_key", "")
            if encrypted_key_b64:
                encrypted_key = base64.b64decode(encrypted_key_b64)
                # Strip "DPAPI" prefix on Windows
                if encrypted_key.startswith(b"DPAPI"):
                    encrypted_key = encrypted_key[5:]
                    # Windows: decrypt with DPAPI (requires pywin32)
                    try:
                        import win32crypt
                        return win32crypt.CryptUnprotectData(encrypted_key, None, None, None, 0)[1]
                    except ImportError:
                        raise RuntimeError("On Windows, install pywin32: pip install pywin32")
                else:
                    # Linux/macOS: decrypt with PBKDF2
                    password = _get_linux_keyring_password() or b"peanuts"
                    from Crypto.Cipher import AES
                    key = _pbkdf2(password, b"saltysalt", 1, 16)
                    iv = b" " * 16
                    cipher = AES.new(key, AES.MODE_CBC, iv)
                    return cipher.decrypt(encrypted_key)[:32]  # first 32 bytes = AES-256 key
        except Exception as e:
            print(f"⚠️  Failed to read master key from Local State: {e}", file=sys.stderr)

    # Fallback: Linux without keyring → use "peanuts" password directly
    if sys.platform.startswith("linux"):
        return _pbkdf2(b"peanuts", b"saltysalt", 1, 16)

    # macOS: try Keychain
    if sys.platform == "darwin":
        try:
            import subprocess
            result = subprocess.run(
                ["security", "find-generic-password", "-w", "-s", "Chrome Safe Storage", "-a", "chrome"],
                capture_output=True, text=True, check=True
            )
            password = result.stdout.strip().encode()
            return _pbkdf2(password, b"saltysalt", 1003, 16)
        except Exception as e:
            raise RuntimeError(f"Failed to get macOS Keychain password: {e}")

    raise RuntimeError("Could not determine master key for current OS")


def _get_linux_keyring_password() -> Optional[bytes]:
    """Try to retrieve Chrome Safe Storage password from Linux keyring."""
    try:
        import subprocess
        # Try GNOME keyring
        result = subprocess.run(
            ["secret-tool", "lookup", "application", "chrome"],
            capture_output=True, text=True
        )
        if result.returncode == 0 and result.stdout:
            return result.stdout.strip().encode()
        # Try KWallet
        result = subprocess.run(
            ["kwallet-query", "-r", "Chrome Safe Storage", "-f", "Chrome Form Data", "kdewallet"],
            capture_output=True, text=True
        )
        if result.returncode == 0 and result.stdout:
            return result.stdout.strip().encode()
    except FileNotFoundError:
        pass
    return None


def _pbkdf2(password: bytes, salt: bytes, iterations: int, dklen: int) -> bytes:
    """PBKDF2-HMAC-SHA1 (Chrome's key derivation function)."""
    import hashlib
    return hashlib.pbkdf2_hmac("sha1", password, salt, iterations, dklen)


def decrypt_cookie_value(encrypted_value: bytes, master_key: bytes) -> str:
    """Decrypt a single cookie value."""
    if not encrypted_value:
        return ""

    # v10/v11 prefix → AES-256-GCM (Chrome >= v80)
    if encrypted_value[:3] in (b"v10", b"v11"):
        try:
            from Crypto.Cipher import AES
            nonce = encrypted_value[3:15]  # 12-byte nonce
            ciphertext = encrypted_value[15:-16]
            tag = encrypted_value[-16:]  # 16-byte GCM tag
            cipher = AES.new(master_key, AES.MODE_GCM, nonce=nonce)
            return cipher.decrypt_and_verify(ciphertext, tag).decode("utf-8", errors="replace")
        except ImportError:
            raise RuntimeError("Install pycryptodome: pip install pycryptodome")
        except Exception as e:
            return f"<decryption-failed: {e}>"

    # Old scheme (Chrome < v80, or Linux fallback): AES-128-CBC with "peanuts" key
    if encrypted_value[:3] in (b"v10", b"v11"):
        # Already handled above
        pass
    elif sys.platform.startswith("linux"):
        try:
            from Crypto.Cipher import AES
            key = _pbkdf2(b"peanuts", b"saltysalt", 1, 16)
            iv = b" " * 16
            cipher = AES.new(key, AES.MODE_CBC, iv)
            decrypted = cipher.decrypt(encrypted_value)
            # Strip PKCS7 padding
            pad_len = decrypted[-1]
            return decrypted[:-pad_len].decode("utf-8", errors="replace")
        except Exception:
            pass

    # Windows DPAPI (without v10 prefix)
    if sys.platform == "win32":
        try:
            import win32crypt
            return win32crypt.CryptUnprotectData(encrypted_value, None, None, None, 0)[1].decode("utf-8", errors="replace")
        except Exception:
            pass

    # Plaintext
    try:
        return encrypted_value.decode("utf-8")
    except UnicodeDecodeError:
        return f"<binary: {len(encrypted_value)} bytes>"


# ============================================================================
# Cookie database reader
# ============================================================================

def read_cookies(cookie_db_path: Path, domain_filter: str, master_key: bytes) -> list[dict]:
    """
    Read cookies from Chrome's SQLite database.
    Chrome locks the file, so we copy it to a temp file first.
    """
    cookies = []

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        tmp_path = Path(tmp.name)
        # Copy with metadata (Chrome may have WAL file)
        import shutil
        shutil.copy2(cookie_db_path, tmp_path)
        # Also copy -wal if exists
        wal_path = cookie_db_path.parent / (cookie_db_path.name + "-wal")
        if wal_path.exists():
            shutil.copy2(wal_path, tmp_path.parent / (tmp_path.name + "-wal"))

    try:
        conn = sqlite3.connect(str(tmp_path))
        cursor = conn.cursor()
        cursor.execute("""
            SELECT host_key, name, path, encrypted_value, value, expires_utc,
                   is_secure, is_httponly, samesite, priority
            FROM cookies
            WHERE host_key LIKE ?
            ORDER BY host_key, name
        """, (f"%{domain_filter}%",))
        for row in cursor.fetchall():
            host, name, path, encrypted_value, plaintext_value, expires_utc, is_secure, is_httponly, samesite, priority = row
            # Prefer decrypted value if plaintext is empty
            value = plaintext_value or decrypt_cookie_value(encrypted_value, master_key)
            # Chrome stores expires_utc as microseconds since 1601-01-01
            expires_iso = None
            if expires_utc:
                try:
                    from datetime import datetime, timezone, timedelta
                    epoch = datetime(1601, 1, 1, tzinfo=timezone.utc)
                    expires_dt = epoch + timedelta(microseconds=expires_utc)
                    expires_iso = expires_dt.isoformat()
                except Exception:
                    pass
            cookies.append({
                "host": host,
                "name": name,
                "value": value,
                "value_preview": value[:80] + "…" if len(value) > 80 else value,
                "path": path,
                "expires": expires_iso,
                "secure": bool(is_secure),
                "httponly": bool(is_httponly),
                "samesite": ["no_restriction", "lax", "strict"][samesite] if 0 <= samesite <= 2 else f"unknown({samesite})",
                "priority": ["low", "medium", "high"][priority] if 0 <= priority <= 2 else f"unknown({priority})",
            })
        conn.close()
    finally:
        tmp_path.unlink(missing_ok=True)
        wal_tmp = tmp_path.parent / (tmp_path.name + "-wal")
        wal_tmp.unlink(missing_ok=True)

    return cookies


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Extract and decrypt Chrome cookies for a given domain.",
        epilog="For debugging YOUR OWN sessions on YOUR OWN machine only.",
    )
    parser.add_argument("--domain", "-d", help="Filter cookies by domain (substring match). Example: aura.build")
    parser.add_argument("--output", "-o", help="Write JSON output to file (default: stdout)")
    parser.add_argument("--browser", "-b", default="chrome", choices=["chrome", "chromium"], help="Browser (default: chrome)")
    parser.add_argument("--list-profiles", action="store_true", help="List available Chrome profiles and exit")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    args = parser.parse_args()

    cookie_dbs = get_chrome_paths(args.browser)
    if not cookie_dbs:
        print(f"❌ No Chrome cookie databases found for {sys.platform}.", file=sys.stderr)
        print("   Make sure Chrome is installed and has been used at least once.", file=sys.stderr)
        sys.exit(1)

    if args.list_profiles:
        print("Available Chrome cookie databases:")
        for p in cookie_dbs:
            print(f"  {p}")
        return

    if not args.domain:
        parser.error("--domain is required (e.g., --domain aura.build)")

    print(f"🔍 Found {len(cookie_dbs)} Chrome profile(s)", file=sys.stderr)
    for p in cookie_dbs:
        print(f"   • {p}", file=sys.stderr)

    try:
        master_key = get_master_key()
        print(f"🔓 Master key retrieved ({len(master_key)} bytes)", file=sys.stderr)
    except Exception as e:
        print(f"⚠️  Could not get master key: {e}", file=sys.stderr)
        print("   Will attempt plaintext fallback for unencrypted cookies.", file=sys.stderr)
        master_key = b""

    all_cookies = []
    for db_path in cookie_dbs:
        print(f"\n📖 Reading cookies from {db_path}...", file=sys.stderr)
        try:
            cookies = read_cookies(db_path, args.domain, master_key)
            print(f"   Found {len(cookies)} cookies matching '{args.domain}'", file=sys.stderr)
            all_cookies.extend(cookies)
        except Exception as e:
            print(f"   ❌ Error: {e}", file=sys.stderr)

    # Dedupe (same host+name+path)
    seen = set()
    unique = []
    for c in all_cookies:
        key = (c["host"], c["name"], c["path"])
        if key not in seen:
            seen.add(key)
            unique.append(c)

    output = {
        "extracted_at": __import__("datetime").datetime.now().isoformat(),
        "domain_filter": args.domain,
        "browser": args.browser,
        "platform": sys.platform,
        "total_cookies": len(unique),
        "cookies": unique,
    }

    indent = 2 if args.pretty else None
    json_str = json.dumps(output, indent=indent, ensure_ascii=False)

    if args.output:
        Path(args.output).write_text(json_str, "utf-8")
        print(f"\n✅ Wrote {len(unique)} cookies to {args.output}", file=sys.stderr)
    else:
        print(json_str)

    # Print summary table to stderr
    print(f"\n{'='*80}", file=sys.stderr)
    print(f"Summary: {len(unique)} unique cookies for '{args.domain}'", file=sys.stderr)
    print(f"{'='*80}", file=sys.stderr)
    print(f"{'HOST':<35} {'NAME':<30} {'VALUE (preview)':<40} {'EXPIRES'}", file=sys.stderr)
    print(f"{'-'*35} {'-'*30} {'-'*40} {'-'*30}", file=sys.stderr)
    for c in unique:
        expires_short = (c["expires"] or "session")[:19]
        print(f"{c['host']:<35} {c['name']:<30} {c['value_preview']:<40} {expires_short}", file=sys.stderr)


if __name__ == "__main__":
    main()
