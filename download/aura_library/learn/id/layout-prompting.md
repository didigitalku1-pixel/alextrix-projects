# Layout Prompting

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
