#!/usr/bin/env python3
"""
Scrape ASSETS, SKILLS, and LEARN pages from aura.build.
- ASSETS: 30,614 stock images/assets from Supabase (public)
- SKILLS: 118 AI skills from Supabase (requires auth)
- LEARN: 9 static HTML content pages from aura.build/learn/*
"""
import httpx
import json
import os
import sys
import time
import asyncio
from pathlib import Path
from datetime import datetime

SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

import os; LIBRARY_DIR = Path(os.environ.get("AURA_LIBRARY_DIR", os.environ.get("AURA_LIBRARY_DIR", "/home/z/my-project/download/aura_library")))
SESSION_FILE = LIBRARY_DIR / "_meta" / "session.json"

HEADERS = {
    "apikey": ANON_KEY,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

# === ASSETS scraping ===
async def scrape_assets(client):
    """Scrape all 30,614 assets from Supabase."""
    out_dir = LIBRARY_DIR / "assets"
    out_dir.mkdir(exist_ok=True)
    
    progress_file = LIBRARY_DIR / "_meta" / "assets_progress.json"
    if progress_file.exists():
        progress = json.loads(progress_file.read_text())
    else:
        progress = {"last_offset": 0, "total": None, "done_count": 0}
    
    if progress["total"] is None:
        r = await client.head(
            f"{SUPA_URL}/rest/v1/assets?select=id",
            headers={**HEADERS, "Prefer": "count=exact", "Range": "0-0", "Authorization": f"Bearer {ANON_KEY}"},
            timeout=30,
        )
        cr = r.headers.get("content-range", "")
        progress["total"] = int(cr.split("/")[-1]) if "/" in cr else 0
        log(f"[assets] Total: {progress['total']:,}")
    
    offset = progress["last_offset"]
    select = "id,slug,title,description,keywords,resolution,colors,image_320w,image_800w,image_1600w,image_3840w,image_original,media_type,views,forks,premium,featured,created_at,updated_at,created_by,active,private,transparent"
    
    while offset < progress["total"]:
        try:
            end = offset + 499
            r = await client.get(
                f"{SUPA_URL}/rest/v1/assets?select={select}",
                headers={**HEADERS, "Authorization": f"Bearer {ANON_KEY}", "Range": f"{offset}-{end}"},
                timeout=120,
            )
            r.raise_for_status()
            items = r.json()
            if not items:
                break
            
            for item in items:
                iid = item.get("id")
                slug = (item.get("slug") or "no_slug").replace("/", "_")
                fname = f"{iid:08d}_{slug}"
                (out_dir / f"{fname}.json").write_text(
                    json.dumps(item, ensure_ascii=False), encoding="utf-8"
                )
            
            progress["last_offset"] = offset + len(items)
            progress["done_count"] += len(items)
            progress_file.write_text(json.dumps(progress, indent=2))
            
            pct = progress["done_count"] / progress["total"] * 100
            log(f"[assets] {progress['done_count']:,}/{progress['total']:,} ({pct:.1f}%)")
            
            offset += 500
            await asyncio.sleep(0.2)
        except Exception as e:
            log(f"[assets] Error at offset {offset}: {e}")
            await asyncio.sleep(3)
    
    log(f"[assets] ✓ Done: {progress['done_count']:,}")

# === SKILLS scraping ===
async def scrape_skills(client):
    """Scrape all 118 skills (requires auth)."""
    out_dir = LIBRARY_DIR / "skills"
    out_dir.mkdir(exist_ok=True)
    
    session = json.loads(SESSION_FILE.read_text())
    access_token = session["access_token"]
    
    log("[skills] Fetching all skills...")
    r = await client.get(
        f"{SUPA_URL}/rest/v1/skills?select=*",
        headers={**HEADERS, "Authorization": f"Bearer {access_token}"},
        timeout=60,
    )
    r.raise_for_status()
    items = r.json()
    log(f"[skills] Got {len(items)} skills")
    
    for item in items:
        iid = item.get("id")
        title = (item.get("title") or "untitled").lower().replace(" ", "-")[:60]
        # Clean for filename
        safe_title = "".join(c if c.isalnum() or c in "-_" else "_" for c in title)
        fname = f"{safe_title}_{str(iid)[:8]}"
        (out_dir / f"{fname}.json").write_text(
            json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    
    log(f"[skills] ✓ Done: {len(items)} saved to {out_dir}")

# === LEARN pages scraping ===
LEARN_PAGES = [
    "introduction",
    "tips-for-prompting",
    "how-to-prompt",
    "how-to-design",
    "seo-settings",
    "faq",
    "custom-domain",
    "video-tutorials",
    "documentation",
]

async def scrape_learn(client):
    """Scrape LEARN HTML pages from aura.build."""
    out_dir = LIBRARY_DIR / "learn"
    out_dir.mkdir(exist_ok=True)
    raw_dir = out_dir / "_raw"
    raw_dir.mkdir(exist_ok=True)
    
    log(f"[learn] Scraping {len(LEARN_PAGES)} pages...")
    
    for page in LEARN_PAGES:
        url = f"https://www.aura.build/learn/{page}"
        try:
            r = await client.get(url, timeout=30, follow_redirects=True)
            if r.status_code != 200:
                log(f"[learn] {page}: HTTP {r.status_code}")
                continue
            html = r.text
            (raw_dir / f"{page}.html").write_text(html, encoding="utf-8")
            log(f"[learn] {page}: {len(html):,} chars saved")
        except Exception as e:
            log(f"[learn] {page}: ERROR {e}")
    
    log(f"[learn] ✓ Raw HTML saved to {raw_dir}")

async def main():
    log("=" * 60)
    log("Scraping ASSETS, SKILLS, LEARN")
    log("=" * 60)
    
    async with httpx.AsyncClient(http2=True, timeout=120) as client:
        await asyncio.gather(
            scrape_assets(client),
            scrape_skills(client),
            scrape_learn(client),
        )
    
    log("=" * 60)
    log("✓ All scraping complete!")
    log("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
