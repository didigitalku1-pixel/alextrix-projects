#!/usr/bin/env python3
"""
Extract & translate LEARN pages to Indonesian.
1. Use z-ai page_reader to extract rendered HTML content
2. Parse HTML to markdown
3. Translate to Indonesian using z-ai chat
"""
import json
import os
import re
import subprocess
import time
from pathlib import Path
from datetime import datetime

LEARN_PAGES = [
    "introduction",
    "tips-for-prompting",
    "how-to-prompt",
    "how-to-design",
    "seo-settings",
    "faq",
    "custom-domain",
    "video-tutorials",
    "documentation",
]

LIBRARY_DIR = Path("/home/z/my-project/download/aura_library")
EXTRACTED_DIR = LIBRARY_DIR / "learn" / "extracted"
TRANSLATED_DIR = LIBRARY_DIR / "learn" / "id"
EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
TRANSLATED_DIR.mkdir(parents=True, exist_ok=True)

def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

def extract_page(page):
    """Use z-ai page_reader to extract rendered HTML."""
    out_file = EXTRACTED_DIR / f"{page}.json"
    if out_file.exists() and out_file.stat().st_size > 1000:
        log(f"  [{page}] Already extracted, skipping")
        return True
    
    url = f"https://www.aura.build/learn/{page}"
    log(f"  [{page}] Extracting from {url}")
    try:
        r = subprocess.run(
            ["z-ai", "function", "-n", "page_reader",
             "-a", json.dumps({"url": url}),
             "-o", str(out_file)],
            capture_output=True, text=True, timeout=120,
        )
        if r.returncode != 0:
            log(f"  [{page}] ERROR: {r.stderr[:200]}")
            return False
        # Verify
        with open(out_file) as f:
            d = json.load(f)
        html = d.get("data", {}).get("html", "")
        if len(html) < 500:
            log(f"  [{page}] WARNING: HTML too short ({len(html)} chars)")
            return False
        log(f"  [{page}] ✓ Extracted {len(html):,} chars")
        return True
    except Exception as e:
        log(f"  [{page}] EXCEPTION: {e}")
        return False

def html_to_markdown(html):
    """Convert HTML to clean markdown."""
    # Remove script/style/nav
    html = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', html, flags=re.I)
    html = re.sub(r'<style[^>]*>[\s\S]*?</style>', '', html, flags=re.I)
    html = re.sub(r'<nav[^>]*>[\s\S]*?</nav>', '', html, flags=re.I)
    html = re.sub(r'<footer[^>]*>[\s\S]*?</footer>', '', html, flags=re.I)
    html = re.sub(r'<header[^>]*>[\s\S]*?</header>', '', html, flags=re.I)
    
    # Remove SVG (icons)
    html = re.sub(r'<svg[^>]*>[\s\S]*?</svg>', '', html, flags=re.I)
    
    # Convert headings
    for i in range(6, 0, -1):
        html = re.sub(f'<h{i}[^>]*>(.*?)</h{i}>', lambda m, lvl=i: '\n' + '#' * lvl + ' ' + m.group(1).strip() + '\n', html, flags=re.I | re.DOTALL)
    
    # Convert links
    html = re.sub(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', r'[\2](\1)', html, flags=re.I | re.DOTALL)
    
    # Convert bold/italic
    html = re.sub(r'<(strong|b)[^>]*>(.*?)</\1>', r'**\2**', html, flags=re.I | re.DOTALL)
    html = re.sub(r'<(em|i)[^>]*>(.*?)</\1>', r'*\2*', html, flags=re.I | re.DOTALL)
    
    # Convert code blocks
    html = re.sub(r'<pre[^>]*>([\s\S]*?)</pre>', lambda m: '\n```\n' + re.sub(r'<[^>]+>', '', m.group(1)) + '\n```\n', html, flags=re.I)
    html = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', html, flags=re.I | re.DOTALL)
    
    # Convert lists
    html = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '\n- ' + m.group(1).strip(), html, flags=re.I | re.DOTALL)
    html = re.sub(r'</?[ou]l[^>]*>', '', html, flags=re.I)
    
    # Convert paragraphs
    html = re.sub(r'<p[^>]*>(.*?)</p>', lambda m: '\n\n' + m.group(1).strip(), html, flags=re.I | re.DOTALL)
    
    # Convert br
    html = re.sub(r'<br\s*/?>', '\n', html, flags=re.I)
    
    # Remove all remaining tags
    html = re.sub(r'<[^>]+>', '', html)
    
    # Decode entities
    html = html.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'").replace('&nbsp;', ' ')
    
    # Clean up whitespace
    html = re.sub(r'\n{3,}', '\n\n', html)
    html = re.sub(r'[ \t]+', ' ', html)
    html = '\n'.join(line.strip() for line in html.split('\n'))
    
    return html.strip()

