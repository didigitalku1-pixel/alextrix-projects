#!/usr/bin/env python3
"""
Generate DESIGN.md for all templates that don't have one yet.

Extracts design information from HTML code:
- Font families (from Google Fonts links + CSS)
- Color palette (from CSS/Tailwind classes)
- Layout structure (sections, grids, flex layouts)
- Spacing patterns
- Animation classes
- Component types (hero, nav, footer, pricing, etc.)

Output: INSERT into design_md table in user's Supabase.

Usage:
    python3 scripts/generate_design_md.py --batch-size 100
    python3 scripts/generate_design_md.py --limit 10  # test with 10
    python3 scripts/generate_design_md.py --dry-run    # preview without insert
"""
import argparse
import json
import re
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime

SUPA_URL = "https://kvkwiekfdlaeeabkwmhp.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2a3dpZWtmZGxhZWVhYmt3bWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTkxMzEsImV4cCI6MjEwMDgzNTEzMX0.7w5-8HP3h_G5UUkwVY6Mi68dBLdNyDn9JLM3g_27X5I"
SERVICE_KEY = None  # loaded from arg or env


def api_get(path, headers=None):
    """GET request to Supabase REST API."""
    url = f"{SUPA_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, headers=headers or {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_post(path, body, use_service=True):
    """POST request to Supabase REST API."""
    key = SERVICE_KEY or ANON_KEY
    url = f"{SUPA_URL}/rest/v1/{path}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST", headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status == 201
    except urllib.error.HTTPError as e:
        print(f"  ❌ INSERT failed: {e.code} {e.read().decode()[:200]}", file=sys.stderr)
        return False


def get_existing_template_ids():
    """Get all template_ids that already have design_md."""
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
    }
    # Fetch in batches of 1000
    all_ids = set()
    offset = 0
    while True:
        path = f"design_md?select=template_id&artifact_type=eq.design_md&limit=1000&offset={offset}"
        data = api_get(path, headers)
        if not data:
            break
        for item in data:
            tid = item.get("template_id")
            if tid:
                all_ids.add(tid)
        if len(data) < 1000:
            break
        offset += 1000
    return all_ids


def get_templates_without_design_md(existing_ids, limit=None, offset=0):
    """Fetch templates that don't have design_md yet."""
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
    }
    batch_limit = limit or 500
    path = f"templates?select=id,slug,title,description,code,tags&order=id.asc&limit={batch_limit}&offset={offset}"
    data = api_get(path, headers)
    
    result = []
    for t in data:
        if t["id"] not in existing_ids and t.get("code"):
            result.append(t)
    return result


def extract_fonts(html):
    """Extract font families from HTML."""
    fonts = set()
    
    # From Google Fonts links
    for match in re.finditer(r'fonts\.googleapis\.com/css2\?family=([^&"\']+)', html):
        font_name = match.group(1).replace("+", " ").split(":")[0]
        fonts.add(font_name)
    
    # From font-family CSS
    for match in re.finditer(r'font-family:\s*([^;"\'}]+)', html, re.IGNORECASE):
        families = match.group(1).strip().rstrip(",")
        for f in families.split(","):
            f = f.strip().strip("'\"")
            if f and f not in ("inherit", "sans-serif", "serif", "monospace", "system-ui"):
                fonts.add(f)
    
    # From Tailwind font classes
    font_map = {
        "font-sans": "Inter / System Sans",
        "font-serif": "Serif",
        "font-mono": "Monospace",
    }
    for cls, name in font_map.items():
        if cls in html:
            fonts.add(name)
    
    return sorted(fonts) if fonts else ["Inter (default)"]


def extract_colors(html):
    """Extract color palette from HTML."""
    colors = set()
    
    # Hex colors
    for match in re.finditer(r'#([0-9a-fA-F]{6})\b', html):
        colors.add(f"#{match.group(1).lower()}")
    
    # Tailwind color classes (common ones)
    tailwind_colors = {
        "bg-black": "#000000",
        "bg-white": "#FFFFFF",
        "bg-gray-900": "#111827",
        "bg-gray-800": "#1F2937",
        "bg-gray-100": "#F3F4F6",
        "bg-blue-500": "#3B82F6",
        "bg-blue-600": "#2563EB",
        "bg-purple-500": "#8B5CF6",
        "bg-purple-600": "#7C3AED",
        "bg-green-500": "#10B981",
        "bg-red-500": "#EF4444",
        "bg-orange-500": "#F97316",
        "bg-amber-500": "#F59E0B",
        "bg-pink-500": "#EC4899",
        "bg-indigo-500": "#6366F1",
        "text-white": "#FFFFFF",
        "text-black": "#000000",
        "text-gray-900": "#111827",
        "text-gray-400": "#9CA3AF",
        "text-blue-500": "#3B82F6",
    }
    for cls, color in tailwind_colors.items():
        if cls in html:
            colors.add(color)
    
    # rgb/rgba colors
    for match in re.finditer(r'rgba?\(([^)]+)\)', html):
        parts = match.group(1).split(",")
        if len(parts) >= 3:
            r, g, b = parts[0].strip(), parts[1].strip(), parts[2].strip()
            colors.add(f"rgb({r}, {g}, {b})")
    
    return sorted(colors)[:15] if colors else ["#000000", "#FFFFFF"]


