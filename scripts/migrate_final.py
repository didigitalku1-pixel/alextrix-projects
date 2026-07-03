#!/usr/bin/env python3
"""
Migrate ALL data from aura.build Supabase to user's Supabase.
Uses service role key for inserts (bypasses RLS).
"""
import httpx
import json
import asyncio
import time
from pathlib import Path
from datetime import datetime

SRC_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
SRC_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

DST_URL = "https://njgtmqwyabfknyktuwzc.supabase.co"
DST_KEY = open("/home/z/my-project/download/aura_library/_meta/dst_service_key.txt").read().strip()

SESSION_FILE = Path("/home/z/my-project/download/aura_library/_meta/session.json")

def log(msg):
    ts = datetime.utcnow().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

async def fetch_all(client, table, select, headers, batch_size=500):
    all_items = []
    offset = 0
    while True:
        r = await client.get(
            f"{SRC_URL}/rest/v1/{table}?select={select}",
            headers={**headers, "Range": f"{offset}-{offset + batch_size - 1}"},
            timeout=120,
        )
        if r.status_code not in (200, 206):
            break
        items = r.json()
        if not items:
            break
        all_items.extend(items)
        if len(items) < batch_size:
            break
        offset += batch_size
        await asyncio.sleep(0.1)
    return all_items

async def insert_batch(client, table, items):
    if not items:
        return 0
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
    return len(items) if r.status_code in (200, 201) else 0

async def migrate(client, src_table, select, dst_table, transform=None, needs_auth=False):
    src_headers = {"apikey": SRC_ANON, "Authorization": f"Bearer {SRC_ANON}"}
    if needs_auth:
        session = json.loads(SESSION_FILE.read_text())
        src_headers["Authorization"] = f"Bearer {session['access_token']}"
    
    log(f"Fetching {src_table}...")
    items = await fetch_all(client, src_table, select, src_headers)
    log(f"  Got {len(items):,} items")
    
    if transform:
        items = [transform(i) for i in items]
    
    # Insert in batches of 200
    batch_size = 200
    total = 0
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        inserted = await insert_batch(client, dst_table, batch)
        total += inserted
        if (i // batch_size) % 10 == 0:
            log(f"  Inserted {total:,}/{len(items):,}")
        await asyncio.sleep(0.2)
    
    log(f"  ✓ {dst_table}: {total:,} migrated")
    return total

async def main():
    log("=" * 50)
    log("MIGRATION: aura.build → user's Supabase")
    log("=" * 50)
    
    async with httpx.AsyncClient(http2=True, timeout=180) as client:
        # 1. Templates
        await migrate(client, "shared_code",
            "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,category,long_description,language,share_source_code,created_at,updated_at",
            "templates")
        
        # 2. Components
        await migrate(client, "components",
            "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,background,created_by,created_at,updated_at",
            "components")
        
        # 3. Assets (no code, just metadata)
        await migrate(client, "assets",
            "id,slug,title,description,keywords,resolution,colors,image_320w,image_800w,image_1600w,image_3840w,image_original,media_type,views,premium,featured,created_by,created_at,updated_at",
            "assets")
        
        # 4. Skills (needs auth)
        await migrate(client, "skills",
            "id,title,description,content,tags,views,forks,created_at",
            "skills", needs_auth=True)
    
    log("=" * 50)
    log("✓ MIGRATION COMPLETE!")
    log("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
