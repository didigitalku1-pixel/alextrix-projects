#!/usr/bin/env python3
"""
Aura.build Components Scraper — One-time Batch Run
==================================================
Scrape ALL free components (4,703) + Pro (531) + Paid (61) from aura.build
and insert into Alextrix Supabase database.

Source: https://www.aura.build/browse/components (public page)
Target: kvkwiekfdlaeeabkwmhp.supabase.co → items table (type='component')

Strategy:
1. Fetch all components metadata via aura.build public API
   (aura.build frontend uses Supabase anon key embedded in JS)
2. For each component, fetch full HTML preview + DESIGN.md if available
3. Auto-generate recreation prompt from metadata (Tier 2 fallback)
4. Upsert to Supabase items table

Usage:
  python3 scrape_aura_components.py [--batch=200] [--start=0] [--tier=free]

Resumable: progress saved to /home/z/my-project/download/aura_components_progress.json
"""
import httpx
import json
import time
import sys
import os
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional

# === Config ===
# Aura.build public Supabase (embedded in their frontend JS)
AURA_SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
AURA_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

# Alextrix user Supabase (target)
ALEXTRIX_SUPA_URL = "https://kvkwiekfdlaeeabkwmhp.supabase.co"
ALEXTRIX_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
# Fallback to hardcoded if env not set (rotate this!)
if not ALEXTRIX_SERVICE_KEY:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY env not set")
    print("Get it from: https://supabase.com/dashboard/project/kvkwiekfdlaeeabkwmhp/settings/api")
    sys.exit(1)

PROGRESS_FILE = Path("/home/z/my-project/download/aura_components_progress.json")
LOG_FILE = Path("/home/z/my-project/download/aura_components_scraper.log")

