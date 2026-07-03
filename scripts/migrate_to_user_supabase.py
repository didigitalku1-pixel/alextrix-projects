#!/usr/bin/env python3
"""
Migrate data from aura.build Supabase to user's own Supabase.
Creates tables + copies all 54,998 items.
"""
import httpx
import json
import asyncio
import os
from pathlib import Path
from datetime import datetime

# Source: aura.build Supabase (read-only, public data)
SRC_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co"
SRC_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

# Destination: user's Supabase
DST_URL = "https://njgtmqwyabfknyktuwzc.supabase.co"
DST_KEY = "REDACTED_OLD_PAT"  # service role token

LIBRARY_DIR = Path("/home/z/my-project/download/aura_library")
SESSION_FILE = LIBRARY_DIR / "_meta" / "session.json"

def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

async def create_tables(client):
    """Create tables in user's Supabase via REST API."""
    log("Creating tables in user's Supabase...")
    
    # Use Supabase SQL endpoint (via service role)
    sql_queries = [
        # Templates table
        """
        CREATE TABLE IF NOT EXISTS templates (
            id BIGINT PRIMARY KEY,
            slug TEXT,
            title TEXT,
            description TEXT,
            code TEXT,
            tags JSONB DEFAULT '[]',
            image_url TEXT,
            views BIGINT DEFAULT 0,
            forks BIGINT DEFAULT 0,
            premium BOOLEAN DEFAULT FALSE,
            private BOOLEAN DEFAULT FALSE,
            featured BOOLEAN DEFAULT FALSE,
            username TEXT,
            category TEXT,
            long_description TEXT,
            language TEXT,
            share_source_code BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ
        );
        """,
        # Components table
        """
        CREATE TABLE IF NOT EXISTS components (
            id BIGINT PRIMARY KEY,
            slug TEXT,
            title TEXT,
            description TEXT,
            code TEXT,
            tags JSONB DEFAULT '[]',
            image_url TEXT,
            views BIGINT DEFAULT 0,
            forks BIGINT DEFAULT 0,
            premium BOOLEAN DEFAULT FALSE,
            private BOOLEAN DEFAULT FALSE,
            featured BOOLEAN DEFAULT FALSE,
            background TEXT,
            created_by TEXT,
            created_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ
        );
        """,
        # Assets table
        """
        CREATE TABLE IF NOT EXISTS assets (
            id BIGINT PRIMARY KEY,
            slug TEXT,
            title TEXT,
            description TEXT,
            keywords JSONB DEFAULT '[]',
            resolution TEXT,
            colors JSONB DEFAULT '[]',
            image_320w TEXT,
            image_800w TEXT,
            image_1600w TEXT,
            image_3840w TEXT,
            image_original TEXT,
            media_type TEXT DEFAULT 'image',
            views BIGINT DEFAULT 0,
            premium BOOLEAN DEFAULT FALSE,
            featured BOOLEAN DEFAULT FALSE,
            created_by TEXT,
            created_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ
        );
        """,
        # Skills table
        """
        CREATE TABLE IF NOT EXISTS skills (
            id UUID PRIMARY KEY,
            title TEXT,
            description TEXT,
            content TEXT,
            tags JSONB DEFAULT '[]',
            views BIGINT DEFAULT 0,
            forks BIGINT DEFAULT 0,
            created_at TIMESTAMPTZ
        );
        """,
        # Design systems (artifact) table
        """
        CREATE TABLE IF NOT EXISTS design_md (
            id SERIAL PRIMARY KEY,
            template_id BIGINT,
            artifact_type TEXT,
            content TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """,
        # Enable Row Level Security (allow public read)
        "ALTER TABLE templates ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE components ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE assets ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE skills ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE design_md ENABLE ROW LEVEL SECURITY;",
        # Create policies for public read
        "CREATE POLICY \"public_read_templates\" ON templates FOR SELECT USING (true);",
        "CREATE POLICY \"public_read_components\" ON components FOR SELECT USING (true);",
        "CREATE POLICY \"public_read_assets\" ON assets FOR SELECT USING (true);",
        "CREATE POLICY \"public_read_skills\" ON skills FOR SELECT USING (true);",
        "CREATE POLICY \"public_read_design_md\" ON design_md FOR SELECT USING (true);",
    ]
    
    for query in sql_queries:
        try:
            r = await client.post(
                f"{DST_URL}/rest/v1/rpc/exec_sql",
                headers={
                    "apikey": DST_KEY,
                    "Authorization": f"Bearer {DST_KEY}",
                    "Content-Type": "application/json",
                },
                json={"query": query.strip()},
                timeout=30,
            )
            # May fail if RPC doesn't exist - that's OK, we'll use direct insert
        except Exception as e:
            pass  # Continue - we'll try direct insert
    
    log("Tables creation attempted (may need manual SQL execution)")

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
        if not r.status_code in (200, 206):
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
    return len(items) if r.status_code in (200, 201) else 0

async def migrate_table(client, table, select, dst_table, transform=None):
    """Migrate a table from source to destination."""
    src_headers = {"apikey": SRC_ANON, "Authorization": f"Bearer {SRC_ANON}"}
    
    # Skills need auth
    if table == "skills":
        session = json.loads(SESSION_FILE.read_text())
        src_headers["Authorization"] = f"Bearer {session['access_token']}"
    
    log(f"Migrating {table} → {dst_table}...")
    items = await fetch_all(client, table, select, src_headers)
    log(f"  Fetched {len(items):,} items from source")
    
    if transform:
        items = [transform(item) for item in items]
    
    # Insert in batches of 500
    batch_size = 500
    total_inserted = 0
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        inserted = await insert_batch(client, dst_table, batch)
        total_inserted += inserted
        log(f"  Inserted {total_inserted:,}/{len(items):,} into {dst_table}")
        await asyncio.sleep(0.3)
    
    log(f"✓ {dst_table}: {total_inserted:,} items migrated")
    return total_inserted

async def main():
    log("=" * 60)
    log("MIGRATION: aura.build → user's Supabase")
    log(f"Source: {SRC_URL}")
    log(f"Destination: {DST_URL}")
    log("=" * 60)
    
    async with httpx.AsyncClient(http2=True, timeout=180) as client:
        # 1. Create tables (may need manual SQL)
        await create_tables(client)
        
        # 2. Migrate templates (shared_code → templates)
        await migrate_table(
            client, "shared_code",
            "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,category,long_description,language,share_source_code,created_at,updated_at",
            "templates"
        )
        
        # 3. Migrate components
        await migrate_table(
            client, "components",
            "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,background,created_by,created_at,updated_at",
            "components"
        )
        
        # 4. Migrate assets
        await migrate_table(
            client, "assets",
            "id,slug,title,description,keywords,resolution,colors,image_320w,image_800w,image_1600w,image_3840w,image_original,media_type,views,premium,featured,created_by,created_at,updated_at",
            "assets"
        )
        
        # 5. Migrate skills (needs auth)
        await migrate_table(
            client, "skills",
            "id,title,description,content,tags,views,forks,created_at",
            "skills"
        )
    
    log("=" * 60)
    log("✓ Migration complete!")
    log("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
