#!/usr/bin/env python3
"""
One-off migration utility: migrate data from Aura Supabase + manifest files
to the new user Supabase project (kvkwiekfdlaeeabkwmhp).

Source:
  - Templates/Components/Assets: Aura Supabase (read-only public)
  - Skills: skills-manifest.json (already has content)
  - Design Systems: design-systems-manifest.json

Destination: User's new Supabase project via REST API (service_role key)

Usage:
  export USER_SUPABASE_URL=https://kvkwiekfdlaeeabkwmhp.supabase.co
  export SUPABASE_SERVICE_ROLE_KEY=<service_role JWT>
  python3 scripts/migrate_to_new_supabase.py [--limit-templates 5000] [--skip-assets]
"""
import httpx
import json
import os
import sys
import time
import asyncio
import argparse
from pathlib import Path
from datetime import datetime

# === Source: Aura Supabase (read-only public) ===
SRC_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
SRC_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

# === Destination: User's new Supabase ===
DST_URL = os.environ.get("USER_SUPABASE_URL")
DST_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# === Library dir ===
LIBRARY_DIR = Path(os.environ.get("AURA_LIBRARY_DIR", "/home/z/my-project/audit/web-library/download/aura_library"))


def log(msg):
    ts = datetime.utcnow().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def ensure_keys():
    if not DST_URL or not DST_KEY:
        print("FATAL: Set USER_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars", file=sys.stderr)
        sys.exit(1)
    log(f"Destination: {DST_URL}")


# === Fetch all rows from Aura in batches ===
async def fetch_all(client, table, select, batch_size=1000, limit=None):
    headers = {"apikey": SRC_ANON, "Authorization": f"Bearer {SRC_ANON}"}
    all_items = []
    offset = 0
    while True:
        if limit and len(all_items) >= limit:
            break
        current_batch = min(batch_size, limit - len(all_items)) if limit else batch_size
        end = offset + current_batch - 1
        try:
            r = await client.get(
                f"{SRC_URL}/rest/v1/{table}?select={select}",
                headers={**headers, "Range": f"{offset}-{end}"},
                timeout=120,
            )
            if r.status_code not in (200, 206):
                log(f"  WARN: {table} offset {offset} got HTTP {r.status_code}")
                break
            items = r.json()
            if not items:
                break
            all_items.extend(items)
            log(f"  Fetched {len(all_items):,} from {table}...")
            if len(items) < current_batch:
                break
            offset += current_batch
            await asyncio.sleep(0.2)
        except Exception as e:
            log(f"  ERROR fetching {table}: {e}")
            break
    return all_items


# === Batch insert to destination ===
async def insert_batch(client, table, items):
    if not items:
        return 0
    try:
        r = await client.post(
            f"{DST_URL}/rest/v1/{table}",
            headers={
                "apikey": DST_KEY,
                "Authorization": f"Bearer {DST_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal,resolution=ignore-duplicates",
            },
            json=items,
            timeout=120,
        )
        if r.status_code not in (200, 201):
            log(f"  WARN: insert {table} HTTP {r.status_code}: {r.text[:200]}")
            return 0
        return len(items)
    except Exception as e:
        log(f"  ERROR inserting {table}: {e}")
        return 0


# === Stream migrate: fetch batch, insert batch, repeat (low memory) ===
async def stream_migrate_aura(client, src_table, dst_table, select, limit=None, transform=None, fetch_batch=500, insert_batch_size=50):
    log(f"=== Stream migrating {src_table} -> {dst_table} ===")
    headers = {"apikey": SRC_ANON, "Authorization": f"Bearer {SRC_ANON}"}
    
    total_fetched = 0
    total_inserted = 0
    offset = 0
    
    while True:
        if limit and total_fetched >= limit:
            break
        current_fetch = min(fetch_batch, limit - total_fetched) if limit else fetch_batch
        end = offset + current_fetch - 1
        
        try:
            r = await client.get(
                f"{SRC_URL}/rest/v1/{src_table}?select={select}",
                headers={**headers, "Range": f"{offset}-{end}"},
                timeout=120,
            )
            if r.status_code not in (200, 206):
                log(f"  Fetch HTTP {r.status_code} at offset {offset}, stopping")
                break
            items = r.json()
            if not items:
                break
            
            total_fetched += len(items)
            
            # Transform
            if transform:
                items = [transform(item) for item in items]
            
            # Insert in smaller batches
            for i in range(0, len(items), insert_batch_size):
                batch = items[i:i + insert_batch_size]
                inserted = await insert_batch(client, dst_table, batch)
                total_inserted += inserted
            
            log(f"  Fetched {total_fetched:,}, Inserted {total_inserted:,}")
            
            if len(items) < current_fetch:
                break
            offset += current_fetch
            await asyncio.sleep(0.2)
        except Exception as e:
            log(f"  ERROR at offset {offset}: {e}")
            break
    
    log(f"  DONE: fetched {total_fetched:,}, inserted {total_inserted:,} into {dst_table}")
    return total_inserted


