#!/usr/bin/env python3
"""
Create placeholder markdown content for new learn pages:
- selling-templates
- typography-prompting
- styling-prompting
- animation-prompting
- layout-prompting

These pages are listed in aura.build sidebar but don't have content yet.
This script creates basic placeholder content in Bahasa Indonesia.
"""
from pathlib import Path

LEARN_DIR = Path("download/aura_library/learn/id")

PAGES = {
    "selling-templates.md": """# Menjual Template

Jual template yang Anda buat di Aura Build ke marketplace untuk mendapatkan penghasilan pasif.

## Persiapan

Sebelum menjual template, pastikan:

- Template sudah fully functional dan responsive
- Kode clean dan well-documented
- Tidak ada asset berlisensi yang melanggar hak cipta
- Template sudah di-test di berbagai browser

## Cara Mendaftar

1. Login ke akun Aura Build Anda
2. Buka halaman Creator Dashboard
3. Klik "Submit New Template"
4. Upload file template (.html)
5. Tambahkan screenshot dan deskripsi
6. Set harga (free, paid, atau subscription)
7. Submit untuk review

## Pricing Strategy

Pertimbangkan strategi pricing berikut:

- **Free**: Untuk build audience dan brand awareness
- **$5-$15**: Untuk simple templates (landing page tunggal)
- **$20-$50**: Untuk multi-page templates dengan komponen kompleks
- **$50+**: Untuk premium templates dengan custom animations dan integrasi

## Marketing

Setelah template di-approve, promosikan melalui:

- Social media (Twitter, Dribbble, Behance)
- Portfolio website Anda
- Community groups (Discord, Reddit)
- Email list

## Payouts

Pembayaran dilakukan setiap bulan via:
- PayPal
- Bank transfer
- Stripe

Minimum payout: $50
""",

    "typography-prompting.md": """# Typography Prompting

Pelajari cara prompt typography yang efektif di Aura Build untuk mendapatkan hasil yang profesional.

## Dasar Typography

Typography adalah salah satu elemen paling penting dalam design. Prompt yang baik harus specify:

- **Font family** (sans-serif, serif, monospace, display)
- **Font weights** (light, regular, medium, bold, black)
- **Font sizes** (heading scale, body text, captions)
- **Line height** (tight, normal, relaxed, loose)
- **Letter spacing** (tight, normal, wide)
- **Text transform** (uppercase, lowercase, capitalize)

## Contoh Prompt

### Modern SaaS Landing Page

```
Create a modern SaaS landing page with:
- Headings: Inter, weight 700, tight letter spacing
- Body: Inter, weight 400, 1.6 line height
- Captions: Inter, weight 500, uppercase, wide letter spacing
- Hero headline: 72px desktop, 48px mobile
- Section headings: 48px desktop, 32px mobile
- Body text: 18px desktop, 16px mobile
```

### Editorial Blog

```
Create an editorial blog layout with:
- Headings: Playfair Display, weight 600
- Body: Source Serif Pro, weight 400, 1.7 line height
- Pull quotes: Playfair Display italic, 32px
- Captions: Inter, weight 500, uppercase, 12px
```

## Font Pairing Tips

Kombinasi font yang bagus:

- **Inter + Inter**: Modern, clean, untuk SaaS
- **Playfair Display + Source Sans Pro**: Editorial, elegant
- **Space Grotesk + Inter**: Tech, futuristic
- **Bricolage Grotesque + Inter**: Creative, modern

## Common Mistakes

Hindari:

- Terlalu banyak font family (>3) — bikin berantakan
- Font size terlalu kecil (<14px) untuk body — susah dibaca
- Letter spacing terlalu tight untuk body — susah dibaca
- Text transform uppercase untuk paragraf panjang — susah dibaca
""",

    "styling-prompting.md": """# Styling Prompting

Pelajari cara prompt styling (colors, backgrounds, shadows, borders) untuk design yang polished.

## Color Palette

Saat prompt colors, specify:

- **Primary color** (brand color)
- **Secondary colors** (2-3 accent colors)
- **Neutral colors** (grays untuk text, backgrounds, borders)
- **Semantic colors** (success, warning, error, info)

### Contoh Prompt

```
Use a color palette with:
- Primary: #3B82F6 (blue-500)
- Secondary: #10B981 (emerald-500)
- Background: #FFFFFF
- Foreground: #0F172A (slate-900)
- Muted: #64748B (slate-500)
- Border: #E2E8F0 (slate-200)
```

## Backgrounds

Pilihan background styles:

- **Solid colors** — clean dan minimal
- **Gradients** — modern dan eye-catching
- **Patterns** — subtle texture
- **Images** — hero backgrounds dengan overlay

### Contoh Gradient Prompt

```
Hero section with:
- Background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%)
- Overlay: rgba(0,0,0,0.4) untuk readability
- Text color: white
```

## Shadows

Shadow hierarchy untuk depth:

- **sm**: `0 1px 2px rgba(0,0,0,0.05)` — subtle
- **md**: `0 4px 6px rgba(0,0,0,0.1)` — default
- **lg**: `0 10px 15px rgba(0,0,0,0.1)` — elevated cards
- **xl**: `0 20px 25px rgba(0,0,0,0.15)` — modals, popovers

## Borders

Border styles:

- **Solid**: default, untuk most cases
- **Dashed**: untuk placeholders, drafts
- **None + shadow**: modern, clean look
- **Rounded**: gunakan radius 4-12px untuk cards, 999px untuk pills

## Spacing

Konsisten dengan spacing scale (Tailwind):

- **4px** (1) — tight
- **8px** (2) — default small
- **16px** (4) — default medium
- **24px** (6) — default large
- **32px** (8) — section padding
- **64px** (16) — section separation
""",

    "animation-prompting.md": """# Animation Prompting

Pelajari cara prompt animations dan micro-interactions untuk design yang hidup.

## Types of Animations

- **Entrance animations** — saat element muncul (fade, slide, scale)
- **Hover animations** — saat user hover (lift, color change, underline)
- **Scroll animations** — saat user scroll (parallax, reveal)
- **Loading animations** — saat content loading (spinner, skeleton, shimmer)
- **Loop animations** — continuous (pulse, float, rotate)

## Prompt Examples

### Entrance Animation

```
Add entrance animations:
- Hero headline: fade-in + slide-up, 0.6s, ease-out, 0.1s delay
- Hero subtitle: fade-in + slide-up, 0.6s, ease-out, 0.2s delay
- CTA button: fade-in + scale, 0.4s, ease-out, 0.4s delay
- Use Intersection Observer for scroll-triggered animations
```

### Hover Micro-interaction

```
Card hover:
- Transform: translateY(-4px)
- Box shadow: 0 12px 24px rgba(0,0,0,0.1)
- Transition: 0.2s ease-out
- Image: scale(1.05) dengan overflow hidden pada parent
```

### Scroll Parallax

```
Background image parallax:
- Speed: 0.5 (background scroll half as fast as content)
- Use background-attachment: fixed
- Alternative: use transform: translate3d(0, scrollY * 0.5, 0)
```

## CSS Animation Properties

Specify dengan detail:

- **duration**: 0.1s - 2s (default 0.3s)
- **easing**: ease, ease-in, ease-out, ease-in-out, cubic-bezier()
- **delay**: 0s - 1s
- **iteration-count**: 1, infinite
- **direction**: normal, reverse, alternate
- **fill-mode**: none, forwards, backwards, both

## Performance Tips

- Gunakan `transform` dan `opacity` (GPU-accelerated)
- Hindari animate `width`, `height`, `top`, `left` (cause layout recalculation)
- Gunakan `will-change: transform` untuk elements yang akan di-animate
- Limit animations pada mobile (reduce motion)
- Test pada low-end devices

## Common Animations

```
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
""",

    "layout-prompting.md": """# Layout Prompting

Pelajari cara prompt layout yang efektif untuk berbagai jenis halaman.

## Layout Types

### Single Column
Cocok untuk: blog posts, articles, documentation
```
Single column layout:
- Max-width: 680px (untuk readability)
- Centered
- Padding: 24px mobile, 48px desktop
- Line height: 1.7 untuk body text
```

### Two Column (Sidebar + Content)
Cocok untuk: docs, dashboards, e-commerce
```
Two column layout:
- Sidebar: 256px fixed, sticky
- Content: flex-1, min-width 0
- Gap: 32px
- Mobile: stack vertically (sidebar collapsible)
```

### Three Column
Cocok untuk: dashboards kompleks, admin panels
```
Three column layout:
- Left sidebar: 240px (navigation)
- Main content: flex-1
- Right sidebar: 320px (details, metadata)
- Mobile: tabs atau drawer navigation
```

### Grid
Cocok untuk: galleries, card lists, product listings
```
Grid layout:
- Columns: 1 (mobile), 2 (tablet), 3 (desktop), 4 (large desktop)
- Gap: 24px
- Card aspect ratio: 4:3 atau 1:1
- Use CSS Grid: grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
```

## Responsive Breakpoints

Standard Tailwind breakpoints:

- **sm**: 640px (large phone)
- **md**: 768px (tablet)
- **lg**: 1024px (laptop)
- **xl**: 1280px (desktop)
- **2xl**: 1536px (large desktop)

## Prompt Examples

### Hero Section

```
Hero section layout:
- Full viewport height (min-height: 100vh)
- Centered content (flex, items-center, justify-center)
- Two-column on desktop (text + image), stack on mobile
- Padding: 80px top/bottom, 24px mobile, 48px desktop
- Background: gradient atau image dengan overlay
```

### Feature Grid

```
Features section:
- Section padding: 80px vertical
- Heading + subtitle (centered, max-width 680px)
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Card: padding 32px, border-radius 12px, border 1px
- Gap: 24px
- Icon: 48x48px, centered atau top-left
```

### Pricing Section

```
Pricing layout:
- 3 plans side-by-side (desktop)
- Middle plan: highlighted (scaled 1.05, different bg)
- Stack vertically on mobile
- Card: padding 32px, border-radius 16px
- CTA button: full-width
```

## Common Layout Mistakes

Hindari:

- Terlalu banyak columns di mobile — susah dibaca
- Fixed widths yang break pada small screens
- Inconsistent spacing antar sections
- Content terlalu lebar (>1200px) — susah dibaca
- No whitespace — terlihat cramped
""",
}

for filename, content in PAGES.items():
    path = LEARN_DIR / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"✓ Created {path}")

print(f"\n✅ Created {len(PAGES)} new learn pages")