def translate_to_indonesian(text, page):
    """Translate markdown text to Indonesian using z-ai chat."""
    if len(text) < 100:
        return text
    
    out_file = TRANSLATED_DIR / f"{page}.md"
    if out_file.exists() and out_file.stat().st_size > 100:
        log(f"  [{page}] Already translated, skipping")
        return True
    
    log(f"  [{page}] Translating to Indonesian ({len(text):,} chars)...")
    
    # Truncate to avoid token limits (keep first ~12K chars)
    if len(text) > 15000:
        text = text[:15000] + "\n\n[...content truncated for translation...]"
    
    system_prompt = """You are a professional translator. Translate the following English markdown content to Indonesian (Bahasa Indonesia).
Rules:
- Preserve ALL markdown formatting (#, *, -, `, [], (), ```)
- Preserve ALL URLs and links as-is
- Preserve code blocks as-is (don't translate code)
- Translate technical terms appropriately (e.g., "design system" → "sistem desain", "template" → "template", "prompt" → "prompt")
- Keep the same paragraph structure
- Translate naturally, not word-by-word
- Output ONLY the translated markdown, no preamble"""
    
    try:
        r = subprocess.run(
            ["z-ai", "chat",
             "-p", text,
             "-s", system_prompt,
             "-o", str(TRANSLATED_DIR / f"{page}_raw.json")],
            capture_output=True, text=True, timeout=300,
        )
        if r.returncode != 0:
            log(f"  [{page}] Translation ERROR: {r.stderr[:200]}")
            return False
        
        with open(TRANSLATED_DIR / f"{page}_raw.json") as f:
            d = json.load(f)
        translated = d.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        if not translated.strip():
            log(f"  [{page}] Empty translation")
            return False
        
        out_file.write_text(translated, encoding="utf-8")
        log(f"  [{page}] ✓ Translated ({len(translated):,} chars)")
        return True
    except Exception as e:
        log(f"  [{page}] Translation EXCEPTION: {e}")
        return False

def main():
    log("=" * 60)
    log("LEARN pages: Extract & Translate to Indonesian")
    log("=" * 60)
    
    # Phase 1: Extract all pages
    log("\n--- Phase 1: Extracting HTML content ---")
    for page in LEARN_PAGES:
        extract_page(page)
        time.sleep(1)
    
    # Phase 2: Convert to markdown
    log("\n--- Phase 2: Converting HTML to Markdown ---")
    for page in LEARN_PAGES:
        extracted = EXTRACTED_DIR / f"{page}.json"
        if not extracted.exists():
            continue
        with open(extracted) as f:
            d = json.load(f)
        html = d.get("data", {}).get("html", "")
        if not html:
            continue
        md = html_to_markdown(html)
        md_file = EXTRACTED_DIR / f"{page}.md"
        md_file.write_text(md, encoding="utf-8")
        log(f"  [{page}] Markdown: {len(md):,} chars")
    
    # Phase 3: Translate to Indonesian
    log("\n--- Phase 3: Translating to Indonesian ---")
    for page in LEARN_PAGES:
        md_file = EXTRACTED_DIR / f"{page}.md"
        if not md_file.exists():
            continue
        text = md_file.read_text(encoding="utf-8")
        translate_to_indonesian(text, page)
        time.sleep(2)
    
    log("\n" + "=" * 60)
    log("✓ LEARN extraction & translation complete!")
    log(f"  Extracted: {EXTRACTED_DIR}")
    log(f"  Translated: {TRANSLATED_DIR}")
    log("=" * 60)

if __name__ == "__main__":
    main()