# === Migrate table from Aura (legacy: fetch all then insert) ===
async def migrate_from_aura(client, src_table, dst_table, select, limit=None, transform=None, batch_size=500):
    log(f"=== Migrating {src_table} -> {dst_table} ===")
    items = await fetch_all(client, src_table, select, limit=limit)
    log(f"  Fetched {len(items):,} items")

    if transform:
        items = [transform(item) for item in items]

    total = 0
    failed_batches = 0
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        inserted = await insert_batch(client, dst_table, batch)
        if inserted == 0 and len(batch) > 1:
            # Batch failed - try smaller sub-batches or individual inserts
            log(f"  Batch {i//batch_size + 1} failed, trying sub-batches of 10...")
            for j in range(0, len(batch), 10):
                sub_batch = batch[j:j+10]
                sub_inserted = await insert_batch(client, dst_table, sub_batch)
                total += sub_inserted
            if total % 500 < batch_size:
                log(f"  Progress: {total:,}/{len(items):,}")
        else:
            total += inserted
            if (i // batch_size) % 5 == 0:
                log(f"  Inserted {total:,}/{len(items):,}")
        await asyncio.sleep(0.3)

    log(f"  DONE: {total:,} items in {dst_table}")
    return total


# === Migrate from manifest file ===
async def migrate_from_manifest(client, manifest_path, dst_table, transform, dedupe_by=None):
    log(f"=== Migrating from {manifest_path.name} -> {dst_table} ===")
    if not manifest_path.exists():
        log(f"  SKIP: {manifest_path} not found")
        return 0

    raw = manifest_path.read_text()
    manifest = json.loads(raw)
    items = manifest.get("items", [])
    log(f"  Loaded {len(items):,} items from manifest")

    # Dedupe by slug/id if requested (keep first occurrence)
    if dedupe_by:
        seen = set()
        unique_items = []
        for item in items:
            key = item.get(dedupe_by)
            if key and key not in seen:
                seen.add(key)
                unique_items.append(item)
            elif not key:
                unique_items.append(item)  # keep items without slug/id
        log(f"  After dedupe by {dedupe_by}: {len(unique_items):,} items (removed {len(items) - len(unique_items)})")
        items = unique_items

    items = [transform(item) for item in items if transform(item)]

    batch_size = 100
    total = 0
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        inserted = await insert_batch(client, dst_table, batch)
        total += inserted
        log(f"  Inserted {total:,}/{len(items):,}")
        await asyncio.sleep(0.2)

    log(f"  DONE: {total:,} items in {dst_table}")
    return total


# === Transform functions ===
def transform_template(item):
    """Aura shared_code -> templates table"""
    return {
        "id": item.get("id"),
        "slug": item.get("slug"),
        "title": item.get("title"),
        "description": item.get("description", ""),
        "code": item.get("code", ""),
        "tags": item.get("tags", []),
        "image_url": item.get("image_url"),
        "views": item.get("views", 0),
        "forks": item.get("forks", 0),
        "premium": item.get("premium", False),
        "private": item.get("private", False),
        "featured": item.get("featured", False),
        "username": item.get("username"),
        "category": item.get("category"),
        "long_description": item.get("long_description"),
        "language": item.get("language"),
        "share_source_code": item.get("share_source_code", True),
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
    }


def transform_component(item):
    """Aura components -> components table"""
    return {
        "id": item.get("id"),
        "slug": item.get("slug"),
        "title": item.get("title"),
        "description": item.get("description", ""),
        "code": item.get("code", ""),
        "tags": item.get("tags", []),
        "image_url": item.get("image_url"),
        "views": item.get("views", 0),
        "forks": item.get("forks", 0),
        "premium": item.get("premium", False),
        "private": item.get("private", False),
        "featured": item.get("featured", False),
        "background": item.get("background"),
        "created_by": item.get("created_by"),
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
    }


def transform_asset(item):
    """Aura assets -> assets table"""
    return {
        "id": item.get("id"),
        "slug": item.get("slug"),
        "title": item.get("title"),
        "description": item.get("description", ""),
        "keywords": item.get("keywords", []),
        "resolution": item.get("resolution"),
        "colors": item.get("colors", []),
        "image_320w": item.get("image_320w"),
        "image_800w": item.get("image_800w"),
        "image_1600w": item.get("image_1600w"),
        "image_3840w": item.get("image_3840w"),
        "image_original": item.get("image_original"),
        "media_type": item.get("media_type", "image"),
        "views": item.get("views", 0),
        "forks": item.get("forks", 0),
        "premium": item.get("premium", False),
        "private": item.get("private", False),
        "featured": item.get("featured", False),
        "created_by": item.get("created_by"),
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
    }


def transform_skill(item):
    """skills-manifest.json -> skills table"""
    return {
        "id": item.get("id"),
        "slug": item.get("slug"),
        "title": item.get("title"),
        "description": item.get("description") or item.get("desc", ""),
        "content": item.get("content", ""),
        "tags": item.get("tags", []),
        "views": item.get("views", 0),
        "forks": item.get("forks", 0),
        "created_at": item.get("created_at"),
    }


def transform_design_system(item):
    """design-systems-manifest.json -> design_systems table"""
    return {
        "id": item.get("id"),
        "slug": item.get("slug"),
        "title": item.get("title"),
        "description": item.get("description") or item.get("desc", ""),
        "content": item.get("content", ""),
        "preview_html": item.get("preview_html", ""),
        "thumbnail_url": item.get("thumbnail") or item.get("image"),
        "source_name": item.get("source_name", ""),
        "tags": item.get("tags", []),
        "views": item.get("views", 0),
        "forks": item.get("forks", 0),
        "featured": item.get("featured", False),
        "created_by": item.get("created_by"),
        "created_at": item.get("created_at"),
    }


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit-templates", type=int, default=None,
                        help="Limit templates to migrate (default: all)")
    parser.add_argument("--limit-components", type=int, default=None,
                        help="Limit components to migrate (default: all)")
    parser.add_argument("--limit-assets", type=int, default=None,
                        help="Limit assets to migrate (default: all)")
    parser.add_argument("--skip-templates", action="store_true")
    parser.add_argument("--skip-components", action="store_true")
    parser.add_argument("--skip-assets", action="store_true", default=True,
                        help="Skip assets by default (30K records, save DB space)")
    parser.add_argument("--skip-skills", action="store_true")
    parser.add_argument("--skip-design-systems", action="store_true")
    args = parser.parse_args()

    ensure_keys()

    log("=" * 60)
    log("MIGRATION: Aura + Manifests -> New Supabase")
    log(f"Source: {SRC_URL}")
    log(f"Destination: {DST_URL}")
    log("=" * 60)

    async with httpx.AsyncClient(http2=True, timeout=180) as client:
        # Phase 1: Skills from manifest (fast, 118 items, dedupe by slug)
        if not args.skip_skills:
            await migrate_from_manifest(
                client,
                LIBRARY_DIR / "skills-manifest.json",
                "skills",
                transform_skill,
                dedupe_by="slug",
            )

        # Phase 2: Design Systems from manifest (fast, 725 items, dedupe by id)
        if not args.skip_design_systems:
            await migrate_from_manifest(
                client,
                LIBRARY_DIR / "design-systems-manifest.json",
                "design_systems",
                transform_design_system,
                dedupe_by="id",
            )

        # Phase 3: Components from Aura (medium, ~2,829 items)
        if not args.skip_components:
            await stream_migrate_aura(
                client,
                "components",
                "components",
                "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,background,created_by,created_at,updated_at",
                limit=args.limit_components,
                transform=transform_component,
                fetch_batch=500,
                insert_batch_size=50,
            )

        # Phase 4: Templates from Aura (slow, ~21,560 items or limited)
        # Use streaming to avoid memory issues (each template has 8-17KB code)
        if not args.skip_templates:
            await stream_migrate_aura(
                client,
                "shared_code",
                "templates",
                "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,category,long_description,language,share_source_code,created_at,updated_at",
                limit=args.limit_templates,
                transform=transform_template,
                fetch_batch=500,
                insert_batch_size=25,  # smaller insert batches for large code
            )

        # Phase 5: Assets from Aura (slow, ~30,673 items - skipped by default)
        if not args.skip_assets:
            await stream_migrate_aura(
                client,
                "assets",
                "assets",
                "id,slug,title,description,keywords,resolution,colors,image_320w,image_800w,image_1600w,image_3840w,image_original,media_type,views,forks,premium,private,featured,created_by,created_at,updated_at",
                limit=args.limit_assets,
                transform=transform_asset,
                fetch_batch=1000,
                insert_batch_size=100,
            )

    log("=" * 60)
    log("MIGRATION COMPLETE!")
    log("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
