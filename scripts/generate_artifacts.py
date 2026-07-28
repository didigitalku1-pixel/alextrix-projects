#!/usr/bin/env python3
"""
Aura.build Artifact Generator v2 - with auto token refresh
==========================================================
Generates DESIGN.md and recreation_prompt for all 24,264 items.

Features:
- Auto-refresh access_token every 50 minutes (using refresh_token)
- Resume capability (skips already-done items)
- Adaptive concurrency
- Saves artifacts to disk immediately
- Tracks detailed progress
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
EDGE_FUNCTION = "generate-template-artifact"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"

import os
LIBRARY_DIR = Path(os.environ.get("AURA_LIBRARY_DIR", os.environ.get("AURA_LIBRARY_DIR", os.environ.get("AURA_LIBRARY_DIR", "/home/z/my-project/download/aura_library"))))
MANIFEST = LIBRARY_DIR / "manifest.json"
SESSION_FILE = LIBRARY_DIR / "_meta" / "session.json"
PROGRESS_FILE = LIBRARY_DIR / "_meta" / "artifact_progress.json"
LOG_FILE = LIBRARY_DIR / "_meta" / "artifact_generator.log"

ARTIFACTS = ["design_md", "recreation_prompt"]


def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


# === Token management with auto-refresh ===
class TokenManager:
    def __init__(self):
        self.session = json.loads(SESSION_FILE.read_text())
        self.access_token = self.session["access_token"]
        self.refresh_token = self.session["refresh_token"]
        self.expires_at = self.session.get("expires_at", 0)
        self.last_refresh = 0
        self._refresh_lock = asyncio.Lock()

    def _is_expired(self):
        # Refresh if less than 5 minutes left
        return time.time() > self.expires_at - 300

    async def refresh(self):
        async with self._refresh_lock:
            if not self._is_expired():
                return self.access_token
            log("Refreshing access_token...")
            try:
                async with httpx.AsyncClient(http2=True, timeout=30) as client:
                    r = await client.post(
                        f"{SUPA_URL}/auth/v1/token?grant_type=refresh_token",
                        headers={
                            "apikey": ANON_KEY,
                            "Content-Type": "application/json",
                        },
                        json={"refresh_token": self.refresh_token},
                    )
                    r.raise_for_status()
                    data = r.json()
                    self.access_token = data["access_token"]
                    self.refresh_token = data["refresh_token"]
                    self.expires_at = data.get(
                        "expires_at", int(time.time()) + 3600
                    )
                    # Save updated session
                    self.session["access_token"] = self.access_token
                    self.session["refresh_token"] = self.refresh_token
                    self.session["expires_at"] = self.expires_at
                    SESSION_FILE.write_text(json.dumps(self.session, indent=2))
                    log(
                        f"Token refreshed. New expiry: {datetime.utcfromtimestamp(self.expires_at).isoformat()}"
                    )
                    return self.access_token
            except Exception as e:
                log(f"FATAL: Token refresh failed: {e}")
                raise

    async def get_token(self):
        if self._is_expired():
            return await self.refresh()
        return self.access_token


# === Progress ===
def load_progress():
    if PROGRESS_FILE.exists():
        try:
            content = PROGRESS_FILE.read_text().strip()
            if content:
                return json.loads(content)
        except Exception:
            pass
    return {
        "done": {},
        "errors": [],
        "stats": {"cached": 0, "fresh": 0, "errors": 0},
        "started_at": datetime.utcnow().isoformat(),
    }


def save_progress(p):
    PROGRESS_FILE.write_text(json.dumps(p, indent=2))


def get_artifact_path(item_type: str, file: str, artifact: str) -> Path:
    subdir = "components" if item_type == "component" else "templates"
    ext = "design.md" if artifact == "design_md" else "prompt.md"
    return LIBRARY_DIR / subdir / f"{file}.{ext}"


async def generate_artifact(
    client: httpx.AsyncClient,
    token_mgr: TokenManager,
    item: dict,
    artifact: str,
) -> dict:
    """Call Edge Function for one artifact. Auto-refreshes token on 401.
    Note: Only 'shared_code' (templates) sourceType is supported by Aura's Edge Function.
    Components are skipped (they don't have generate-template-artifact support)."""
    url = f"{SUPA_URL}/functions/v1/{EDGE_FUNCTION}"
    
    for attempt in range(3):
        token = await token_mgr.get_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": ANON_KEY,
            "Content-Type": "application/json",
        }
        body = {
            "sourceType": "shared_code",  # Always shared_code (components not supported)
            "sourceId": item["id"],
            "artifact": artifact,
            "forceRegenerate": False,
        }
        try:
            r = await client.post(url, headers=headers, json=body, timeout=120)
            if r.status_code == 401 and attempt == 0:
                log("  Got 401, forcing token refresh...")
                await token_mgr.refresh()
                continue
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            if attempt < 2:
                await asyncio.sleep(2 * (attempt + 1))
                continue
            raise
        except Exception as e:
            if attempt < 2:
                await asyncio.sleep(2 * (attempt + 1))
                continue
            raise
    raise Exception(f"Failed after 3 attempts")


