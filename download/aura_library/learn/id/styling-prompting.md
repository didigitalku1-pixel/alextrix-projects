# Styling Prompting

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
