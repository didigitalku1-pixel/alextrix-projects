#!/usr/bin/env python3
"""
Final Migration: aura.build → User's Supabase
Fetches ALL data from aura.build (anon key, public) and UPSERTs to user's Supabase.

Tables migrated:
  - shared_code → templates (21K+)
  - components → components (2.8K)
  - assets → assets (30K+)

Also updates views, forks, featured, premium for existing rows.

Usage:
    python3 scripts/migrate_final_v2.py --service-key <JWT>
    python3 scripts/migrate_final_v2.py --service-key <JWT> --table templates --limit 100
"""
import argparse
import json
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime

SRC_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
SRC_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

DST_URL = "https://njgtmqwyabfknyktuwzc.supabase.co"

TABLE_CONFIG = {
    "templates": {
        "src_table": "shared_code",
        "dst_table": "templates",
        "select": "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,username,category,created_at",
    },
    "components": {
        "src_table": "components",
        "dst_table": "components",
        "select": "id,slug,title,description,code,tags,image_url,views,forks,premium,featured,background,created_by,created_at",
    },
    "assets": {
        "src_table": "assets",
        "dst_table": "assets",
        "select": "id,slug,title,description,keywords,image_320w,image_800w,image_1600w,image_3840w,image_original,resolution,colors,media_type,views,premium,featured,created_by,created_at",
    },
}


def log(msg):
    ts = datetime.utcnow().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def fetch_batch(url, headers, offset, limit):
    """Fetch one batch from source."""
    req = urllib.request.Request(url, headers={**headers, "Range": f"{offset}-{offset + limit - 1}"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))


def upsert_batch(url, key, table, items):
    """UPSERT batch to destination."""
    if not items:
        return 0
    data = json.dumps(items).encode("utf-8")
    req = urllib.request.Request(
        f"{url}/rest/v1/{table}",
        data=data,
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal,resolution=merge-duplicates",
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return len(items)
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:300]
        log(f"  ❌ UPSERT failed: {e.code} {body}")
        return 0


def migrate_table(table_name, service_key, limit=None, batch_size=200):
    """Migrate one table."""
    config = TABLE_CONFIG[table_name]
    src_table = config["src_table"]
    dst_table = config["dst_table"]
    select = config["select"]
    
    src_headers = {"apikey": SRC_ANON, "Authorization": f"Bearer {SRC_ANON}"}
    
    log(f"📋 Migrating {table_name} ({src_table} → {dst_table})...")
    
    total_fetched = 0
    total_upserted = 0
    offset = 0
    
    while True:
        if limit and total_fetched >= limit:
            break
        
        current_batch = min(batch_size, limit - total_fetched) if limit else batch_size
        
        # Fetch from source
        url = f"{SRC_URL}/rest/v1/{src_table}?select={select}&order=id.asc&limit={current_batch}&offset={offset}"
        try:
            items = fetch_batch(url, src_headers, offset, current_batch)
        except Exception as e:
            log(f"  ❌ Fetch error at offset {offset}: {e}")
            time.sleep(2)
            continue
        
        if not items:
            log(f"  ✅ No more items. Total fetched: {total_fetched}")
            break
        
        # Fix image URLs (replace -all subdomain)
        for item in items:
            for key in ["image_url", "image_320w", "image_800w", "image_1600w", "image_3840w", "image_original"]:
                if item.get(key) and "hoirqrkdgbmvpwutwuwj-all.supabase.co" in item[key]:
                    item[key] = item[key].replace(
                        "hoirqrkdgbmvpwutwuwj-all.supabase.co",
                        "hoirqrkdgbmvpwutwuwj.supabase.co"
                    )
        
        # UPSERT to destination
        upserted = upsert_batch(DST_URL, service_key, dst_table, items)
        total_upserted += upserted
        total_fetched += len(items)
        
        log(f"  offset={offset} fetched={len(items)} upserted={upserted} total={total_fetched}")
        
        if len(items) < current_batch:
            break
        
        offset += current_batch
        time.sleep(0.2)  # Rate limiting
    
    log(f"  ✅ {table_name}: {total_fetched} fetched, {total_upserted} upserted")
    return total_upserted


def main():
    parser = argparse.ArgumentParser(description="Migrate data from aura.build to user's Supabase")
    parser.add_argument("--service-key", required=True, help="Supabase service_role JWT")
    parser.add_argument("--table", choices=["templates", "components", "assets", "all"], default="all")
    parser.add_argument("--limit", type=int, default=None, help="Max items per table (for testing)")
    parser.add_argument("--batch-size", type=int, default=200)
    args = parser.parse_args()
    
    log("=" * 60)
    log("🚀 Final Migration: aura.build → User's Supabase")
    log(f"   Tables: {args.table}")
    log(f"   Limit: {args.limit or 'unlimited'}")
    log(f"   Batch size: {args.batch_size}")
    log("=" * 60)
    
    tables = ["templates", "components", "assets"] if args.table == "all" else [args.table]
    
    grand_total = 0
    for table in tables:
        log("")
        upserted = migrate_table(table, args.service_key, args.limit, args.batch_size)
        grand_total += upserted
    
    log("")
    log("=" * 60)
    log(f"✅ Migration complete! Total upserted: {grand_total}")
    log("=" * 60)


if __name__ == "__main__":
    main()