async def process_item(
    client: httpx.AsyncClient,
    token_mgr: TokenManager,
    item: dict,
    progress: dict,
    sem: asyncio.Semaphore,
    progress_lock: asyncio.Lock,
):
    """Process one item: generate both artifacts if missing."""
    async with sem:
        item_key = f"{item['type']}:{item['id']}"
        
        async with progress_lock:
            if item_key in progress["done"]:
                return

        # Check if artifacts already on disk
        artifacts_to_gen = []
        for art in ARTIFACTS:
            path = get_artifact_path(item["type"], item["file"], art)
            if not path.exists():
                artifacts_to_gen.append(art)

        if not artifacts_to_gen:
            async with progress_lock:
                progress["done"][item_key] = "already_existed"
            return

        for art in artifacts_to_gen:
            try:
                result = await generate_artifact(client, token_mgr, item, art)
                
                # Extract content - try multiple fields
                content = ""
                if art == "design_md":
                    content = result.get("designMarkdown") or result.get("content") or ""
                elif art == "recreation_prompt":
                    content = result.get("recreationPrompt") or result.get("content") or ""

                if not content.strip():
                    raise ValueError(f"Empty content for {art}")

                # Save to disk
                path = get_artifact_path(item["type"], item["file"], art)
                path.write_text(content, encoding="utf-8")

                async with progress_lock:
                    if result.get("cached"):
                        progress["stats"]["cached"] += 1
                    else:
                        progress["stats"]["fresh"] += 1

                # Adaptive delay - cached is fast, fresh generation takes longer
                if result.get("cached"):
                    await asyncio.sleep(0.2)
                else:
                    await asyncio.sleep(1.0)

            except Exception as e:
                err_msg = f"{item_key} {art}: {str(e)[:200]}"
                async with progress_lock:
                    progress["errors"].append(err_msg)
                    progress["stats"]["errors"] += 1
                log(f"ERROR {err_msg}")
                
                err_str = str(e).lower()
                # 403 = premium template, not rate limit - skip fast
                # 429 = real rate limit - wait
                if "429" in err_str:
                    log("  Rate limited (429), waiting 30s...")
                    await asyncio.sleep(30)
                elif "403" in err_str:
                    # Premium content - skip immediately, no wait
                    await asyncio.sleep(0.1)
                elif "rate" in err_str or "limit" in err_str:
                    log("  Possible rate limit, waiting 10s...")
                    await asyncio.sleep(10)
                else:
                    await asyncio.sleep(1)

        async with progress_lock:
            progress["done"][item_key] = "generated"
            # Save progress every 10 items
            if len(progress["done"]) % 10 == 0:
                save_progress(progress)


async def main():
    log("=" * 60)
    log("Aura Artifact Generator v2 - starting")
    log("=" * 60)

    # Initialize token manager
    token_mgr = TokenManager()
    log(f"Logged in as: {token_mgr.session.get('user', {}).get('email', 'unknown')}")
    log(f"Token expires at: {datetime.utcfromtimestamp(token_mgr.expires_at).isoformat()}")

    # Load manifest
    manifest = json.loads(MANIFEST.read_text())
    items = manifest["items"]
    log(f"Total items in manifest: {len(items):,}")

    progress = load_progress()
    log(f"Already done: {len(progress['done']):,}")
    log(f"Errors so far: {len(progress['errors']):,}")
    log(f"Stats: {progress['stats']}")

    # Sort by views desc (process most popular first)
    items.sort(key=lambda x: x.get("views", 0), reverse=True)

    # FILTER: Only templates can use the Edge Function (components not supported)
    items = [it for it in items if it["type"] == "template"]
    log(f"After filtering to templates only: {len(items):,}")

    # Filter pending items
    pending = [it for it in items if f"{it['type']}:{it['id']}" not in progress["done"]]
    log(f"Pending: {len(pending):,}")

    if not pending:
        log("✓ All items already processed!")
        return

    # Concurrency: 2 parallel (low memory pressure)
    sem = asyncio.Semaphore(2)
    progress_lock = asyncio.Lock()
    log(f"Concurrency: 2 parallel requests")
    log(f"Estimated time: {len(pending) * 1.0 / 60:.1f} hours (if mostly cached)")

    # Process in batches of 25 (save progress every batch)
    BATCH = 25
    async with httpx.AsyncClient(http2=True, timeout=180) as client:
        for i in range(0, len(pending), BATCH):
            batch = pending[i : i + BATCH]
            batch_num = i // BATCH + 1
            total_batches = (len(pending) + BATCH - 1) // BATCH
            log(
                f"Batch {batch_num}/{total_batches}: items {i + 1}-{i + len(batch)} of {len(pending)}"
            )

            tasks = [
                process_item(client, token_mgr, item, progress, sem, progress_lock)
                for item in batch
            ]
            try:
                await asyncio.gather(*tasks, return_exceptions=True)
            except Exception as e:
                log(f"Batch error (continuing): {e}")

            save_progress(progress)
            stats = progress["stats"]
            done_count = len(progress["done"])
            log(
                f"  Progress: done={done_count:,} "
                f"cached={stats['cached']:,} "
                f"fresh={stats['fresh']:,} "
                f"errors={stats['errors']:,} "
                f"({done_count / len(items) * 100:.1f}%)"
            )

    log("=" * 60)
    log("✓ Phase 3 complete!")
    log(f"Final stats: {json.dumps(progress['stats'], indent=2)}")
    log("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
