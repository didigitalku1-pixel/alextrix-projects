#!/usr/bin/env python3
"""
Continuous Edge Function generator with built-in loop + auto token refresh.
No bash wrapper — pure Python, more robust.
"""
import httpx
import json
import time
import sys
import os
from pathlib import Path
from datetime import datetime

AURA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
AURA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"
ALEXTRIX_URL = "https://kvkwiekfdlaeeabkwmhp.supabase.co"

PROGRESS_FILE = Path("/home/z/my-project/download/edge_gen_progress.json")
LOG_FILE = Path("/home/z/my-project/download/edge_gen.log")

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def get_tokens():
    """Load + auto-refresh aura.build tokens."""
    access = open("/tmp/aura_access_token.txt").read().strip()
    refresh = open("/tmp/aura_refresh_token.txt").read().strip()
    return access, refresh

def refresh_aura_token(refresh_token):
    """Refresh aura.build access token."""
    try:
        r = httpx.post(
            f"{AURA_URL}/auth/v1/token?grant_type=refresh_token",
            headers={"apikey": AURA_ANON, "Content-Type": "application/json"},
            json={"refresh_token": refresh_token},
            timeout=30,
        )
        if r.status_code == 200:
            d = r.json()
            with open("/tmp/aura_access_token.txt", "w") as f:
                f.write(d["access_token"])
            with open("/tmp/aura_refresh_token.txt", "w") as f:
                f.write(d["refresh_token"])
            log("✅ Token refreshed")
            return d["access_token"], d["refresh_token"]
        else:
            log(f"❌ Token refresh failed: {r.status_code} {r.text[:200]}", "ERROR")
            return None, None
    except Exception as e:
        log(f"❌ Token refresh exception: {e}", "ERROR")
        return None, None

def get_service_role_key():
    """Get service role key from Supabase Management API."""
    pat = "REDACTED_PAT"
    project_ref = "kvkwiekfdlaeeabkwmhp"
    r = httpx.get(
        f"https://api.supabase.com/v1/projects/{project_ref}/api-keys",
        headers={"Authorization": f"Bearer {pat}"},
        timeout=30,
    )
    for k in r.json():
        if k.get("name") == "service_role":
            with open("/tmp/supa_service_role.txt", "w") as f:
                f.write(k["api_key"])
            return k["api_key"]
    return None