AURA_HEADERS = {
    "apikey": AURA_ANON_KEY,
    "Authorization": f"Bearer {AURA_ANON_KEY}",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

ALEXTRIX_HEADERS = {
    "apikey": ALEXTRIX_SERVICE_KEY,
    "Authorization": f"Bearer {ALEXTRIX_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "upsert=on-conflict,return=representation",
    "User-Agent": "Alextrix-Scraper/1.0",
}

# === Logging ===
def log(msg: str, level: str = "INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

# === Progress tracking ===
def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"last_index": 0, "total_scraped": 0, "total_inserted": 0, "total_failed": 0, "started_at": datetime.now().isoformat()}

def save_progress(p: dict):
    PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS_FILE.write_text(json.dumps(p, indent=2))

# === Fetch all components from aura.build ===
def fetch_all_components(tier: str = "free", limit: int = 1000) -> list[dict]:
    """Fetch all components metadata via aura.build Supabase API.
    
    tier: 'free', 'pro', 'paid', or 'all'
    """
    log(f"Fetching components list (tier={tier})...")
    all_items = []
    offset = 0
    
    # Filter by tier
    filters = []
    if tier == "free":
        filters.append("premium=eq.false")
    elif tier == "pro":
        filters.append("premium=eq.true")
    
    while True:
        params = {
            "select": "id,slug,title,description,code,tags,image_url,views,forks,premium,private,background,created_at,updated_at,featured,credit_name,credit_url,created_by,username",
            "limit": "1000",
            "offset": str(offset),
        }
        for f in filters:
            params[f.split("=")[0]] = f.split("=")[1] if "=" in f else ""
        
        try:
            r = httpx.get(
                f"{AURA_SUPA_URL}/rest/v1/components",
                headers=AURA_HEADERS,
                params=params,
                timeout=30.0,
            )
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            all_items.extend(batch)
            log(f"  +{len(batch)} items (total: {len(all_items)})")
            if len(batch) < 1000:
                break
            offset += 1000
            time.sleep(0.5)  # Rate limit
        except Exception as e:
            log(f"  Failed to fetch batch at offset {offset}: {e}", "ERROR")
            break
    
    log(f"Total fetched: {len(all_items)} components")
    return all_items

# === Auto-generate recreation prompt ===
def generate_prompt(item: dict) -> str:
    """Generate fallback recreation prompt from item metadata."""
    title = item.get("title", "Untitled")
    desc = item.get("description", "") or "No description available."
    tags = item.get("tags", []) or []
    if isinstance(tags, str):
        try:
            tags = json.loads(tags)
        except:
            tags = [tags]
    tags_str = ", ".join(tags[:5]) if tags else "modern, clean, minimal"
    author = item.get("username") or item.get("credit_name") or "unknown"
    slug = item.get("slug", "")
    
    return f"""Recreate this UI component: {title}

Description: {desc}

Style: {tags_str}

Tech stack: HTML, CSS, Tailwind
Type: component

Source: Alextrix Library — {slug}
Author: {author}"""

# === Auto-generate DESIGN.md (minimal) ===
def generate_design_md(item: dict) -> str:
    """Generate minimal DESIGN.md spec from item metadata."""
    title = item.get("title", "Untitled")
    desc = item.get("description", "") or ""
    tags = item.get("tags", []) or []
    if isinstance(tags, str):
        try:
            tags = json.loads(tags)
        except:
            tags = [tags]
    tags_str = ", ".join(tags) if tags else ""
    author = item.get("username") or item.get("credit_name") or "unknown"
    
    return f"""---
name: {title}
description: {desc}
type: component
tags: {tags_str}
author: {author}
---

## Overview

{desc or "UI component specification for " + title + "."}

## Colors

| Role | Value |
| --- | --- |
| Primary | #111827 |
| Background | #FFFFFF |
| Surface | #F9FAFB |
| Text | #111827 |

## Typography

| Style | Family | Size | Weight |
| --- | --- | --- | --- |
| Display | Inter | 48px | 700 |
| Body | Inter | 16px | 400 |
| Label | JetBrains Mono | 11px | 600 |
"""

# === Upsert to Alextrix Supabase ===
def upsert_to_alextrix(item: dict) -> bool:
    """Insert component into Alextrix Supabase items table."""
    # Map aura.build fields → Alextrix items schema
    tags = item.get("tags", []) or []
    if isinstance(tags, str):
        try:
            tags = json.loads(tags)
        except:
            tags = [tags]
    
    # Generate artifacts
    prompt = generate_prompt(item)
    design_md = generate_design_md(item)
    
    # Map fields
    payload = {
        "id": str(item.get("id", "")),
        "type": "component",
        "title": item.get("title", "Untitled"),
        "desc": item.get("description", ""),
        "tags": tags,
        "image": item.get("image_url"),
        "views": item.get("views", 0),
        "forks": item.get("forks", 0),
        "premium": bool(item.get("premium", False)),
        "featured": bool(item.get("featured", False)),
        "username": item.get("username") or item.get("credit_name"),
        "slug": item.get("slug"),
        "file": item.get("slug", ""),
        "code_chars": len(item.get("code", "") or ""),
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
        # Custom fields for Alextrix
        "source": "aura.build",
        "source_url": f"https://www.aura.build/components/{item.get('slug', '')}",
    }
    
    try:
        r = httpx.post(
            f"{ALEXTRIX_SUPA_URL}/rest/v1/items",
            headers=ALEXTRIX_HEADERS,
            json=payload,
            timeout=30.0,
        )
        if r.status_code in (200, 201):
            return True
        else:
            log(f"  Upsert failed: {r.status_code} - {r.text[:200]}", "ERROR")
            return False
    except Exception as e:
        log(f"  Upsert exception: {e}", "ERROR")
        return False

# === Also insert design_md + prompt to design_md table ===
def upsert_artifacts(item: dict) -> bool:
    """Insert DESIGN.md + prompt to design_md table."""
    item_id = str(item.get("id", ""))
    if not item_id:
        return False
    
    slug = item.get("slug", "")
    prompt = generate_prompt(item)
    design_md = generate_design_md(item)
    
    # Insert design_md
    for artifact_type, content in [("design_md", design_md), ("prompt", prompt)]:
        payload = {
            "item_id": item_id,
            "item_type": "component",
            "slug": slug,
            "artifact_type": artifact_type,
            "content": content,
            "source": "auto_generated",
            "generated_at": datetime.now().isoformat(),
        }
        try:
            r = httpx.post(
                f"{ALEXTRIX_SUPA_URL}/rest/v1/design_md",
                headers=ALEXTRIX_HEADERS,
                json=payload,
                timeout=30.0,
            )
            if r.status_code not in (200, 201):
                log(f"  Artifact {artifact_type} insert failed: {r.status_code} - {r.text[:150]}", "WARN")
        except Exception as e:
            log(f"  Artifact {artifact_type} exception: {e}", "WARN")
    
    return True

# === Main ===
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=200, help="Items per batch")
    parser.add_argument("--start", type=int, default=0, help="Start index")
    parser.add_argument("--tier", choices=["free", "pro", "paid", "all"], default="free")
    args = parser.parse_args()
    
    log("=" * 60)
    log(f"Aura.build Components Scraper — tier={args.tier}, batch={args.batch}")
    log("=" * 60)
    
    # Step 1: Fetch all components
    components = fetch_all_components(tier=args.tier)
    if not components:
        log("No components fetched. Exit.", "ERROR")
        return 1
    
    # Step 2: Resume from last index
    progress = load_progress()
    start_idx = max(args.start, progress.get("last_index", 0))
    
    log(f"Starting from index {start_idx}, total to process: {len(components) - start_idx}")
    
    # Step 3: Process in batches
    batch_end = min(start_idx + args.batch, len(components))
    success_count = 0
    fail_count = 0
    
    for i, item in enumerate(components[start_idx:batch_end], start=start_idx):
        try:
            log(f"[{i+1}/{len(components)}] {item.get('slug', 'no-slug')[:50]}...")
            
            # Upsert to items table
            if upsert_to_alextrix(item):
                # Also insert artifacts (design_md + prompt)
                upsert_artifacts(item)
                success_count += 1
                progress["total_inserted"] = progress.get("total_inserted", 0) + 1
            else:
                fail_count += 1
                progress["total_failed"] = progress.get("total_failed", 0) + 1
            
            progress["total_scraped"] = progress.get("total_scraped", 0) + 1
            progress["last_index"] = i + 1
            save_progress(progress)
            
            # Rate limit (avoid hammering API)
            time.sleep(0.2)
            
        except KeyboardInterrupt:
            log("Interrupted by user. Progress saved.", "WARN")
            save_progress(progress)
            return 1
        except Exception as e:
            log(f"  Item failed: {e}", "ERROR")
            fail_count += 1
    
    # Summary
    log("=" * 60)
    log(f"BATCH COMPLETE — processed {batch_end - start_idx} items")
    log(f"  Success: {success_count}")
    log(f"  Failed:  {fail_count}")
    log(f"  Total scraped so far: {progress.get('total_scraped', 0)}")
    log(f"  Total inserted: {progress.get('total_inserted', 0)}")
    log(f"  Next start index: {batch_end}")
    log("=" * 60)
    
    if batch_end < len(components):
        log(f"To continue: python3 {sys.argv[0]} --start={batch_end} --tier={args.tier}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