def extract_sections(html):
    """Detect page sections from HTML."""
    sections = []
    
    # Common section patterns
    patterns = [
        (r'<nav\b', "Navigation"),
        (r'<header\b', "Header/Hero"),
        (r'hero', "Hero Section"),
        (r'pricing', "Pricing"),
        (r'feature', "Features"),
        (r'testimonial', "Testimonials"),
        (r'faq', "FAQ"),
        (r'footer\b', "Footer"),
        (r'cta', "Call to Action"),
        (r'gallery', "Gallery"),
        (r'stats', "Statistics"),
        (r'contact', "Contact"),
        (r'about', "About"),
        (r'team', "Team"),
        (r'blog', "Blog"),
        (r'newsletter', "Newsletter"),
        (r'steps', "Steps/Process"),
        (r'compare', "Comparison"),
        (r'logo', "Logo Cloud"),
    ]
    
    html_lower = html.lower()
    for pattern, name in patterns:
        if re.search(pattern, html_lower):
            sections.append(name)
    
    return sections if sections else ["General content"]


def extract_layout_info(html):
    """Extract layout information."""
    info = {
        "has_grid": bool(re.search(r'grid-cols|grid grid', html)),
        "has_flex": "flex" in html,
        "has_gradient": "gradient" in html,
        "has_animation": bool(re.search(r'animate|transition|keyframe|@keyframes', html)),
        "has_dark_bg": bool(re.search(r'bg-black|bg-gray-900|bg-neutral-900|bg-zinc-900', html)),
        "has_responsive": bool(re.search(r'md:|lg:|sm:|xl:', html)),
        "estimated_sections": html.count("<section") + html.count('class="section'),
    }
    return info


def generate_design_md(template):
    """Generate DESIGN.md content from template HTML."""
    code = template.get("code", "") or ""
    title = template.get("title", "Untitled")
    desc = template.get("description", "") or ""
    tags = template.get("tags", []) or []
    slug = template.get("slug", "")
    
    fonts = extract_fonts(code)
    colors = extract_colors(code)
    sections = extract_sections(code)
    layout = extract_layout_info(code)
    
    # Build DESIGN.md
    lines = [
        f"---",
        f"version: 1.0.0",
        f"name: {slug or title.lower().replace(' ', '-')}",
        f"description: {desc[:200]}" if desc else f"description: {title}",
        f"---",
        f"",
        f"# {title}",
        f"",
        f"## Overview",
        f"",
        f"{desc}" if desc else f"A web template with {len(sections)} sections.",
        f"",
        f"## Typography",
        f"",
    ]
    
    for font in fonts[:8]:
        lines.append(f"- **{font}**")
    
    lines.extend([
        f"",
        f"## Color Palette",
        f"",
    ])
    
    for color in colors[:10]:
        lines.append(f"- `{color}`")
    
    lines.extend([
        f"",
        f"## Layout Structure",
        f"",
        f"- **Grid layout**: {'Yes' if layout['has_grid'] else 'No'}",
        f"- **Flexbox**: {'Yes' if layout['has_flex'] else 'No'}",
        f"- **Responsive**: {'Yes' if layout['has_responsive'] else 'No'}",
        f"- **Dark background**: {'Yes' if layout['has_dark_bg'] else 'No'}",
        f"- **Gradients**: {'Yes' if layout['has_gradient'] else 'No'}",
        f"- **Animations**: {'Yes' if layout['has_animation'] else 'No'}",
        f"- **Estimated sections**: {layout['estimated_sections']}",
        f"",
        f"## Sections",
        f"",
    ])
    
    for section in sections:
        lines.append(f"- {section}")
    
    lines.extend([
        f"",
        f"## Tags",
        f"",
    ])
    
    if tags:
        for tag in tags[:10]:
            lines.append(f"- {tag}")
    else:
        lines.append(f"- (no tags)")
    
    lines.extend([
        f"",
        f"## Code Stats",
        f"",
        f"- **Total characters**: {len(code):,}",
        f"- **Lines**: {code.count(chr(10)):,}",
        f"",
        f"## Design Guidelines",
        f"",
        f"### Do's",
        f"- Maintain consistent spacing using the detected font and color palette",
        f"- Keep responsive breakpoints (md:, lg:) for all new sections",
        f"- Use the existing animation style for interactive elements",
        f"",
        f"### Don'ts",
        f"- Don't introduce new font families outside the detected palette",
        f"- Don't break the {'dark' if layout['has_dark_bg'] else 'light'} theme consistency",
        f"- Don't remove gradient effects that contribute to visual hierarchy",
        f"",
    ])
    
    return "\n".join(lines)


