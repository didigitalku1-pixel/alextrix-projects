#!/usr/bin/env python3
"""
Build manifest/index from scraped JSON files.
Generates:
  - /home/z/my-project/download/aura_library/manifest.json   (compact index, all items)
  - /home/z/my-project/download/aura_library/_meta/stats.json (summary stats)

This manifest is what the Next.js website loads to display the gallery.
Each item has: id, type, slug, title, desc, tags, image, views, forks, premium, featured, username, created_at, has_code, code_chars, html_file
"""
import json
import os
from pathlib import Path
from datetime import datetime
from collections import Counter

DOWNLOAD_DIR = Path("/home/z/my-project/download/aura_library")
MANIFEST_FILE = DOWNLOAD_DIR / "manifest.json"
STATS_FILE = DOWNLOAD_DIR / "_meta" / "stats.json"

def build_index_for(subdir, item_type):
    items = []
    item_dir = DOWNLOAD_DIR / subdir
    files = sorted(item_dir.glob("*.json"))
    print(f"[{item_type}] Processing {len(files)} files...")
    
    for i, fp in enumerate(files):
        if i % 2000 == 0:
            print(f"  [{item_type}] {i}/{len(files)}")
        try:
            with open(fp, encoding="utf-8") as f:
                data = json.load(f)
            
            code = data.get("code") or ""
            tags = data.get("tags") or []
            if not isinstance(tags, list):
                tags = []
            
            item = {
                "id": data.get("id"),
                "type": item_type,
                "slug": data.get("slug"),
                "title": (data.get("title") or "Untitled")[:200],
                "desc": (data.get("description") or "")[:300],
                "tags": tags[:20],
                "image": data.get("image_url"),
                "views": data.get("views") or 0,
                "forks": data.get("forks") or 0,
                "premium": bool(data.get("premium")),
                "featured": bool(data.get("featured")),
                "private": bool(data.get("private")),
                "username": data.get("username"),
                "category": data.get("category"),
                "created_at": data.get("created_at"),
                "has_code": bool(code),
                "code_chars": len(code),
                "file": fp.stem,  # e.g. "000002_lT8Te4"
            }
            items.append(item)
        except Exception as e:
            print(f"  ! Error reading {fp}: {e}")
    
    return items

def main():
    print("Building manifest...")
    components = build_index_for("components", "component")
    templates = build_index_for("templates", "template")
    
    # Sort by views desc (most popular first)
    components.sort(key=lambda x: x["views"], reverse=True)
    templates.sort(key=lambda x: x["views"], reverse=True)
    
    all_items = components + templates
    
    manifest = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total": len(all_items),
        "components_count": len(components),
        "templates_count": len(templates),
        "items": all_items,
    }
    
    print(f"Writing manifest ({len(all_items)} items, ~{len(json.dumps(manifest))//1024}KB)...")
    MANIFEST_FILE.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    
    # Stats
    all_tags = []
    for item in all_items:
        all_tags.extend(item["tags"])
    tag_counts = Counter(all_tags).most_common(50)
    
    stats = {
        "generated_at": manifest["generated_at"],
        "total_items": len(all_items),
        "components": len(components),
        "templates": len(templates),
        "with_code": sum(1 for i in all_items if i["has_code"]),
        "premium": sum(1 for i in all_items if i["premium"]),
        "featured": sum(1 for i in all_items if i["featured"]),
        "with_image": sum(1 for i in all_items if i["image"]),
        "top_tags": tag_counts,
        "total_code_chars": sum(i["code_chars"] for i in all_items),
    }
    STATS_FILE.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    
    print(f"\n✓ Manifest written: {MANIFEST_FILE}")
    print(f"✓ Stats written: {STATS_FILE}")
    print(f"\nSummary:")
    print(f"  Total items: {stats['total_items']:,}")
    print(f"  Components:  {stats['components']:,}")
    print(f"  Templates:   {stats['templates']:,}")
    print(f"  With code:   {stats['with_code']:,}")
    print(f"  Premium:     {stats['premium']:,}")
    print(f"  Featured:    {stats['featured']:,}")
    print(f"  With image:  {stats['with_image']:,}")
    print(f"  Total HTML:  {stats['total_code_chars']:,} chars ({stats['total_code_chars']/1024/1024:.1f}MB)")
    print(f"  Top tags: {', '.join(t for t,_ in tag_counts[:10])}")

if __name__ == "__main__":
    main()
