#!/usr/bin/env python3
"""
Post-process all 13 learn HTML files:
1. Replace aura.build branding (logo, SIGN IN, header nav, footer links)
2. Fix internal links (sidebar href → /learn/<slug> pattern)
3. Add click interceptor script for sidebar navigation via postMessage
4. Replace footer with our own footer

Usage: python3 scripts/post_process_learn_html.py
"""
import re
import os
from pathlib import Path

LEARN_DIR = Path("public/learn-data")

# Our branding replacements
OLD_LOGO_SVG = '<img src="/logo-aura.svg"'
NEW_LOGO_SVG = '<div style="width:28px;height:28px;border-radius:6px;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">A</div>'

OLD_NAV_LINKS = [
    ('href="/create"', 'href="/"'),
    ('href="/browse/components"', 'href="/?tab=templates"'),
    ('href="/browse"', 'href="/?tab=templates"'),
    ('href="/components"', 'href="/?tab=components"'),
    ('href="/assets"', 'href="/?tab=assets"'),
    ('href="/skills"', 'href="/?tab=skills"'),
    ('href="/design-systems"', 'href="/design-systems"'),
    ('href="/learn/introduction"', 'href="/learn/introduction"'),
    ('href="/pricing"', 'href="/"'),
    ('href="/signin"', 'href="/"'),
]

# Click interceptor script — handles sidebar navigation
CLICK_SCRIPT = """
<script>
// Intercept all link clicks inside iframe for sidebar navigation
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href]');
  if (!link) return;
  var href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
    // Allow same-page hash links (video sections)
    if (href && href.startsWith('#')) return;
    e.preventDefault();
    return;
  }
  // For internal navigation links, send to parent
  e.preventDefault();
  if (href.startsWith('/learn/')) {
    // Navigate parent to /learn/<slug>
    parent.postMessage({ type: 'learn-navigate', href: href }, '*');
  } else {
    // Navigate parent to other pages
    parent.postMessage({ type: 'learn-navigate', href: href }, '*');
  }
});
</script>
"""

# Parent listener script — added to the page.tsx (not here, but referenced)
# The parent page already has the iframe, we just need to add the listener

def process_file(filepath):
    """Process one HTML file."""
    html = filepath.read_text("utf-8")
    original = html

    # 1. Replace logo
    if OLD_LOGO_SVG in html:
        html = html.replace(OLD_LOGO_SVG, NEW_LOGO_SVG + '<!-- logo replaced -->')
    # Also replace any img with src containing logo-aura
    html = re.sub(r'<img[^>]*src="[^"]*logo-aura[^"]*"[^>]*/?>', NEW_LOGO_SVG, html)

    # 2. Replace nav links
    for old, new in OLD_NAV_LINKS:
        html = html.replace(old, new)

    # 3. Remove "SIGN IN" text/button
    html = re.sub(r'<a[^>]*>SIGN\s*IN</a>', '', html, flags=re.IGNORECASE)

    # 4. Remove "PRICING" nav item
    html = re.sub(r'<a[^>]*href="/"[^>]*>\s*PRICING\s*</a>', '', html, flags=re.IGNORECASE)

    # 5. Replace "CREATE" nav item (link to /)
    html = re.sub(r'<a[^>]*href="/"[^>]*>\s*CREATE\s*</a>', '', html, flags=re.IGNORECASE)

    # 6. Fix sidebar learn links — convert /learn/<slug> to work via postMessage
    # Already handled by click interceptor script above

    # 7. Replace footer — find footer and replace with our own
    our_footer = '''
<div style="background:#0a0a0a;color:#999;padding:48px 24px;margin-top:80px;">
  <div style="max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;flex-wrap:wrap;gap:32px;">
    <div>
      <div style="width:28px;height:28px;border-radius:6px;background:#fff;color:#000;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;margin-bottom:12px;">A</div>
      <p style="font-size:13px;color:#666;max-width:300px;">Personal library of 54,996 web design templates, components, assets, and skills.</p>
    </div>
    <div style="display:flex;gap:48px;flex-wrap:wrap;">
      <div>
        <h4 style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin:0 0 8px;">PRODUCT</h4>
        <a href="/?tab=templates" style="display:block;font-size:13px;color:#999;text-decoration:none;margin-bottom:4px;">Templates</a>
        <a href="/?tab=components" style="display:block;font-size:13px;color:#999;text-decoration:none;margin-bottom:4px;">Components</a>
        <a href="/?tab=assets" style="display:block;font-size:13px;color:#999;text-decoration:none;margin-bottom:4px;">Assets</a>
        <a href="/?tab=skills" style="display:block;font-size:13px;color:#999;text-decoration:none;margin-bottom:4px;">Skills</a>
        <a href="/design-systems" style="display:block;font-size:13px;color:#999;text-decoration:none;">DESIGN.MD</a>
      </div>
      <div>
        <h4 style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin:0 0 8px;">RESOURCES</h4>
        <a href="/learn/introduction" style="display:block;font-size:13px;color:#999;text-decoration:none;margin-bottom:4px;">Introduction</a>
        <a href="/learn/video-tutorials" style="display:block;font-size:13px;color:#999;text-decoration:none;margin-bottom:4px;">Video Tutorials</a>
        <a href="/learn/documentation" style="display:block;font-size:13px;color:#999;text-decoration:none;margin-bottom:4px;">Documentation</a>
        <a href="/learn/faq" style="display:block;font-size:13px;color:#999;text-decoration:none;">FAQ</a>
      </div>
    </div>
  </div>
  <div style="max-width:1280px;margin:24px auto 0;padding-top:24px;border-top:1px solid #222;font-size:12px;color:#555;">
    © 2026 Aura Library. All rights reserved.
  </div>
</div>
'''

    # Replace existing footer (aura.build footer)
    html = re.sub(r'<footer[\s\S]*?</footer>', our_footer, html, flags=re.IGNORECASE)

    # Also handle case where footer is a div with footer class
    html = re.sub(r'<div[^>]*class="[^"]*footer[^"]*"[\s\S]*?(?=<div[^>]*class="[^"]*container|$)', '', html, flags=re.IGNORECASE)

    # 8. Add click interceptor script before </body>
    if '</body>' in html:
        html = html.replace('</body>', CLICK_SCRIPT + '\n</body>')
    else:
        html += CLICK_SCRIPT

    # 9. Remove any remaining aura.build external links (Twitter, YouTube, etc in footer)
    # Already handled by footer replacement above

    # 10. Fix "View all videos" link
    html = html.replace('href="/learn/video-tutorials"', 'href="/learn/video-tutorials"')

    # 11. Remove "Annual promo" banner if present
    html = re.sub(r'<a[^>]*>Annual promo[^<]*</a>', '', html)

    # 12. Remove "Watch video" link that points to /learn/introduction (redundant)
    # Keep it — it's valid navigation

    if html != original:
        filepath.write_text(html, "utf-8")
        return True
    return False


def main():
    if not LEARN_DIR.exists():
        print(f"❌ Directory not found: {LEARN_DIR}")
        return

    files = sorted(LEARN_DIR.glob("*.html"))
    print(f"📂 Found {len(files)} HTML files to process")
    print()

    processed = 0
    for f in files:
        changed = process_file(f)
        status = "✅ updated" if changed else "⏭️  no changes"
        print(f"  {status}: {f.name}")
        if changed:
            processed += 1

    print(f"\n✅ Processed {processed}/{len(files)} files")


if __name__ == "__main__":
    main()
