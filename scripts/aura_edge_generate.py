#!/usr/bin/env python3
"""
Aura.build Edge Function Client — Generate rich DESIGN.md + recreation_prompt
=============================================================================
Calls aura.build Edge Function to generate rich DESIGN.md matching their format.
"""
import httpx
import json
import time
import sys
import argparse
from pathlib import Path
from datetime import datetime

AURA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
AURA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"
ACCESS_TOKEN = open("/tmp/aura_access_token.txt").read().strip()

ALEXTRIX_URL = "https://kvkwiekfdlaeeabkwmhp.supabase.co"
SERVICE_ROLE_KEY = open("/tmp/supa_service_role.txt").read().strip()

PROGRESS_FILE = Path("/home/z/my-project/download/edge_gen_progress.json")
LOG_FILE = Path("/home/z/my-project/download/edge_gen.log")

AURA_HEADERS = {
    "apikey": AURA_ANON,
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
}

ALEXTRIX_HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"processed": 0, "success": 0, "failed": 0, "started_at": datetime.now().isoformat()}

def save_progress(p):
    PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS_FILE.write_text(json.dumps(p, indent=2))

def fetch_templates_missing_artifact(batch_size=50):
    log("Fetching templates from Alextrix Supabase...")
    existing_ids = set()
    offset = 0
    while True:
        r = httpx.get(
            f"{ALEXTRIX_URL}/rest/v1/design_md",
            headers=ALEXTRIX_HEADERS,
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
    log(f"  Templates with rich DESIGN.md (source=aura_edge): {len(existing_ids)}")
    
    all_templates = []
    offset = 0
    while True:
        r = httpx.get(
            f"{ALEXTRIX_URL}/rest/v1/templates",
            headers=ALEXTRIX_HEADERS,
            params={
                "select": "id,slug,title,description",
                "order": "views.desc",
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
        all_templates.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000
    log(f"  Total templates: {len(all_templates)}")
    missing = [t for t in all_templates if t["id"] not in existing_ids]
    log(f"  Missing rich DESIGN.md: {len(missing)}")
    return missing[:batch_size]

def call_aura_edge_function(template_id, artifact_type):
    try:
        r = httpx.post(
            f"{AURA_URL}/functions/v1/generate-template-artifact",
            headers=AURA_HEADERS,
            json={
                "sourceType": "shared_code",
                "sourceId": template_id,
                "artifact": artifact_type,
                "forceRegenerate": False,
            },
            timeout=90.0,
        )
        if r.status_code == 200:
            data = r.json()
            if artifact_type == "design_md":
                return data.get("designMarkdown") or data.get("content") or ""
            elif artifact_type == "recreation_prompt":
                return data.get("recreationPrompt") or data.get("content") or ""
        elif r.status_code == 403:
            # Pro access required — mark as skipped, not failed
            log(f"  ⏭️ Skipped (Pro access required)", "SKIP")
            return "SKIP_PRO_REQUIRED"
        else:
            log(f"  Edge Function error: HTTP {r.status_code} - {r.text[:200]}", "ERROR")
            return None
    except Exception as e:
        log(f"  Edge Function exception: {e}", "ERROR")
        return None

def upsert_artifact(template_id, artifact_type, content):
    payload = {
        "template_id": int(template_id),
        "artifact_type": artifact_type,
        "content": content,
        "source": "aura_edge",
        "generated_at": datetime.now().isoformat(),
    }
    try:
        r = httpx.post(
            f"{ALEXTRIX_URL}/rest/v1/design_md",
            headers={**ALEXTRIX_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
            json=payload,
            timeout=30.0,
        )
        return r.status_code in (200, 201)
    except Exception as e:
        log(f"  Upsert exception: {e}", "ERROR")
        return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=50)
    args = parser.parse_args()

    log("=" * 60)
    log(f"Aura Edge Function Generator — batch={args.batch}")
    log("=" * 60)

    missing = fetch_templates_missing_artifact(batch_size=args.batch)
    if not missing:
        log("✓ All templates already have rich DESIGN.md!")
        return 0

    progress = load_progress()
    success = 0
    failed = 0

    for i, t in enumerate(missing):
        template_id = t["id"]
        title = t.get("title", "Untitled")[:50]
        log(f"[{i+1}/{len(missing)}] Template ID {template_id}: {title}...")

        design_md = call_aura_edge_function(template_id, "design_md")
        if design_md == "SKIP_PRO_REQUIRED":
            # Save minimal placeholder so we don't retry this template
            placeholder = f"---\nname: {title}\nstatus: pro_required\n---\n\nThis template requires Pro access on aura.build to generate full DESIGN.md.\n"
            upsert_artifact(template_id, "design_md", placeholder)
            progress["processed"] += 1
            progress["failed"] += 1
            save_progress(progress)
            continue
        if design_md and len(design_md) > 100:
            if upsert_artifact(template_id, "design_md", design_md):
                success += 1
                log(f"  ✅ design_md saved ({len(design_md)} chars)")
            else:
                failed += 1
        else:
            failed += 1
            log(f"  ❌ design_md generation failed", "WARN")

        time.sleep(1)

        prompt = call_aura_edge_function(template_id, "recreation_prompt")
        if prompt == "SKIP_PRO_REQUIRED":
            continue
        if prompt and len(prompt) > 50:
            if upsert_artifact(template_id, "recreation_prompt", prompt):
                log(f"  ✅ recreation_prompt saved ({len(prompt)} chars)")
            else:
                log(f"  ⚠️ recreation_prompt save failed", "WARN")

        progress["processed"] += 1
        progress["success"] = success
        progress["failed"] = failed
        save_progress(progress)
        time.sleep(2)

    log("\n" + "=" * 60)
    log(f"BATCH COMPLETE — Processed: {progress['processed']}, Success: {success}, Failed: {failed}")
    log("=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())
