#!/usr/bin/env python3
"""
Migrate data from aura.build Supabase to user's own Supabase.
Creates tables + copies all 54,998 items.

SECURITY: Service-role key MUST be passed via env var SUPABASE_SERVICE_ROLE_KEY.
Never hardcode service-role keys in source code.
"""
import httpx
import json
import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime

# === Source: aura.build Supabase (read-only, public data) ===
SRC_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
SRC_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

# === Destination: user's Supabase ===
DST_URL = os.environ.get("USER_SUPABASE_URL", "https://njgtmqwyabfknyktuwzc.supabase.co")
DST_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # MUST be set via env var

# === Library dir (env var override, not hardcoded) ===
LIBRARY_DIR = Path(os.environ.get("AURA_LIBRARY_DIR", os.environ.get("AURA_LIBRARY_DIR", "/home/z/my-project/download/aura_library")))
SESSION_FILE = LIBRARY_DIR / "_meta" / "session.json"


def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def ensure_dst_key():
    """Fail early if service-role key is not set."""
    if not DST_KEY:
        print(
            "FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.\n"
            "Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n"
            "Get the key from: Supabase Dashboard > Settings > API > service_role",
            file=sys.stderr,
        )
        sys.exit(1)


async def create_tables(client):
    """
    Tables are created via the SQL schema file (download/user_supabase_schema.sql).
    Run that SQL in Supabase SQL Editor before running this script.
    """
    log("Tables should already exist (run download/user_supabase_schema.sql in SQL Editor first)")
    log("Skipping automatic table creation — use the schema SQL file.")


async def fetch_all(client, table, select, headers, batch_size=1000):
    """Fetch all rows from a table in batches."""
    all_items = []
    offset = 0
    while True:
        r = await client.get(
            f"{SRC_URL}/rest/v1/{table}?select={select}",
            headers={**headers, "Range": f"{offset}-{offset + batch_size - 1}"},
            timeout=120,
        )
        if r.status_code not in (200, 206):
            log(f"  WARN: fetch {table} offset {offset} got HTTP {r.status_code}")
            break
        items = r.json()
        if not items:
            break
        all_items.extend(items)
        log(f"  Fetched {len(all_items):,} from {table}...")
        if len(items) < batch_size:
            break
        offset += batch_size
        await asyncio.sleep(0.2)
    return all_items


async def insert_batch(client, table, items):
    """Insert batch of items into user's Supabase."""
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
    if r.status_code not in (200, 201):
        log(f"  WARN: insert {table} got HTTP {r.status_code}: {r.text[:200]}")
    return len(items) if r.status_code in (200, 201) else 0


async def migrate_table(client, table, select, dst_table, transform=None):
    """Migrate a table from source to destination."""
    src_headers = {"apikey": SRC_ANON, "Authorization": f"Bearer {SRC_ANON}"}

    if table == "skills":
        if not SESSION_FILE.exists():
            log(f"  SKIP: skills require auth, but {SESSION_FILE} not found")
            return 0
        session = json.loads(SESSION_FILE.read_text())
        src_headers["Authorization"] = f"Bearer {session['access_token']}"

    log(f"Migrating {table} → {dst_table}...")
    items = await fetch_all(client, table, select, src_headers)
    log(f"  Fetched {len(items):,} items from source")

    if transform:
        items = [transform(item) for item in items]

    batch_size = 500
    total_inserted = 0
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        inserted = await insert_batch(client, dst_table, batch)
        total_inserted += inserted
        log(f"  Inserted {total_inserted:,}/{len(items):,} into {dst_table}")
        await asyncio.sleep(0.3)

    log(f"OK {dst_table}: {total_inserted:,} items migrated")
    return total_inserted


async def main():
    ensure_dst_key()
    log("=" * 60)
    log("MIGRATION: aura.build -> user's Supabase")
    log(f"Source: {SRC_URL}")
    log(f"Destination: {DST_URL}")
    log("=" * 60)

    async with httpx.AsyncClient(http2=True, timeout=180) as client:
        await create_tables(client)

        await migrate_table(
            client, "shared_code",
            "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,category,long_description,language,share_source_code,created_at,updated_at",
            "templates"
        )
        await migrate_table(
            client, "components",
            "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,background,created_by,created_at,updated_at",
            "components"
        )
        await migrate_table(
            client, "assets",
            "id,slug,title,description,keywords,resolution,colors,image_320w,image_800w,image_1600w,image_3840w,image_original,media_type,views,premium,featured,created_by,created_at,updated_at",
            "assets"
        )
        await migrate_table(
            client, "skills",
            "id,title,description,content,tags,views,forks,created_at",
            "skills"
        )

    log("=" * 60)
    log("Migration complete!")
    log("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
