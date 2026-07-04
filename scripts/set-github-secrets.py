#!/usr/bin/env python3
"""
Sets GitHub repository secrets via the GitHub REST API.

Required for the daily-scrape workflow to trigger Vercel redeploys:
  - VERCEL_TOKEN       (Vercel access token with deploy permissions)
  - VERCEL_PROJECT_ID  (Vercel project ID — prj_xxx)

Flow:
  1. GET /repos/{owner}/{repo}/actions/secrets/public-key
  2. Encrypt each secret value with the repo's public key (libsodium sealed box)
  3. PUT /repos/{owner}/{repo}/actions/secrets/{name} with the encrypted value

Usage:
  GITHUB_TOKEN=ghp_xxx python3 scripts/set-github-secrets.py \
      owner/repo \
      VERCEL_TOKEN=vcp_xxx \
      VERCEL_PROJECT_ID=prj_xxx
"""
import os
import sys
import json
import base64
import urllib.request
import urllib.error
from nacl import public, encoding


def gh_api(method: str, path: str, token: str, body: dict | None = None) -> dict:
    url = f"https://api.github.com{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"❌ HTTP {e.code} {e.reason}: {body}", file=sys.stderr)
        sys.exit(1)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    owner_repo = sys.argv[1]
    if "/" not in owner_repo:
        print(f"❌ Repository must be owner/repo, got: {owner_repo}", file=sys.stderr)
        sys.exit(1)
    owner, repo = owner_repo.split("/", 1)

    secrets_to_set = {}
    for arg in sys.argv[2:]:
        if "=" not in arg:
            print(f"❌ Argument must be KEY=value: {arg}", file=sys.stderr)
            sys.exit(1)
        k, v = arg.split("=", 1)
        secrets_to_set[k.strip()] = v

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("❌ GITHUB_TOKEN env var required", file=sys.stderr)
        sys.exit(1)

    print(f"🔐 Fetching public key for {owner}/{repo}...")
    pk = gh_api("GET", f"/repos/{owner}/{repo}/actions/secrets/public-key", token)
    print(f"   Key ID: {pk.get('key_id')}")

    # PublicKey with Base64Encoder does the base64 decode internally
    pub_key = public.PublicKey(
        pk["key"].encode(),
        encoding.Base64Encoder(),
    )
    sealed_box = public.SealedBox(pub_key)

    for name, value in secrets_to_set.items():
        print(f"🔒 Encrypting & uploading secret: {name}...")
        encrypted = sealed_box.encrypt(value.encode())
        body = {
            "encrypted_value": base64.b64encode(encrypted).decode(),
            "key_id": pk["key_id"],
        }
        gh_api("PUT", f"/repos/{owner}/{repo}/actions/secrets/{name}", token, body)
        print(f"   ✓ {name} set")

    print("\n✅ All secrets set. Listing current secrets:")
    listed = gh_api("GET", f"/repos/{owner}/{repo}/actions/secrets", token)
    for s in listed.get("secrets", []):
        print(f"   - {s['name']} (created: {s.get('created_at')})")


if __name__ == "__main__":
    main()
