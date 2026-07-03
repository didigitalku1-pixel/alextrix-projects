#!/usr/bin/env python3
"""
Generate DESIGN.md for PAID templates using z-ai.
Analyzes HTML code we already have and creates design specifications.
This is LEGITIMATE - we already have the HTML code, we're creating our own documentation.
"""
import json
import asyncio
import os
import sys
import time
from pathlib import Path
from datetime import datetime
import httpx

LIBRARY_DIR = Path("/home/z/my-project/download/aura_library")
MANIFEST = LIBRARY_DIR / "manifest.json"
PROGRESS_FILE = LIBRARY_DIR / "_meta" / "paid_design_progress.json"
LOG_FILE = LIBRARY_DIR / "_meta" / "paid_design_generator.log"

# Z-AI SDK endpoint (use subprocess to call z-ai CLI)
import subprocess

def log(msg):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except: pass

async def generate_design_md_with_ai(html_code, title, description):
    """Use z-ai CLI to generate DESIGN.md from HTML code."""
    prompt = f"""Analyze the following HTML code and create a comprehensive DESIGN.md specification in markdown format.

Template title: {title}
Description: {description}

HTML code (first 8000 chars):
{html_code[:8000]}

Create a DESIGN.md that includes:
1. Overview - what this template is for
2. Color palette - extract actual colors used
3. Typography - font families, sizes, weights
4. Spacing system - padding/margin patterns
5. Layout structure - grid, flexbox usage
6. Components - reusable UI elements identified
7. Responsive breakpoints
8. Animations/transitions
9. Accessibility notes
10. Key Tailwind CSS classes used

Format as clean markdown with YAML frontmatter. Be specific about actual values from the code."""

    try:
        result = subprocess.run(
            ["z-ai", "chat", "-p", prompt, "-s", "You are a senior design system architect. Create detailed DESIGN.md specifications from HTML code."],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            # Parse response
            try:
                response = json.loads(result.stdout)
                content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
                if content and len(content) > 100:
                    return content
            except:
                pass
    except Exception as e:
        log(f"  AI generation error: {e}")
    return None

async def generate_prompt_with_ai(html_code, title, description):
    """Use z-ai to generate Copy Prompt from HTML code."""
    prompt = f"""Create a recreation prompt that would help an AI regenerate this template.

Template title: {title}
Description: {description}

HTML code (first 5000 chars):
{html_code[:5000]}

Write a detailed recreation prompt that includes:
1. Overall design direction
2. Layout structure
3. Color scheme
4. Typography
5. Key sections and their purpose
6. Interactive elements
7. Animation/transition details
8. Responsive behavior
9. Preserve source quirks (unique features to maintain)

Format as clear instructions for an AI to recreate this design."""

    try:
        result = subprocess.run(
            ["z-ai", "chat", "-p", prompt, "-s", "You are an expert at writing AI recreation prompts for web designs."],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            try:
                response = json.loads(result.stdout)
                content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
                if content and len(content) > 100:
                    return content
            except:
                pass
    except Exception as e:
        log(f"  AI prompt generation error: {e}")
    return None

async def main():
    log("=" * 60)
    log("PAID Template DESIGN.md Generator (using z-ai)")
    log("=" * 60)
    
    # Load manifest
    manifest = json.loads(MANIFEST.read_text())
    templates = [it for it in manifest["items"] if it["type"] == "template"]
    
    # Find templates that have premium=True (paid templates)
    # These are the ones that return 403 from aura.build
    paid_templates = [t for t in templates if t.get("premium")]
    log(f"Total templates: {len(templates):,}")
    log(f"Paid (premium) templates: {len(paid_templates):,}")
    
    # Load progress
    progress = {"done": {}}
    if PROGRESS_FILE.exists():
        try:
            progress = json.loads(PROGRESS_FILE.read_text())
        except: pass
    
    pending = [t for t in paid_templates if str(t["id"]) not in progress.get("done", {})]
    log(f"Already done: {len(progress.get('done', {}))}")
    log(f"Pending: {len(pending)}")
    
    if not pending:
        log("✓ All paid templates already have DESIGN.md!")
        return
    
    # Process each paid template
    for i, template in enumerate(pending):
        tid = template["id"]
        file_stem = template["file"]
        title = template.get("title", "Untitled")
        desc = template.get("desc", "")
        
        # Check if DESIGN.md already exists
        design_path = LIBRARY_DIR / "templates" / f"{file_stem}.design.md"
        prompt_path = LIBRARY_DIR / "templates" / f"{file_stem}.prompt.md"
        
        if design_path.exists() and prompt_path.exists():
            progress["done"][str(tid)] = "exists"
            PROGRESS_FILE.write_text(json.dumps(progress, indent=2))
            continue
        
        # Read HTML code
        html_path = LIBRARY_DIR / "templates" / f"{file_stem}.html"
        if not html_path.exists():
            log(f"[{i+1}/{len(pending)}] {tid}: HTML not found, skipping")
            progress["done"][str(tid)] = "no_html"
            PROGRESS_FILE.write_text(json.dumps(progress, indent=2))
            continue
        
        html_code = html_path.read_text(encoding="utf-8")
        if len(html_code) < 100:
            log(f"[{i+1}/{len(pending)}] {tid}: HTML too short, skipping")
            progress["done"][str(tid)] = "short_html"
            PROGRESS_FILE.write_text(json.dumps(progress, indent=2))
            continue
        
        log(f"[{i+1}/{len(pending)}] {tid}: {title[:40]}...")
        
        # Generate DESIGN.md if not exists
        if not design_path.exists():
            log(f"  Generating DESIGN.md via z-ai...")
            design_md = await generate_design_md_with_ai(html_code, title, desc)
            if design_md:
                design_path.write_text(design_md, encoding="utf-8")
                log(f"  ✓ DESIGN.md saved ({len(design_md):,} chars)")
            else:
                log(f"  ✗ DESIGN.md generation failed")
        
        # Generate Copy Prompt if not exists
        if not prompt_path.exists():
            log(f"  Generating Copy Prompt via z-ai...")
            prompt_md = await generate_prompt_with_ai(html_code, title, desc)
            if prompt_md:
                prompt_path.write_text(prompt_md, encoding="utf-8")
                log(f"  ✓ Prompt saved ({len(prompt_md):,} chars)")
            else:
                log(f"  ✗ Prompt generation failed")
        
        progress["done"][str(tid)] = "generated"
        PROGRESS_FILE.write_text(json.dumps(progress, indent=2))
        
        # Brief delay
        await asyncio.sleep(2)
    
    log("=" * 60)
    log("✓ Paid template DESIGN.md generation complete!")
    log(f"Total processed: {len(progress.get('done', {}))}")
    log("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
