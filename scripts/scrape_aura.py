#!/usr/bin/env python3
"""
Aura.build Scraper - Phase 1
============================
Fetch ALL components (2,829) + shared_code/templates (21,435) metadata + HTML.
No authentication required (Supabase anon key only, embedded in aura.build's frontend).

Output: /home/z/my-project/download/aura_library/
  components/      - 2,829 files: {id}_{slug}.json + .html
  templates/       - 21,435 files: {id}_{slug}.json + .html
  _meta/progress.json - resumable progress
  _meta/scraper.log   - log file

Resumable: re-run anytime, picks up from last saved offset.
"""
import httpx
import json
import time
import sys
import os
from pathlib import Path
from datetime import datetime

# === Config ===
SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

DOWNLOAD_DIR = Path("/home/z/my-project/download/aura_library")
META_DIR = DOWNLOAD_DIR / "_meta"
PROGRESS_FILE = META_DIR / "progress.json"
LOG_FILE = META_DIR / "scraper.log"

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

TABLES_CONFIG = {
    "components": {
        "select": "id,slug,title,description,code,tags,image_url,views,forks,premium,private,background,created_at,updated_at,featured,credit_name,credit_url,created_by",
        "subdir": "components",
        "progress_key": "components",
    },
    "shared_code": {
        "select": "id,slug,title,description,code,tags,image_url,views,forks,premium,private,share_source_code,language,created_at,username,category,long_description,featured",
        "subdir": "templates",
        "progress_key": "templates",
    },
}

# === Logging ===
def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass

# === Setup ===
def setup_dirs():
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    META_DIR.mkdir(exist_ok=True)
    for cfg in TABLES_CONFIG.values():
        (DOWNLOAD_DIR / cfg["subdir"]).mkdir(exist_ok=True)

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {
        "components": {"last_offset": 0, "total": None, "done_count": 0},
        "templates": {"last_offset": 0, "total": None, "done_count": 0},
    }

def save_progress(progress):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

# === Scraping primitives ===
def get_total(client, table):
    """Get total row count via HEAD request."""
    r = client.head(
        f"{SUPA_URL}/rest/v1/{table}?select=id",
        headers={**HEADERS, "Prefer": "count=exact", "Range": "0-0"},
        timeout=30,
    )
    cr = r.headers.get("content-range", "")
    if "/" in cr:
        return int(cr.split("/")[-1])
    return None

def fetch_page(client, table, offset, limit=500):
    """Fetch one page of items via PostgREST Range header.
    Smaller page size (500) to reduce memory pressure."""
    end = offset + limit - 1
    headers = {**HEADERS, "Range": f"{offset}-{end}"}
    cfg = TABLES_CONFIG[table]
    url = f"{SUPA_URL}/rest/v1/{table}?select={cfg['select']}"
    r = client.get(url, headers=headers, timeout=120)
    r.raise_for_status()
    return r.json()

def sanitize_slug(slug):
    """Make a safe filename from slug."""
    if not slug:
        return "no_slug"
    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in str(slug))
    return safe[:80]

def save_item(table, item):
    """Save one item as JSON + HTML."""
    cfg = TABLES_CONFIG[table]
    item_id = item.get("id")
    slug = sanitize_slug(item.get("slug"))
    fname = f"{item_id:06d}_{slug}"
    
    item_dir = DOWNLOAD_DIR / cfg["subdir"]
    
    # Save JSON (full metadata + code)
    json_path = item_dir / f"{fname}.json"
    json_path.write_text(json.dumps(item, ensure_ascii=False), encoding="utf-8")
    
    # Save HTML separately (easier for serving / iframe src)
    if item.get("code"):
        html_path = item_dir / f"{fname}.html"
        try:
            html_path.write_text(item["code"], encoding="utf-8")
        except Exception as e:
            log(f"  ! Failed to save HTML for {fname}: {e}")

def scrape_table(client, table, progress):
    """Scrape one table with resume + retry."""
    cfg = TABLES_CONFIG[table]
    pkey = cfg["progress_key"]
    tbl_progress = progress[pkey]
    
    if tbl_progress["total"] is None:
        total = get_total(client, table)
        tbl_progress["total"] = total
        log(f"[{table}] Total rows: {total}")
        save_progress(progress)
    else:
        total = tbl_progress["total"]
        log(f"[{table}] Resuming. Total: {total}, last offset: {tbl_progress['last_offset']}")
    
    offset = tbl_progress["last_offset"]
    limit = 500
    consecutive_errors = 0
    
    while offset < total:
        attempt = 0
        items = None
        while attempt < 3 and items is None:
            attempt += 1
            try:
                items = fetch_page(client, table, offset, limit)
                consecutive_errors = 0
            except Exception as e:
                log(f"[{table}] Error at offset {offset} (attempt {attempt}): {e}")
                if attempt < 3:
                    time.sleep(2 * attempt)
                else:
                    consecutive_errors += 1
                    if consecutive_errors >= 5:
                        log(f"[{table}] Too many consecutive errors, aborting table.")
                        return
                    time.sleep(5)
        
        if not items:
            log(f"[{table}] No items at offset {offset}, treating as end.")
            break
        
        saved = 0
        for item in items:
            try:
                save_item(table, item)
                saved += 1
            except Exception as e:
                log(f"  ! Save error for item {item.get('id')}: {e}")
        
        tbl_progress["last_offset"] = offset + len(items)
        tbl_progress["done_count"] += saved
        save_progress(progress)
        
        pct = (tbl_progress["done_count"] / total * 100) if total else 0
        log(f"[{table}] offset={offset} saved={saved} total_done={tbl_progress['done_count']}/{total} ({pct:.1f}%)")
        
        offset += limit
        time.sleep(0.3)  # polite delay
    
    log(f"[{table}] ✓ Done. Total: {tbl_progress['done_count']}/{total}")

def main():
    setup_dirs()
    log("=" * 60)
    log("Aura.build Scraper - Phase 1 starting")
    log("=" * 60)
    
    progress = load_progress()
    
    with httpx.Client(http2=True, timeout=180, follow_redirects=True) as client:
        for table in TABLES_CONFIG:
            scrape_table(client, table, progress)
    
    log("=" * 60)
    log("✓ Phase 1 complete!")
    
    # Print summary
    components_count = len(list((DOWNLOAD_DIR / "components").glob("*.json")))
    templates_count = len(list((DOWNLOAD_DIR / "templates").glob("*.json")))
    log(f"Components: {components_count} files")
    log(f"Templates:  {templates_count} files")
    log(f"Total:      {components_count + templates_count} files")
    log("=" * 60)

if __name__ == "__main__":
    main()
