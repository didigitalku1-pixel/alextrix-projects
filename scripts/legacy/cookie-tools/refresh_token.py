#!/usr/bin/env python3
"""
Aura Token Refresher
=====================

Refresh Aura (Supabase) access token menggunakan refresh_token.
Berguna untuk scraper yang butuh authenticated session jangka panjang.

Token flow:
  1. User login di aura.build (Google) → dapat access_token (1 jam) + refresh_token (30 hari)
  2. Saat access_token expired, POST ke /auth/v1/token?grant_type=refresh_token
     dengan refresh_token → dapat access_token baru + refresh_token baru
  3. refresh_token lama invalid setelah dipakai (rotasi)

USAGE:
    # Pakai env var
    export AURA_REFRESH_TOKEN="v1.xxx..."
    python3 refresh_token.py

    # Atau langsung
    python3 refresh_token.py --refresh-token "v1.xxx..."

    # Update file .env dengan token baru
    python3 refresh_token.py --env-file .env

OUTPUT:
    - JSON response dari Supabase (access_token, refresh_token, expires_at, user)
    - Update .env file jika --env-file diberikan
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Supabase config (public, dari src/app/api/items/route.ts)
SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"


def decode_jwt_payload(token: str) -> dict:
    """Decode JWT payload tanpa verify signature."""
    import base64
    parts = token.split(".")
    if len(parts) != 3:
        return {}
    payload_b64 = parts[1]
    # Pad to multiple of 4
    payload_b64 += "=" * (-len(payload_b64) % 4)
    return json.loads(base64.urlsafe_b64decode(payload_b64))


def refresh_token(refresh_tok: str) -> dict:
    """Refresh Supabase access token. Returns new session JSON."""
    url = f"{SUPA_URL}/auth/v1/token?grant_type=refresh_token"
    body = json.dumps({"refresh_token": refresh_tok}).encode("utf-8")
    req = Request(url, data=body, method="POST", headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json",
    })
    try:
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"❌ HTTP {e.code}: {err_body}", file=sys.stderr)
        if e.code == 401:
            print("   Refresh token invalid atau sudah dipakai. Login ulang di aura.build untuk dapat refresh_token baru.", file=sys.stderr)
        sys.exit(1)
    except URLError as e:
        print(f"❌ Network error: {e.reason}", file=sys.stderr)
        sys.exit(1)


def update_env_file(env_path: Path, session: dict) -> None:
    """Update .env file dengan token baru (replace baris yang ada)."""
    if not env_path.exists():
        env_path.write_text(_build_env_content(session))
        return

    lines = env_path.read_text("utf-8").splitlines()
    updates = {
        "AURA_REFRESH_TOKEN": session.get("refresh_token", ""),
        "AURA_ACCESS_TOKEN": session.get("access_token", ""),
        "AURA_TOKEN_EXPIRES_AT": str(session.get("expires_at", "")),
        "AURA_TOKEN_UPDATED_AT": str(int(time.time())),
    }
    updated_keys = set()
    new_lines = []
    for line in lines:
        if "=" in line and not line.strip().startswith("#"):
            key = line.split("=", 1)[0].strip()
            if key in updates:
                new_lines.append(f"{key}={updates[key]}")
                updated_keys.add(key)
                continue
        new_lines.append(line)

    # Add any missing keys
    for key, val in updates.items():
        if key not in updated_keys:
            new_lines.append(f"{key}={val}")

    env_path.write_text("\n".join(new_lines) + "\n")


def _build_env_content(session: dict) -> str:
    return "\n".join([
        "# Aura Build session — refreshed " + time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        f"AURA_REFRESH_TOKEN={session.get('refresh_token', '')}",
        f"AURA_ACCESS_TOKEN={session.get('access_token', '')}",
        f"AURA_TOKEN_EXPIRES_AT={session.get('expires_at', '')}",
        f"AURA_TOKEN_UPDATED_AT={int(time.time())}",
        "",
    ])


def main():
    parser = argparse.ArgumentParser(description="Refresh Aura (Supabase) access token.")
    parser.add_argument("--refresh-token", help="Refresh token (atau set env AURA_REFRESH_TOKEN)")
    parser.add_argument("--env-file", help="Path ke .env file untuk update otomatis")
    parser.add_argument("--json", action="store_true", help="Output full JSON response")
    parser.add_argument("--quiet", action="store_true", help="Hanya print access_token baru")
    args = parser.parse_args()

    refresh_tok = args.refresh_token or os.environ.get("AURA_REFRESH_TOKEN")
    if not refresh_tok:
        parser.error("Refresh token required. Set AURA_REFRESH_TOKEN env var or use --refresh-token.")

    print(f"🔄 Refreshing token via {SUPA_URL}...", file=sys.stderr)
    session = refresh_token(refresh_tok)

    if "access_token" not in session:
        print(f"❌ Response tidak ada access_token: {json.dumps(session, indent=2)}", file=sys.stderr)
        sys.exit(1)

    # Decode JWT untuk info expiry
    payload = decode_jwt_payload(session["access_token"])
    exp_iso = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime(payload.get("exp", 0)))
    expires_in = payload.get("exp", 0) - int(time.time())

    # Output
    if args.quiet:
        print(session["access_token"])
    elif args.json:
        print(json.dumps(session, indent=2))
    else:
        print(f"\n✅ Token refreshed successfully!\n", file=sys.stderr)
        print(f"   Email:       {session.get('user', {}).get('email', '?')}", file=sys.stderr)
        print(f"   Role:        {session.get('user', {}).get('role', '?')}", file=sys.stderr)
        print(f"   Expires at:  {exp_iso}", file=sys.stderr)
        print(f"   Valid for:   {expires_in // 60} min ({expires_in // 3600}h)", file=sys.stderr)
        print(f"\n📋 New tokens:", file=sys.stderr)
        print(f"\nAURA_ACCESS_TOKEN={session['access_token']}")
        print(f"\nAURA_REFRESH_TOKEN={session['refresh_token']}")
        print(f"\nAURA_TOKEN_EXPIRES_AT={session.get('expires_at', '')}")

    # Update .env jika diminta
    if args.env_file:
        env_path = Path(args.env_file)
        update_env_file(env_path, session)
        print(f"\n💾 Updated {env_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
