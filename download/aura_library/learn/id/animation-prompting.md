# Animation Prompting

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
