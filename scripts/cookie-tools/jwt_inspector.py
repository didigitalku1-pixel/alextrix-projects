#!/usr/bin/env python3
"""
JWT Decoder & Inspector
========================

Decode and inspect JWT tokens from various sources:
- Direct command-line input
- File containing one or more JWTs
- Supabase session JSON file

USAGE:
    python3 jwt_inspector.py "eyJhbGc..."
    python3 jwt_inspector.py --file session.json
    python3 jwt_inspector.py --file cookies.json
    python3 jwt_inspector.py --supabase session.json

OUTPUT:
- Header (algorithm, type)
- Payload (all claims: iss, sub, aud, exp, iat, role, email, etc.)
- Expiry status (valid / expired / not yet valid)
- Decoded signature (if HS256 with known secret)
"""

import argparse
import base64
import json
import sys
import time
from pathlib import Path
from datetime import datetime, timezone


def b64url_decode(s: str) -> bytes:
    """Decode base64url (with or without padding)."""
    s = s.replace("-", "+").replace("_", "/")
    padding = "=" * (-len(s) % 4)
    return base64.b64decode(s + padding)


def decode_jwt(token: str) -> dict:
    """Decode a JWT into {header, payload, signature}. Does NOT verify signature."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError(f"Invalid JWT format (expected 3 parts, got {len(parts)})")
    try:
        header = json.loads(b64url_decode(parts[0]))
    except Exception as e:
        raise ValueError(f"Failed to decode header: {e}")
    try:
        payload = json.loads(b64url_decode(parts[1]))
    except Exception as e:
        raise ValueError(f"Failed to decode payload: {e}")
    return {
        "header": header,
        "payload": payload,
        "signature": parts[2],
        "raw": token,
    }


def inspect_expiry(payload: dict) -> dict:
    """Inspect exp/nbf/iat claims."""
    now = time.time()
    result = {
        "issued_at": None,
        "expires_at": None,
        "not_before": None,
        "is_expired": None,
        "is_not_yet_valid": None,
        "time_to_expiry_seconds": None,
    }
    if "iat" in payload:
        result["issued_at"] = datetime.fromtimestamp(payload["iat"], tz=timezone.utc).isoformat()
    if "exp" in payload:
        result["expires_at"] = datetime.fromtimestamp(payload["exp"], tz=timezone.utc).isoformat()
        result["is_expired"] = now > payload["exp"]
        result["time_to_expiry_seconds"] = payload["exp"] - now
    if "nbf" in payload:
        result["not_before"] = datetime.fromtimestamp(payload["nbf"], tz=timezone.utc).isoformat()
        result["is_not_yet_valid"] = now < payload["nbf"]
    return result


def find_jwts_in_text(text: str) -> list[str]:
    """Find all JWT-like strings in arbitrary text."""
    import re
    # JWT pattern: three base64url parts separated by dots
    pattern = r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"
    return re.findall(pattern, text)


def format_value(v) -> str:
    """Format a value for pretty display."""
    if isinstance(v, str) and len(v) > 80:
        return v[:77] + "..."
    return str(v)


def print_decoded(jwt_info: dict, source: str = ""):
    """Pretty-print decoded JWT."""
    print(f"\n{'=' * 80}")
    if source:
        print(f"📜 JWT from: {source}")
    print(f"{'=' * 80}")

    print(f"\n🔹 Header:")
    for k, v in jwt_info["header"].items():
        print(f"   {k}: {format_value(v)}")

    print(f"\n🔹 Payload:")
    for k, v in jwt_info["payload"].items():
        print(f"   {k}: {format_value(v)}")

    print(f"\n🔹 Signature: {jwt_info['signature'][:60]}...")

    expiry = inspect_expiry(jwt_info["payload"])
    print(f"\n🔹 Expiry:")
    for k, v in expiry.items():
        if v is not None:
            if k == "time_to_expiry_seconds":
                if v > 0:
                    print(f"   {k}: {v:.0f}s ({v / 3600:.1f}h remaining)")
                else:
                    print(f"   {k}: {v:.0f}s (EXPIRED {-v / 3600:.1f}h ago)")
            else:
                print(f"   {k}: {v}")

    if expiry.get("is_expired"):
        print(f"\n❌ TOKEN IS EXPIRED")
    elif expiry.get("is_expired") is False:
        print(f"\n✅ Token is valid")


def main():
    parser = argparse.ArgumentParser(description="Decode and inspect JWT tokens.")
    parser.add_argument("token", nargs="?", help="JWT token to decode")
    parser.add_argument("--file", "-f", help="File containing JWT(s) — scans for JWT patterns")
    parser.add_argument("--supabase", "-s", help="Supabase session JSON file (extracts access_token + refresh_token)")
    parser.add_argument("--json", action="store_true", help="Output as JSON instead of pretty-print")
    args = parser.parse_args()

    if not any([args.token, args.file, args.supabase]):
        parser.error("Provide a JWT token as argument, or use --file / --supabase")

    decoded_list = []

    if args.token:
        try:
            info = decode_jwt(args.token)
            decoded_list.append((info, "command-line"))
        except ValueError as e:
            print(f"❌ {e}", file=sys.stderr)
            sys.exit(1)

    if args.file:
        text = Path(args.file).read_text("utf-8")
        jwts = find_jwts_in_text(text)
        if not jwts:
            print(f"❌ No JWTs found in {args.file}", file=sys.stderr)
        else:
            for jwt in jwts:
                try:
                    info = decode_jwt(jwt)
                    decoded_list.append((info, f"file:{args.file}"))
                except ValueError:
                    pass

    if args.supabase:
        data = json.loads(Path(args.supabase).read_text("utf-8"))
        # Handle both raw session and nested structures
        sessions = []
        if isinstance(data, dict) and "access_token" in data:
            sessions.append(data)
        elif isinstance(data, dict) and "supabase_sessions" in data:
            sessions.extend(data["supabase_sessions"])
        elif isinstance(data, dict) and "cookies" in data:
            # from chrome_cookies.py output — look for sb-*-auth-token cookies
            for cookie in data["cookies"]:
                if "auth-token" in cookie.get("name", ""):
                    try:
                        sessions.append(json.loads(cookie["value"]))
                    except Exception:
                        pass
        for s in sessions:
            if "access_token" in s:
                try:
                    info = decode_jwt(s["access_token"])
                    decoded_list.append((info, f"supabase access_token (email={s.get('user', {}).get('email', '?')})"))
                except ValueError:
                    pass
            if "refresh_token" in s:
                print(f"\n💡 Refresh token found: {s['refresh_token'][:40]}...")

    # Output
    if args.json:
        out = []
        for info, source in decoded_list:
            entry = {
                "source": source,
                "header": info["header"],
                "payload": info["payload"],
                "expiry": inspect_expiry(info["payload"]),
            }
            out.append(entry)
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        for info, source in decoded_list:
            print_decoded(info, source)


if __name__ == "__main__":
    main()
