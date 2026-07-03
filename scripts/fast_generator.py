#!/usr/bin/env python3
"""
FAST Artifact Generator - maximize generation speed before subscription ends
- High concurrency (10 parallel)
- Minimal delay
- Skip 403 errors instantly
- Auto-refresh token
- Save to disk permanently
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

LIBRARY_DIR = Path("/home/z/my-project/download/aura_library")
MANIFEST = LIBRARY_DIR / "manifest.json"
SESSION_FILE = LIBRARY_DIR / "_meta" / "session.json"
PROGRESS_FILE = LIBRARY_DIR / "_meta" / "artifact_progress.json"
LOG_FILE = LIBRARY_DIR / "_meta" / "fast_generator.log"

ARTIFACTS = ["design_md", "recreation_prompt"]


def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except: pass


class TokenManager:
    def __init__(self):
        self.session = json.loads(SESSION_FILE.read_text())
        self.access_token = self.session["access_token"]
        self.refresh_token = self.session["refresh_token"]
        self.expires_at = self.session.get("expires_at", 0)
        self._refresh_lock = asyncio.Lock()

    def _is_expired(self):
        return time.time() > self.expires_at - 300

    async def refresh(self):
        async with self._refresh_lock:
            if not self._is_expired():
                return self.access_token
            log("Refreshing token...")
            try:
                async with httpx.AsyncClient(http2=True, timeout=30) as client:
                    r = await client.post(
                        f"{SUPA_URL}/auth/v1/token?grant_type=refresh_token",
                        headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
                        json={"refresh_token": self.refresh_token},
                    )
                    r.raise_for_status()
                    data = r.json()
                    self.access_token = data["access_token"]
                    self.refresh_token = data["refresh_token"]
                    self.expires_at = data.get("expires_at", int(time.time()) + 3600)
                    self.session["access_token"] = self.access_token
                    self.session["refresh_token"] = self.refresh_token
                    self.session["expires_at"] = self.expires_at
                    SESSION_FILE.write_text(json.dumps(self.session, indent=2))
                    log(f"Token refreshed. Expires: {datetime.utcfromtimestamp(self.expires_at).isoformat()}")
                    return self.access_token
            except Exception as e:
                log(f"FATAL: Token refresh failed: {e}")
                raise

    async def get_token(self):
        if self._is_expired():
            return await self.refresh()
        return self.access_token


def load_progress():
    if PROGRESS_FILE.exists():
        try:
            content = PROGRESS_FILE.read_text().strip()
            if content:
                return json.loads(content)
        except: pass
    return {
        "done": {},
        "errors": [],
        "stats": {"cached": 0, "fresh": 0, "errors": 0},
        "started_at": datetime.utcnow().isoformat(),
    }


def save_progress(p):
    PROGRESS_FILE.write_text(json.dumps(p, indent=2))


def get_artifact_path(item_type, file, artifact):
    subdir = "components" if item_type == "component" else "templates"
    ext = "design.md" if artifact == "design_md" else "prompt.md"
    return LIBRARY_DIR / subdir / f"{file}.{ext}"


async def generate_artifact(client, token_mgr, item, artifact):
    url = f"{SUPA_URL}/functions/v1/{EDGE_FUNCTION}"
    for attempt in range(2):
        token = await token_mgr.get_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": ANON_KEY,
            "Content-Type": "application/json",
        }
        body = {
            "sourceType": "shared_code",
            "sourceId": item["id"],
            "artifact": artifact,
            "forceRegenerate": False,
        }
        try:
            r = await client.post(url, headers=headers, json=body, timeout=60)
            if r.status_code == 401 and attempt == 0:
                await token_mgr.refresh()
                continue
            if r.status_code == 403:
                # Premium content - skip immediately, no retry
                return None, "403"
            r.raise_for_status()
            return r.json(), None
        except httpx.HTTPStatusError as e:
            if r.status_code == 403:
                return None, "403"
            if attempt < 1:
                await asyncio.sleep(1)
                continue
            return None, str(e)[:100]
        except Exception as e:
            if attempt < 1:
                await asyncio.sleep(1)
                continue
            return None, str(e)[:100]
    return None, "Failed after retries"


async def process_item(client, token_mgr, item, progress, sem, progress_lock):
    async with sem:
        item_key = f"{item['type']}:{item['id']}"
        
        async with progress_lock:
            if item_key in progress["done"]:
                return "skipped"

        # Check if artifacts already on disk
        artifacts_to_gen = []
        for art in ARTIFACTS:
            path = get_artifact_path(item["type"], item["file"], art)
            if not path.exists():
                artifacts_to_gen.append(art)

        if not artifacts_to_gen:
            async with progress_lock:
                progress["done"][item_key] = "already_existed"
            return "exists"

        for art in artifacts_to_gen:
            result, err = await generate_artifact(client, token_mgr, item, art)
            
            if err == "403":
                # Premium - skip fast
                async with progress_lock:
                    if item_key not in progress["done"]:
                        progress["done"][item_key] = "premium_403"
                    progress["stats"]["errors"] += 1
                return "403"
            
            if err:
                async with progress_lock:
                    progress["stats"]["errors"] += 1
                return "error"
            
            if result:
                content = ""
                if art == "design_md":
                    content = result.get("designMarkdown") or result.get("content") or ""
                else:
                    content = result.get("recreationPrompt") or result.get("content") or ""

                if content.strip():
                    path = get_artifact_path(item["type"], item["file"], art)
                    path.write_text(content, encoding="utf-8")
                    async with progress_lock:
                        if result.get("cached"):
                            progress["stats"]["cached"] += 1
                        else:
                            progress["stats"]["fresh"] += 1

        async with progress_lock:
            progress["done"][item_key] = "generated"
            if len(progress["done"]) % 10 == 0:
                save_progress(progress)
        return "done"


async def main():
    log("=" * 60)
    log("FAST Artifact Generator - MAXIMUM SPEED MODE")
    log("=" * 60)
    
    token_mgr = TokenManager()
    log(f"Token expires: {datetime.utcfromtimestamp(token_mgr.expires_at).isoformat()}")
    
    manifest = json.loads(MANIFEST.read_text())
    items = [it for it in manifest["items"] if it["type"] == "template"]
    items.sort(key=lambda x: x.get("views", 0), reverse=True)
    log(f"Total templates: {len(items):,}")
    
    progress = load_progress()
    log(f"Already done: {len(progress['done']):,}")
    
    pending = [it for it in items if f"{it['type']}:{it['id']}" not in progress["done"]]
    log(f"Pending: {len(pending):,}")
    
    if not pending:
        log("✓ All done!")
        return
    
    # HIGH CONCURRENCY: 10 parallel (was 2)
    sem = asyncio.Semaphore(10)
    progress_lock = asyncio.Lock()
    log(f"Concurrency: 10 parallel (MAXIMUM SPEED)")
    log(f"Estimated: {len(pending) * 0.3 / 60:.0f} minutes (if cached)")
    
    BATCH = 100
    async with httpx.AsyncClient(http2=True, timeout=90) as client:
        for i in range(0, len(pending), BATCH):
            batch = pending[i : i + BATCH]
            batch_num = i // BATCH + 1
            total_batches = (len(pending) + BATCH - 1) // BATCH
            
            tasks = [
                process_item(client, token_mgr, item, progress, sem, progress_lock)
                for item in batch
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            save_progress(progress)
            stats = progress["stats"]
            done_count = len(progress["done"])
            pct = done_count / len(items) * 100
            
            # Count results
            r_counts = {}
            for r in results:
                if isinstance(r, str):
                    r_counts[r] = r_counts.get(r, 0) + 1
            
            log(
                f"Batch {batch_num}/{total_batches}: done={done_count:,}/{len(items):,} ({pct:.1f}%) "
                f"cached={stats['cached']:,} fresh={stats['fresh']:,} errors={stats['errors']:,} "
                f"| batch: {r_counts}"
            )
    
    log("=" * 60)
    log("✓ Generation complete!")
    log(f"Final: {json.dumps(progress['stats'], indent=2)}")
    log("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
