#!/usr/bin/env python3
"""Build full manifest including templates, components, assets, skills."""
import json
from pathlib import Path
from datetime import datetime
from collections import Counter

import os; LIBRARY_DIR = Path(os.environ.get("AURA_LIBRARY_DIR", os.environ.get("AURA_LIBRARY_DIR", "/home/z/my-project/download/aura_library")))
MANIFEST_FILE = LIBRARY_DIR / "manifest.json"
STATS_FILE = LIBRARY_DIR / "_meta" / "stats.json"

def build_index(subdir, item_type, fields_map):
    items = []
    item_dir = LIBRARY_DIR / subdir
    if not item_dir.exists():
        return items
    files = sorted(item_dir.glob("*.json"))
    print(f"[{item_type}] Processing {len(files)} files...")
    
    for i, fp in enumerate(files):
        if i % 5000 == 0:
            print(f"  [{item_type}] {i}/{len(files)}")
        try:
            with open(fp, encoding="utf-8") as f:
                data = json.load(f)
            
            item = {
                "id": data.get("id"),
                "type": item_type,
                "slug": data.get("slug"),
                "title": (data.get("title") or "Untitled")[:200],
                "desc": (data.get("description") or "")[:300],
                "tags": (data.get("tags") or data.get("keywords") or [])[:20],
                "image": data.get("image_url") or data.get("image_1600w") or data.get("image_800w") or data.get("image_320w"),
                "views": data.get("views") or 0,
                "forks": data.get("forks") or 0,
                "premium": bool(data.get("premium")),
                "featured": bool(data.get("featured")),
                "private": bool(data.get("private")),
                "username": data.get("username"),
                "category": data.get("category"),
                "created_at": data.get("created_at"),
                "has_code": bool(data.get("code")),
                "code_chars": len(data.get("code") or ""),
                "file": fp.stem,
            }
            # For assets, add media_type
            if item_type == "asset":
                item["media_type"] = data.get("media_type", "image")
                item["resolution"] = data.get("resolution")
                item["colors"] = (data.get("colors") or [])[:5]
            # For skills, add content snippet
            if item_type == "skill":
                content = data.get("content") or ""
                item["content_chars"] = len(content)
                item["has_content"] = bool(content)
            items.append(item)
        except Exception as e:
            pass
    return items

def main():
    print("Building full manifest...")
    templates = build_index("templates", "template", None)
    components = build_index("components", "component", None)
    assets = build_index("assets", "asset", None)
    skills = build_index("skills", "skill", None)
    
    # Sort each by views desc
    for arr in [templates, components, assets, skills]:
        arr.sort(key=lambda x: x.get("views", 0), reverse=True)
    
    all_items = templates + components + assets + skills
    
    manifest = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total": len(all_items),
        "templates_count": len(templates),
        "components_count": len(components),
        "assets_count": len(assets),
        "skills_count": len(skills),
        "items": all_items,
    }
    
    print(f"Writing manifest ({len(all_items)} items)...")
    MANIFEST_FILE.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    
    # Stats
    all_tags = []
    for item in all_items:
        all_tags.extend(item.get("tags") or [])
    tag_counts = Counter(all_tags).most_common(50)
    
    stats = {
        "generated_at": manifest["generated_at"],
        "total_items": len(all_items),
        "templates": len(templates),
        "components": len(components),
        "assets": len(assets),
        "skills": len(skills),
        "with_code": sum(1 for i in all_items if i.get("has_code")),
        "premium": sum(1 for i in all_items if i.get("premium")),
        "featured": sum(1 for i in all_items if i.get("featured")),
        "with_image": sum(1 for i in all_items if i.get("image")),
        "top_tags": tag_counts,
        "total_code_chars": sum(i.get("code_chars", 0) for i in all_items),
    }
    STATS_FILE.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    
    print(f"\n✓ Manifest: {MANIFEST_FILE} ({len(all_items):,} items)")
    print(f"✓ Stats: {STATS_FILE}")
    print(f"\nBreakdown:")
    print(f"  Templates:  {len(templates):,}")
    print(f"  Components: {len(components):,}")
    print(f"  Assets:     {len(assets):,}")
    print(f"  Skills:     {len(skills):,}")
    print(f"  Total:      {len(all_items):,}")

if __name__ == "__main__":
    main()