def main():
    log("=" * 60)
    log("Continuous Edge Function Generator")
    log("=" * 60)

    # Get service role key
    service_key = get_service_role_key()
    if not service_key:
        log("❌ Cannot get service role key", "ERROR")
        return 1

    alextrix_headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    # Get aura tokens
    access_token, refresh_token = get_tokens()
    if not access_token:
        log("❌ No aura access token", "ERROR")
        return 1

    BATCH_SIZE = 100
    TOTAL_TEMPLATES = 21563
    last_token_refresh = datetime.now()

    iteration = 0
    while True:
        iteration += 1
        log(f"\n{'='*40}")
        log(f"ITERATION {iteration}")
        log(f"{'='*40}")

        # Refresh token every 30 minutes
        if (datetime.now() - last_token_refresh).total_seconds() > 1800:
            log("🔄 Refreshing aura.build token (30 min elapsed)...")
            new_access, new_refresh = refresh_aura_token(refresh_token)
            if new_access:
                access_token = new_access
                refresh_token = new_refresh
                last_token_refresh = datetime.now()
            else:
                log("⚠️ Token refresh failed, retrying with old token")

        aura_headers = {
            "apikey": AURA_ANON,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        # Step 1: Fetch templates missing rich design_md
        log("Fetching templates missing rich DESIGN.md...")
        existing_ids = set()
        offset = 0
        while True:
            try:
                r = httpx.get(
                    f"{ALEXTRIX_URL}/rest/v1/design_md",
                    headers=alextrix_headers,
                    params={
                        "select": "template_id",
                        "artifact_type": "eq.design_md",
                        "source": "eq.aura_edge",
                        "limit": "1000",
                        "offset": str(offset),
                    },
                    timeout=30.0,
                )
                if r.status_code != 200:
                    break
                batch = r.json()
                if not batch:
                    break
                for item in batch:
                    if item.get("template_id"):
                        existing_ids.add(item["template_id"])
                if len(batch) < 1000:
                    break
                offset += 1000
            except Exception as e:
                log(f"  Fetch existing error: {e}", "ERROR")
                break

        log(f"  Templates with rich DESIGN.md: {len(existing_ids)}")

        if len(existing_ids) >= TOTAL_TEMPLATES:
            log("✅ All templates processed!")
            break

        # Fetch templates (just first batch_size that are missing)
        try:
            r = httpx.get(
                f"{ALEXTRIX_URL}/rest/v1/templates",
                headers=alextrix_headers,
                params={
                    "select": "id,slug,title,description",
                    "order": "views.desc",
                    "limit": "2000",
                },
                timeout=30.0,
            )
            all_templates = r.json()
        except Exception as e:
            log(f"  Fetch templates error: {e}", "ERROR")
            time.sleep(30)
            continue

        missing = [t for t in all_templates if t["id"] not in existing_ids][:BATCH_SIZE]
        log(f"  Processing {len(missing)} templates this iteration")

        if not missing:
            log("✅ No more missing templates!")
            break

        success = 0
        failed = 0
        skipped = 0

        for i, t in enumerate(missing):
            template_id = t["id"]
            title = t.get("title", "Untitled")[:50]
            log(f"[{i+1}/{len(missing)}] ID {template_id}: {title}")

            # Generate design_md
            try:
                r = httpx.post(
                    f"{AURA_URL}/functions/v1/generate-template-artifact",
                    headers=aura_headers,
                    json={
                        "sourceType": "shared_code",
                        "sourceId": template_id,
                        "artifact": "design_md",
                        "forceRegenerate": False,
                    },
                    timeout=90.0,
                )
                if r.status_code == 200:
                    data = r.json()
                    design_md = data.get("designMarkdown") or data.get("content") or ""
                    if design_md and len(design_md) > 100:
                        # Upsert to design_md table
                        r2 = httpx.post(
                            f"{ALEXTRIX_URL}/rest/v1/design_md",
                            headers=alextrix_headers,
                            json={
                                "template_id": int(template_id),
                                "artifact_type": "design_md",
                                "content": design_md,
                                "source": "aura_edge",
                                "generated_at": datetime.now().isoformat(),
                            },
                            timeout=30.0,
                        )
                        if r2.status_code in (200, 201):
                            success += 1
                            log(f"  ✅ design_md ({len(design_md)} chars)")
                        else:
                            failed += 1
                    else:
                        failed += 1
                elif r.status_code == 403:
                    # Pro required — save placeholder
                    placeholder = f"---\nname: {title}\nstatus: pro_required\n---\n\nPro access required.\n"
                    httpx.post(
                        f"{ALEXTRIX_URL}/rest/v1/design_md",
                        headers=alextrix_headers,
                        json={
                            "template_id": int(template_id),
                            "artifact_type": "design_md",
                            "content": placeholder,
                            "source": "aura_edge",
                            "generated_at": datetime.now().isoformat(),
                        },
                        timeout=30.0,
                    )
                    skipped += 1
                    log(f"  ⏭️ Skipped (Pro required)")
                else:
                    failed += 1
                    log(f"  ❌ HTTP {r.status_code}: {r.text[:100]}", "ERROR")
            except Exception as e:
                failed += 1
                log(f"  ❌ Exception: {e}", "ERROR")

            time.sleep(1)

            # Generate recreation_prompt
            try:
                r = httpx.post(
                    f"{AURA_URL}/functions/v1/generate-template-artifact",
                    headers=aura_headers,
                    json={
                        "sourceType": "shared_code",
                        "sourceId": template_id,
                        "artifact": "recreation_prompt",
                        "forceRegenerate": False,
                    },
                    timeout=90.0,
                )
                if r.status_code == 200:
                    data = r.json()
                    prompt = data.get("recreationPrompt") or data.get("content") or ""
                    if prompt and len(prompt) > 50:
                        httpx.post(
                            f"{ALEXTRIX_URL}/rest/v1/design_md",
                            headers=alextrix_headers,
                            json={
                                "template_id": int(template_id),
                                "artifact_type": "recreation_prompt",
                                "content": prompt,
                                "source": "aura_edge",
                                "generated_at": datetime.now().isoformat(),
                            },
                            timeout=30.0,
                        )
                        log(f"  ✅ recreation_prompt ({len(prompt)} chars)")
            except Exception as e:
                log(f"  ⚠️ Prompt exception: {e}", "WARN")

            time.sleep(2)

        # Update progress
        progress = {
            "iteration": iteration,
            "last_batch_processed": len(missing),
            "last_batch_success": success,
            "last_batch_failed": failed,
            "last_batch_skipped": skipped,
            "total_rich_design_md": len(existing_ids) + success,
            "last_updated": datetime.now().isoformat(),
        }
        PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
        PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

        log(f"\nIter {iteration} done: +{success} success, +{failed} failed, +{skipped} skipped")
        log(f"Total rich DESIGN.md: {progress['total_rich_design_md']}")

        # Brief pause between iterations
        time.sleep(5)

    log("\n" + "=" * 60)
    log("ALL DONE!")
    log("=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())