def generate_copy_prompt(template):
    """Generate recreation prompt (Copy Prompt) from template."""
    title = template.get("title", "Untitled")
    desc = template.get("description", "") or ""
    tags = template.get("tags", []) or []
    code = template.get("code", "") or ""
    
    fonts = extract_fonts(code)
    colors = extract_colors(code)
    sections = extract_sections(code)
    layout = extract_layout_info(code)
    
    font_str = ", ".join(fonts[:3])
    color_str = ", ".join(colors[:5])
    section_str = ", ".join(sections)
    
    prompt = f"""Recreate the website "{title}" with high visual fidelity as a Tailwind CSS-based landing page.

The result must match the supplied reference website, not a cleaned-up reinterpretation.

Design system:
- Fonts: {font_str}
- Colors: {color_str}
- Layout: {'Grid-based' if layout['has_grid'] else 'Flexbox-based' if layout['has_flex'] else 'Standard'}
- Theme: {'Dark' if layout['has_dark_bg'] else 'Light'}
- Sections: {section_str}
- Responsive: {'Yes' if layout['has_responsive'] else 'No'}
- Animations: {'Yes' if layout['has_animation'] else 'No'}
- Gradients: {'Yes' if layout['has_gradient'] else 'No'}

Tags: {', '.join(tags[:8]) if tags else 'none'}

{desc[:300] if desc else 'Recreate this landing page with matching structure, typography, colors, and spacing.'}

Code size: {len(code):,} characters across {code.count(chr(10)):,} lines.
"""
    
    return prompt


def main():
    parser = argparse.ArgumentParser(description="Generate DESIGN.md for templates")
    parser.add_argument("--batch-size", type=int, default=100, help="Templates per batch")
    parser.add_argument("--limit", type=int, default=None, help="Max templates to process (for testing)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without INSERT")
    parser.add_argument("--service-key", help="Supabase service_role JWT key")
    parser.add_argument("--generate-prompt", action="store_true", help="Also generate recreation_prompt")
    args = parser.parse_args()
    
    global SERVICE_KEY
    SERVICE_KEY = args.service_key or __import__("os").environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not args.dry_run and not SERVICE_KEY:
        print("❌ Need --service-key or SUPABASE_SERVICE_ROLE_KEY env var for INSERT", file=sys.stderr)
        sys.exit(1)
    
    print(f"📋 DESIGN.md Generator")
    print(f"   Batch size: {args.batch_size}")
    print(f"   Limit: {args.limit or 'unlimited'}")
    print(f"   Dry run: {args.dry_run}")
    print(f"   Generate prompt: {args.generate_prompt}")
    print()
    
    # Step 1: Get existing template IDs
    print("🔍 Fetching existing design_md entries...")
    existing_ids = get_existing_template_ids()
    print(f"   Found {len(existing_ids)} templates with existing design_md")
    
    # Step 2: Process templates in batches
    total_processed = 0
    total_success = 0
    total_failed = 0
    offset = 0
    
    while True:
        if args.limit and total_processed >= args.limit:
            break
        
        batch_limit = min(args.batch_size, args.limit - total_processed) if args.limit else args.batch_size
        
        print(f"\n📦 Fetching templates batch (offset={offset}, limit={batch_limit})...")
        templates = get_templates_without_design_md(existing_ids, limit=batch_limit, offset=offset)
        
        if not templates:
            # Check if we've processed all
            all_templates = api_get(f"templates?select=id&limit=1&offset={offset}", {
                "apikey": ANON_KEY,
                "Authorization": f"Bearer {ANON_KEY}",
            })
            if not all_templates:
                print("✅ No more templates to process!")
                break
            # Some templates in this batch already have design_md, skip to next
            offset += batch_limit
            continue
        
        print(f"   Processing {len(templates)} templates...")
        
        for t in templates:
            try:
                # Generate DESIGN.md
                design_md = generate_design_md(t)
                
                if args.dry_run:
                    print(f"\n--- PREVIEW: template_id={t['id']} ---")
                    print(design_md[:500])
                    print("---")
                else:
                    # Insert design_md
                    success = api_post("design_md", {
                        "template_id": t["id"],
                        "artifact_type": "design_md",
                        "content": design_md,
                    })
                    
                    if success:
                        total_success += 1
                        if total_success % 10 == 0:
                            print(f"   ✅ {total_success} generated ({total_processed + 1}/{args.limit or '∞'})")
                    else:
                        total_failed += 1
                    
                    # Also generate recreation_prompt if requested
                    if args.generate_prompt and success:
                        prompt = generate_copy_prompt(t)
                        api_post("design_md", {
                            "template_id": t["id"],
                            "artifact_type": "recreation_prompt",
                            "content": prompt,
                        })
                
                existing_ids.add(t["id"])
                total_processed += 1
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                print(f"  ❌ Error on template {t['id']}: {e}", file=sys.stderr)
                total_failed += 1
                total_processed += 1
        
        offset += batch_limit
    
    print(f"\n{'='*60}")
    print(f"✅ Complete!")
    print(f"   Total processed: {total_processed}")
    print(f"   Success: {total_success}")
    print(f"   Failed: {total_failed}")
    print(f"   Existing design_md now: {len(existing_ids)}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
