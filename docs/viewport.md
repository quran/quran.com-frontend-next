# Viewport Units: dvh vs vh

## The Problem with `vh`

The `vh` (viewport height) unit represents 1% of the viewport's height. However, on mobile browsers,
`vh` doesn't account for dynamic browser UI elements like the address bar.

```
┌─────────────────────────────┐
│ ░░░░░ Address Bar ░░░░░░░░ │  ← Browser UI
├─────────────────────────────┤
│                             │
│                             │
│    100vh includes this      │
│    BUT the address bar      │
│    covers part of it!       │
│                             │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ ░░░░ Navigation Bar ░░░░░░ │  ← Browser UI
└─────────────────────────────┘
```

When the user scrolls and the address bar collapses:

```
┌─────────────────────────────┐
│                             │
│                             │
│    Now 100vh is correct     │
│    but the layout already   │
│    calculated with the      │
│    wrong height!            │
│                             │
│                             │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

## The Solution: `dvh`

The `dvh` (dynamic viewport height) unit dynamically adjusts based on whether the browser UI is
visible or hidden.

### Large Viewport Height (`lvh`)

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│     100lvh = Maximum        │
│     viewport height         │
│     (UI collapsed)          │
│                             │
│                             │
│                             │
│                             │
│                             │
└─────────────────────────────┘
        ↑ 100lvh ↑
```

### Small Viewport Height (`svh`)

```
┌─────────────────────────────┐
│ ░░░░░ Address Bar ░░░░░░░░ │
├─────────────────────────────┤
│                             │
│     100svh = Minimum        │
│     viewport height         │
│     (UI expanded)           │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ ░░░░ Navigation Bar ░░░░░░ │
└─────────────────────────────┘
        ↑ 100svh ↑
```

### Dynamic Viewport Height (`dvh`)

```
┌─────────────────────────────┐              ┌─────────────────────────────┐
│ ░░░░░ Address Bar ░░░░░░░░ │              │                             │
├─────────────────────────────┤              │                             │
│                             │              │                             │
│                             │   SCROLL     │                             │
│       100dvh = svh          │  ───────►    │       100dvh = lvh          │
│   (adapts dynamically)      │              │   (adapts dynamically)      │
│                             │              │                             │
│                             │              │                             │
├─────────────────────────────┤              │                             │
│ ░░░░ Navigation Bar ░░░░░░ │              │                             │
└─────────────────────────────┘              └─────────────────────────────┘
     UI Expanded State                            UI Collapsed State
```

## Comparison Table

| Unit  | Behavior                         | Best For                             |
| ----- | -------------------------------- | ------------------------------------ |
| `vh`  | Fixed to initial viewport height | Desktop-only layouts                 |
| `svh` | Always uses smallest viewport    | Headers, fixed elements              |
| `lvh` | Always uses largest viewport     | Full-page backgrounds                |
| `dvh` | Dynamically adjusts              | Mobile-friendly full-height sections |

## Recommendation

For mobile-responsive layouts that need to fill the full viewport height, **prefer `dvh`** over
`vh`:

```css
/* ❌ Avoid */
.full-height {
  height: 100vh;
}

/* ✅ Prefer */
.full-height {
  height: 100dvh;
}

/* ✅ With fallback for older browsers */
.full-height {
  height: 100vh;
  height: 100dvh;
}
```

## Browser Support

`dvh`, `svh`, and `lvh` are supported in all modern browsers (Chrome 108+, Firefox 101+, Safari
15.4+).
