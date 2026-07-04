#!/usr/bin/env python3
"""
Rebuild skills-manifest.json:
- Extract `keywords` and `name` from each skill's `content` frontmatter
- Populate `tags` (was empty for all 118 skills)
- Set `slug` derived from skill name if missing/short
- Leave `image: null` (handled by /api/skill-thumb at runtime)
"""
import json
import re
import sys
from pathlib import Path

MANIFEST = Path("download/aura_library/skills-manifest.json")

def extract_frontmatter(text: str) -> dict:
    """Parse YAML-ish frontmatter (between --- markers)."""
    fm = {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        return fm
    body = m.group(1)
    for line in body.splitlines():
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and v:
            fm[k] = v
    return fm

def derive_slug(name: str, fallback: str) -> str:
    """Build URL-safe slug from skill name."""
    if not name:
        return fallback
    slug = re.sub(r"[^a-z0-9-]", "-", name.lower().replace(" ", "-"))
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug or fallback

def main():
    if not MANIFEST.exists():
        print(f"ERROR: {MANIFEST} not found", file=sys.stderr)
        sys.exit(1)

    data = json.loads(MANIFEST.read_text())
    items = data.get("items", [])
    print(f"Loaded {len(items)} skills")

    updated = 0
    for item in items:
        content = item.get("content", "") or ""
        fm = extract_frontmatter(content)

        # Extract keywords -> tags
        kw = fm.get("keywords", "")
        if kw:
            tags = [t.strip() for t in kw.split(",") if t.strip()]
            if tags and not item.get("tags"):
                item["tags"] = tags[:8]  # cap at 8 tags
                updated += 1

        # Use skill `name` as slug if current slug looks like a hash
        name = fm.get("name", "")
        current_slug = item.get("slug", "")
        if name and (not current_slug or re.fullmatch(r"[a-f0-9]{8,}", current_slug)):
            new_slug = derive_slug(name, current_slug)
            if new_slug != current_slug:
                item["slug"] = new_slug

        # Update description from frontmatter if empty
        if not item.get("desc") and fm.get("description"):
            item["desc"] = fm["description"][:300]

    # Write back
    data["items"] = items
    MANIFEST.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"Updated tags for {updated}/{len(items)} skills")
    print(f"Wrote: {MANIFEST}")

if __name__ == "__main__":
    main()
