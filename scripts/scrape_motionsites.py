#!/usr/bin/env python3
"""
Scrape ALL 128 free prompts from motionsites.ai.
Uses Playwright to visit each prompt page, click Copy, capture clipboard.
"""
import json
import time
import sys
import os
from playwright.sync_api import sync_playwright

def main():
    with open('/tmp/motion_free_ids.json') as f:
        prompt_ids = json.load(f)
    
    with open('/tmp/motion_free_list.json') as f:
        metadata = {p['id']: p for p in json.load(f)}
    
    print(f"=== Scraping {len(prompt_ids)} free prompts from motionsites.ai ===")
    
    with open('/tmp/motion_access.txt') as f:
        access_token = f.read().strip()
    with open('/tmp/motion_refresh.txt') as f:
        refresh_token = f.read().strip()
    
    prompts_scraped = []
    failed = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            permissions=['clipboard-read', 'clipboard-write'],
            viewport={'width': 1440, 'height': 900},
        )
        page = ctx.new_page()
        
        page.goto('https://motionsites.ai/', wait_until='domcontentloaded', timeout=30000)
        page.evaluate(f"""() => {{
            localStorage.setItem('sb-xgdzyqfalbibzelpdpvr-auth-token', JSON.stringify({{
                access_token: '{access_token}',
                refresh_token: '{refresh_token}',
                token_type: 'bearer',
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                user: {{
                    id: 'e8d1d7e0-d8f3-41f0-a22f-9b59fb280865',
                    email: 'didigitalku.1@gmail.com',
                    aud: 'authenticated',
                    role: 'authenticated',
                }}
            }}));
        }}""")
        page.reload(wait_until='domcontentloaded')
        page.wait_for_timeout(3000)
        
        for i, prompt_id in enumerate(prompt_ids):
            meta = metadata.get(prompt_id, {})
            title = meta.get('title', prompt_id)
            page_type = meta.get('page_type', 'unknown')
            
            try:
                url = f'https://motionsites.ai/?prompt={prompt_id}'
                page.goto(url, wait_until='domcontentloaded', timeout=15000)
                page.wait_for_timeout(2000)
                
                copy_btn = None
                buttons = page.query_selector_all('button')
                for btn in buttons:
                    text = btn.text_content().strip()
                    if text == 'Copy':
                        copy_btn = btn
                        break
                
                if copy_btn:
                    copy_btn.click(force=True, timeout=3000)
                    page.wait_for_timeout(1500)
                    
                    clip = page.evaluate('() => navigator.clipboard.readText().catch(() => "")')
                    
                    if clip and len(clip) > 100:
                        prompts_scraped.append({
                            'id': prompt_id,
                            'title': title,
                            'type': page_type,
                            'category': 'template',
                            'prompt': clip,
                            'length': len(clip),
                            'source': 'motionsites.ai',
                            'is_free': True,
                        })
                        print(f"  [{i+1}/{len(prompt_ids)}] OK {title} - {len(clip)} chars")
                    else:
                        failed.append({'id': prompt_id, 'title': title, 'reason': 'empty clipboard'})
                        print(f"  [{i+1}/{len(prompt_ids)}] FAIL {title} - no clipboard")
                else:
                    failed.append({'id': prompt_id, 'title': title, 'reason': 'no Copy button'})
                    print(f"  [{i+1}/{len(prompt_ids)}] FAIL {title} - no Copy button")
                
                page.keyboard.press('Escape')
                page.evaluate("""() => {
                    document.querySelectorAll('[class*="fixed"][class*="inset-0"]').forEach(el => {
                        if (el.style.zIndex > 40) el.remove();
                    });
                }""")
                page.wait_for_timeout(500)
                
            except Exception as e:
                failed.append({'id': prompt_id, 'title': title, 'reason': str(e)[:100]})
                print(f"  [{i+1}/{len(prompt_ids)}] FAIL {title} - {str(e)[:60]}")
                try:
                    page.keyboard.press('Escape')
                    page.evaluate("""() => {
                        document.querySelectorAll('[class*="fixed"][class*="inset-0"]').forEach(el => el.remove());
                    }""")
                except:
                    pass
                page.wait_for_timeout(1000)
        
        browser.close()
    
    with open('/tmp/motion_all_free_prompts.json', 'w') as f:
        json.dump(prompts_scraped, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"SCRAPING COMPLETE")
    print(f"  Success: {len(prompts_scraped)} prompts")
    print(f"  Failed:  {len(failed)} prompts")
    print(f"{'='*60}")
    
    if failed:
        print(f"\nFailed prompts:")
        for f_item in failed[:10]:
            print(f"  - {f_item['title']} ({f_item['id']}): {f_item['reason']}")
    
    # Stats
    if prompts_scraped:
        total_chars = sum(p['length'] for p in prompts_scraped)
        avg_chars = total_chars // len(prompts_scraped)
        print(f"\nStats:")
        print(f"  Total chars: {total_chars:,}")
        print(f"  Average per prompt: {avg_chars:,}")
        print(f"  Shortest: {min(p['length'] for p in prompts_scraped):,} chars")
        print(f"  Longest: {max(p['length'] for p in prompts_scraped):,} chars")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
