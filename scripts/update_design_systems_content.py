#!/usr/bin/env python3
"""
Update design_systems table with content + preview_html from individual JSON files.

The manifest only had metadata. Each design_system has a separate JSON file in
download/aura_library/design_systems/<slug>.json with full content.
"""
import httpx
import json
import os
import sys
import asyncio
from pathlib import Path
from datetime import datetime

DST_URL = os.environ.get("USER_SUPABASE_URL", "https://kvkwiekfdlaeeabkwmhp.supabase.co")
DST_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
DESIGN_SYSTEMS_DIR = Path("/home/z/my-project/audit/web-library/download/aura_library/design_systems")


def log(msg):
    ts = datetime.utcnow().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


async def update_design_system(client, slug, data):
    """Update a single design_system record with content + preview_html."""
    try:
        r = await client.patch(
            f"{DST_URL}/rest/v1/design_systems?slug=eq.{slug}",
            headers={
                "apikey": DST_KEY,
                "Authorization": f"Bearer {DST_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
            json={
                "content": data.get("content", ""),
                "preview_html": data.get("preview_html", ""),
                "source_name": data.get("source_name", ""),
                "thumbnail_url": data.get("thumbnail_url"),
                "created_by": data.get("created_by"),
                "updated_at": data.get("updated_at"),
            },
            timeout=30,
        )
        return r.status_code in (200, 204)
    except Exception as e:
        log(f"  ERROR updating {slug}: {e}")
        return False


async def main():
    if not DST_KEY:
        print("FATAL: Set SUPABASE_SERVICE_ROLE_KEY env var")
        sys.exit(1)

    log("=" * 60)
    log("Updating design_systems with content from JSON files")
    log(f"Source dir: {DESIGN_SYSTEMS_DIR}")
    log(f"Destination: {DST_URL}")
    log("=" * 60)

    files = sorted(DESIGN_SYSTEMS_DIR.glob("*.json"))
    log(f"Found {len(files)} design_system JSON files")
    log("")

    total = 0
    success = 0
    failed = 0

    async with httpx.AsyncClient(http2=True, timeout=60) as client:
        # Process in batches of 10 (parallel)
        batch_size = 10
        for i in range(0, len(files), batch_size):
            batch = files[i:i + batch_size]
            tasks = []
            for f in batch:
                try:
                    data = json.loads(f.read_text())
                    slug = data.get("slug") or f.stem
                    tasks.append(update_design_system(client, slug, data))
                except Exception as e:
                    log(f"  ERROR reading {f.name}: {e}")
                    failed += 1

            results = await asyncio.gather(*tasks)
            for ok in results:
                total += 1
                if ok:
                    success += 1
                else:
                    failed += 1

            log(f"  Processed {total}/{len(files)} (success: {success}, failed: {failed})")
            await asyncio.sleep(0.2)

    log("")
    log("=" * 60)
    log(f"DONE: {success}/{len(files)} updated, {failed} failed")
    log("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
