# UI Element Stacking Analysis

This document provides a comprehensive visual analysis of how UI elements stack on top of each other
across different states in the Quran.com frontend application.

## Z-Index Hierarchy (from theme.scss)

| Layer                | Z-Index | Components Using It            |
| -------------------- | ------- | ------------------------------ |
| `--z-index-min`      | -999    | -                              |
| `--z-index-default`  | 1       | ContextMenu sections container |
| `--z-index-sticky`   | 300     | ContextMenu, SidebarNavigation |
| `--z-index-header`   | 400     | Navbar container               |
| `--z-index-overlay`  | 500     | -                              |
| `--z-index-dropdown` | 600     | -                              |
| `--z-index-spinner`  | 700     | -                              |
| `--z-index-modal`    | 800     | -                              |

## Key Components

### 1. **Navbar** (`z-index: 400`)

- Fixed position at top of viewport
- Contains Banner + NavbarBody
- Transforms upward (`translateY(-navbar-container-height)`) when hidden (scrolling down)
- On mobile, the hidden transform also accounts for banner height

### 2. **ContextMenu** (`z-index: 300`) - _Only appears on QuranReader pages_

- Fixed position, transforms to sit below Navbar when visible
- Contains surah info, reading progress bar, and navigation toggle
- Does NOT exist on homepage

### 3. **SidebarNavigation** (`z-index: 300`)

- Fixed position, starts at top of viewport
- Transforms vertically to position below Navbar/ContextMenu
- Can be in states: `true` (visible), `false` (hidden), `'auto'` (visible on desktop only)

## Height Variables

| Variable                    | Desktop                           | Mobile                            |
| --------------------------- | --------------------------------- | --------------------------------- |
| `$navbar-height`            | `var(--navbar-container-height)`  | `var(--navbar-container-height)`  |
| `$banner-height`            | `var(--banner-height)`            | `var(--banner-height)`            |
| `$sections-menu-height`     | `2.25rem`                         | `2.25rem`                         |
| `$progress-bar-height`      | `var(--spacing-micro)`            | `var(--spacing-micro)`            |
| `$top-menu-height-home`     | `$navbar-height`                  | `$navbar-height + $banner-height` |
| `$top-menu-height`          | `$sections + $navbar + $progress` | `+ $banner-height`                |
| `$context-menu-height-home` | `0`                               | (N/A - no context menu on home)   |
| `$context-menu-height`      | `$sections + $progress`           | `$sections + $progress + $banner` |

---

## STACKING DIAGRAMS

### Legend

```
┌─────────────────────────┐
│   Component Name        │  <- Rendered on screen
│   (z-index: XXX)        │
└─────────────────────────┘

╔═════════════════════════╗
║   Component Name        ║  <- Fixed/Sticky position
║   (z-index: XXX)        ║
╚═════════════════════════╝

┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│   Component (Hidden)    │  <- Off-screen / Hidden
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

▓▓▓ = Main page content scrolls beneath
```

---

## DESKTOP STATES

### 1. Desktop, Homepage, Scrolling UP, Sidebar CLOSED

When scrolling up, the navbar becomes visible. On homepage, there is NO ContextMenu.

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner] + [NavbarBody]                          ║
║              position: fixed, top: 0                          ║
╚═══════════════════════════════════════════════════════════════╝
│                                                               │
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓    HOMEPAGE CONTENT      ▓                   │
│               ▓    (scrollable area)     ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN (translateX(-100%) translateY($top-menu-height-home))
         Since $top-menu-height-home = $navbar-height, sidebar is positioned
         to appear right below navbar when opened.
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. ~~ContextMenu~~ (doesn't exist on homepage)
3. SidebarNavigation (z-index: 300) - off-screen left
4. Page Content (z-index: auto)

---

### 2. Desktop, Homepage, Scrolling DOWN, Sidebar CLOSED

When scrolling down, the navbar hides (transforms up by navbar height).

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│         NAVBAR (HIDDEN - transform: translateY(-100%))       │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓    HOMEPAGE CONTENT      ▓                   │
│               ▓    (scrollable area)     ▓                   │
│               ▓    Now visible from      ▓                   │
│               ▓    very top of screen    ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN (translateX(-100%) translateY($context-menu-height-home))
         $context-menu-height-home = 0 on homepage desktop
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above viewport
2. ~~ContextMenu~~ (doesn't exist on homepage)
3. SidebarNavigation (z-index: 300) - off-screen left
4. Page Content (z-index: auto)

---

### 3. Desktop, Homepage, Scrolling UP, Sidebar OPEN

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner] + [NavbarBody]                          ║
╚═══════════════════════════════════════════════════════════════╝
╔═══════════════════╗   ┌───────────────────────────────────────┐
║ SIDEBAR           ║   │                                       │
║ NAVIGATION        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ (z-index: 300)    ║   │    ▓    HOMEPAGE CONTENT ▓            │
║                   ║   │    ▓    (scrollable)     ▓            │
║ Transform:        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ translateY(       ║   │                                       │
║ $top-menu-height  ║   │                                       │
║ -home)            ║   │                                       │
║                   ║   │                                       │
║ = below navbar    ║   │                                       │
╚═══════════════════╝   └───────────────────────────────────────┘

The sidebar sits below the navbar thanks to:
  transform: translateY($top-menu-height-home)
  where $top-menu-height-home = var(--navbar-container-height)
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. SidebarNavigation (z-index: 300) - visible, positioned below navbar
3. Page Content (z-index: auto)

---

### 4. Desktop, Homepage, Scrolling DOWN, Sidebar OPEN

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│         NAVBAR (HIDDEN - translateY(-navbar-height))         │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
╔═══════════════════╗   ┌───────────────────────────────────────┐
║ SIDEBAR           ║   │                                       │
║ NAVIGATION        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ (z-index: 300)    ║   │    ▓    HOMEPAGE CONTENT ▓            │
║                   ║   │    ▓    (scrollable)     ▓            │
║ Transform:        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ translateY(       ║   │                                       │
║ $context-menu-    ║   │                                       │
║ height-home)      ║   │                                       │
║ = 0               ║   │                                       │
║                   ║   │                                       │
║ Sidebar starts    ║   │                                       │
║ from top since    ║   │                                       │
║ navbar is hidden  ║   │                                       │
╚═══════════════════╝   └───────────────────────────────────────┘

Note: visibleContainerCollapsed uses transform: translateY($context-menu-height-home)
      On homepage, $context-menu-height-home = 0, so sidebar starts at viewport top
      But spaceOnTopCollapsed uses translateY($top-menu-height-home) to push content down
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above
2. SidebarNavigation (z-index: 300) - visible, starting near top
3. Page Content (z-index: auto)

---

### 5. Desktop, QuranReader, Scrolling UP, Sidebar CLOSED

On QuranReader pages, the ContextMenu appears below the Navbar.

**Shows: Navbar (Banner Center) + Context Menu**

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner Center] + [NavbarBody]                   ║
╠═══════════════════════════════════════════════════════════════╣
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Surah Info] [Reading Mode] [Page #]             ║
║              transform: translateY(navbar-height)             ║
╠═══════════════════════════════════════════════════════════════╣
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓   QURAN READER CONTENT   ▓                   │
│               ▓   (Verses/Translations)  ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN (translateX(-100%) translateY($top-menu-height))
         $top-menu-height = $sections-menu-height + $navbar-height + $progress-bar-height
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. ContextMenu (z-index: 300) - positioned below navbar via translateY
3. SidebarNavigation (z-index: 300) - off-screen left
4. Page Content (z-index: auto)

---

### 6. Desktop, QuranReader, Scrolling DOWN, Sidebar CLOSED

**Shows: Context Menu**

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│         NAVBAR (HIDDEN - translateY(-navbar-height))         │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
╔═══════════════════════════════════════════════════════════════╗
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Surah Info] [Reading Mode] [Page #]             ║
║              transform: (no longer has navbar offset)         ║
║              Now sits at the very top of viewport             ║
╠═══════════════════════════════════════════════════════════════╣
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓   QURAN READER CONTENT   ▓                   │
│               ▓   (Verses/Translations)  ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN (translateX(-100%) translateY($top-menu-height))
         Uses $top-menu-height even when collapsed to prevent vertical jump
         during open/close animation
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above
2. ContextMenu (z-index: 300) - now at top of viewport
3. SidebarNavigation (z-index: 300) - off-screen left
4. Page Content (z-index: auto)

---

### 7. Desktop, QuranReader, Scrolling UP, Sidebar OPEN

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner] + [NavbarBody]                          ║
╠═══════════════════════════════════════════════════════════════╣
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Surah ▼] [Reading Mode] [Page #]                ║
╠═══════════════════════════════════════════════════════════════╣
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
╔═══════════════════╗   ┌───────────────────────────────────────┐
║ SIDEBAR           ║   │                                       │
║ NAVIGATION        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ (z-index: 300)    ║   │    ▓  QURAN READER CONTENT ▓          │
║                   ║   │    ▓  (Verses/Translations)▓          │
║ Transform:        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ translateY(       ║   │                                       │
║ $top-menu-height) ║   │                                       │
║                   ║   │                                       │
║ Aligned below     ║   │                                       │
║ context menu      ║   │                                       │
╚═══════════════════╝   └───────────────────────────────────────┘

$top-menu-height = $sections-menu-height + $navbar-height + $progress-bar-height
Sidebar appears right below the full header stack
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. ContextMenu (z-index: 300) - below navbar
3. SidebarNavigation (z-index: 300) - visible, below context menu
4. Page Content (z-index: auto)

---

### 8. Desktop, QuranReader, Scrolling DOWN, Sidebar OPEN

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│         NAVBAR (HIDDEN - translateY(-navbar-height))         │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
╔═══════════════════════════════════════════════════════════════╗
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Surah ▼] [Reading Mode] [Page #]                ║
╠═══════════════════════════════════════════════════════════════╣
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
╔═══════════════════╗   ┌───────────────────────────────────────┐
║ SIDEBAR           ║   │                                       │
║ NAVIGATION        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ (z-index: 300)    ║   │    ▓  QURAN READER CONTENT ▓          │
║                   ║   │    ▓  (Verses/Translations)▓          │
║ Transform:        ║   │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
║ translateY(       ║   │                                       │
║ $context-menu-    ║   │                                       │
║ height)           ║   │                                       │
║                   ║   │                                       │
║ = below context   ║   │                                       │
║   menu only       ║   │                                       │
╚═══════════════════╝   └───────────────────────────────────────┘

visibleContainerCollapsed uses: translateY($context-menu-height)
$context-menu-height = $sections-menu-height + $progress-bar-height
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above
2. ContextMenu (z-index: 300) - at top of viewport
3. SidebarNavigation (z-index: 300) - visible, below context menu
4. Page Content (z-index: auto)

---

## MOBILE STATES

### Key Differences on Mobile:

1. Banner height is included in transform calculations (banner is not absolute on mobile)
2. Navbar hidden transform includes banner height:
   `transform: translate3d(0, calc(-1 * (navbar-height + banner-height)), 0)`
3. Sidebar uses full viewport height (`block-size: 100vh`)

---

### 9. Mobile, Homepage, Scrolling UP, Sidebar CLOSED

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner]                                         ║
║              [NavbarBody - hamburger menu, logo, etc]         ║
╚═══════════════════════════════════════════════════════════════╝
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓    HOMEPAGE CONTENT      ▓                   │
│               ▓    (scrollable area)     ▓                   │
│               ▓    Touch-optimized       ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN to the left
         translateX(-100%) translateY($top-menu-height-home-mobile)
         $top-menu-height-home-mobile = $navbar-height + $banner-height
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. SidebarNavigation (z-index: 300) - off-screen left
3. Page Content (z-index: auto)

---

### 10. Mobile, Homepage, Scrolling DOWN, Sidebar CLOSED

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│ NAVBAR (HIDDEN - translateY(-(navbar + banner)))              │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓    HOMEPAGE CONTENT      ▓                   │
│               ▓    (scrollable area)     ▓                   │
│               ▓    Full screen now       ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN
         inVisibleContainerCollapsed on homepage mobile:
         translateX(-100%) translateY($top-menu-height-home-mobile)
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above
2. SidebarNavigation (z-index: 300) - off-screen left
3. Page Content (z-index: auto)

---

### 11. Mobile, Homepage, Scrolling UP, Sidebar OPEN

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner]                                         ║
║              [NavbarBody]                                     ║
╚═══════════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════════╗
║                   SIDEBAR NAVIGATION                          ║
║                   (z-index: 300)                              ║
║                                                               ║
║   ┌─────────────────────────────────────────────────────────┐ ║
║   │  [Surah] [Verse] [Juz] [Page]  [X]                      │ ║
║   │  ─────────────────────────────                          │ ║
║   │  1. Al-Fatihah                                          │ ║
║   │  2. Al-Baqarah                                          │ ║
║   │  3. Ali 'Imran                                          │ ║
║   │  ...                                                    │ ║
║   │                                                         │ ║
║   └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║   Transform: translateY($top-menu-height-home-mobile)         ║
║   = navbar-height + banner-height                             ║
║   block-size: 100vh (fills to bottom)                         ║
╚═══════════════════════════════════════════════════════════════╝

On mobile, sidebar takes ~full width (100% - 1.5 * spacing-mega)
and covers most of the screen. Uses outsideClickDetector to close.
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. SidebarNavigation (z-index: 300) - covers content, below navbar
3. Page Content (z-index: auto) - hidden behind sidebar

---

### 12. Mobile, Homepage, Scrolling DOWN, Sidebar OPEN

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│ NAVBAR (HIDDEN - translateY(-(navbar + banner)))              │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
╔═══════════════════════════════════════════════════════════════╗
║                   SIDEBAR NAVIGATION                          ║
║                   (z-index: 300)                              ║
║                                                               ║
║   ┌─────────────────────────────────────────────────────────┐ ║
║   │  [Surah] [Verse] [Juz] [Page]  [X]                      │ ║
║   │  ─────────────────────────────                          │ ║
║   │  1. Al-Fatihah                                          │ ║
║   │  2. Al-Baqarah                                          │ ║
║   │  3. Ali 'Imran                                          │ ║
║   │  ...                                                    │ ║
║   │                                                         │ ║
║   └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║   visibleContainerCollapsed on homepage mobile:               ║
║   translateY($top-menu-height-home-mobile)                    ║
║   (Uses same transform as expanded to prevent vertical jump)  ║
║   block-size: 100vh                                           ║
╚═══════════════════════════════════════════════════════════════╝

Note: On mobile homepage when scrolled down, sidebar still uses
$top-menu-height-home-mobile to maintain position consistency
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above
2. SidebarNavigation (z-index: 300) - visible, starts near top
3. Page Content (z-index: auto) - hidden behind sidebar

---

### 13. Mobile, QuranReader, Scrolling UP, Sidebar CLOSED

**Shows: Banner, Navbar, Context Menu Section, Mobile Reading Mode Tabs**

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner]                                         ║
║              [NavbarBody]                                     ║
╠═══════════════════════════════════════════════════════════════╣
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Context Menu Section]                           ║
║              [Mobile Reading Mode Tabs]                       ║
║              transform: translateY(navbar + banner)           ║
╠═════════════════════════════════════════════════════════════  ║
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓   QURAN READER CONTENT   ▓                   │
│               ▓   (Touch scroll verses)  ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN
         translateX(-100%) translateY($top-menu-height-mobile)
         $top-menu-height-mobile = $sections + $navbar + $progress + $banner
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. ContextMenu (z-index: 300)
3. SidebarNavigation (z-index: 300) - off-screen left
4. Page Content (z-index: auto)

---

### 14. Mobile, QuranReader, Scrolling DOWN, Sidebar CLOSED

**Shows: Context Menu Page Info, Context Menu Section, Progress Bar**

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│ NAVBAR (HIDDEN - translateY(-(navbar + banner)))              │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
╔═══════════════════════════════════════════════════════════════╗
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Context Menu Page Info]                         ║
║              [Context Menu Section]                           ║
║              Stays visible at top of screen!                  ║
╠═══════════════════════════════════════════════════════════════╣
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
│                                                               │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│               ▓   QURAN READER CONTENT   ▓                   │
│               ▓   (Touch scroll verses)  ▓                   │
│               ▓   More screen space now  ▓                   │
│               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Sidebar: OFF-SCREEN
         inVisibleContainerCollapsed:
         translateX(-100%) translateY($top-menu-height-mobile)
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above
2. ContextMenu (z-index: 300) - at top of viewport
3. SidebarNavigation (z-index: 300) - off-screen left
4. Page Content (z-index: auto)

---

### 15. Mobile, QuranReader, Scrolling UP, Sidebar OPEN

```
╔═══════════════════════════════════════════════════════════════╗
║                     NAVBAR (z-index: 400)                     ║
║              [Banner]                                         ║
║              [NavbarBody]                                     ║
╠═══════════════════════════════════════════════════════════════╣
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Al-Fatihah ▲]              [Page 1]             ║
╠═══════════════════════════════════════════════════════════════╣
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════════╗
║                   SIDEBAR NAVIGATION                          ║
║                   (z-index: 300)                              ║
║                                                               ║
║   ┌─────────────────────────────────────────────────────────┐ ║
║   │  [Surah] [Verse] [Juz] [Page]  [X]                      │ ║
║   │  ─────────────────────────────                          │ ║
║   │  1. Al-Fatihah  ◄── current                             │ ║
║   │  2. Al-Baqarah                                          │ ║
║   │  3. Ali 'Imran                                          │ ║
║   │  ...                                                    │ ║
║   └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║   translateY($top-menu-height-mobile)                         ║
║   = $sections + $navbar + $progress + $banner                 ║
║   Positioned right below context menu progress bar            ║
╚═══════════════════════════════════════════════════════════════╝

Note: The sidebar chevron in context menu rotates 180° when open
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400)
2. ContextMenu (z-index: 300) - below navbar
3. SidebarNavigation (z-index: 300) - visible, below context menu, same z-index but positioned lower
4. Page Content (z-index: auto) - hidden behind sidebar

---

### 16. Mobile, QuranReader, Scrolling DOWN, Sidebar OPEN

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│ NAVBAR (HIDDEN - translateY(-(navbar + banner)))              │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
╔═══════════════════════════════════════════════════════════════╗
║                  CONTEXT MENU (z-index: 300)                  ║
║              [Al-Fatihah ▲]              [Page 1]             ║
╠═══════════════════════════════════════════════════════════════╣
║                    [PROGRESS BAR]                             ║
╚═══════════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════════╗
║                   SIDEBAR NAVIGATION                          ║
║                   (z-index: 300)                              ║
║                                                               ║
║   ┌─────────────────────────────────────────────────────────┐ ║
║   │  [Surah] [Verse] [Juz] [Page]  [X]                      │ ║
║   │  ─────────────────────────────                          │ ║
║   │  1. Al-Fatihah  ◄── current                             │ ║
║   │  2. Al-Baqarah                                          │ ║
║   │  3. Ali 'Imran                                          │ ║
║   │  ...                                                    │ ║
║   └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║   visibleContainerCollapsed on QuranReader mobile:            ║
║   translateY($context-menu-height-mobile)                     ║
║   = $sections + $progress + $banner                           ║
║   Sidebar adjusts position to stay below context menu         ║
╚═══════════════════════════════════════════════════════════════╝
```

**Stacking Order (front to back):**

1. Navbar (z-index: 400) - off-screen above
2. ContextMenu (z-index: 300) - at top of viewport
3. SidebarNavigation (z-index: 300) - visible, below context menu
4. Page Content (z-index: auto) - hidden behind sidebar

---

## Summary Table

| State                                                | Navbar        | ContextMenu       | Sidebar               | Content |
| ---------------------------------------------------- | ------------- | ----------------- | --------------------- | ------- |
| **Desktop Homepage, Scroll Up, Sidebar Closed**      | Visible (400) | N/A               | Hidden left (300)     | Visible |
| **Desktop Homepage, Scroll Down, Sidebar Closed**    | Hidden (400)  | N/A               | Hidden left (300)     | Visible |
| **Desktop Homepage, Scroll Up, Sidebar Open**        | Visible (400) | N/A               | Visible (300)         | Visible |
| **Desktop Homepage, Scroll Down, Sidebar Open**      | Hidden (400)  | N/A               | Visible (300)         | Visible |
| **Desktop QuranReader, Scroll Up, Sidebar Closed**   | Visible (400) | Visible (300)     | Hidden left (300)     | Visible |
| **Desktop QuranReader, Scroll Down, Sidebar Closed** | Hidden (400)  | Visible top (300) | Hidden left (300)     | Visible |
| **Desktop QuranReader, Scroll Up, Sidebar Open**     | Visible (400) | Visible (300)     | Visible (300)         | Visible |
| **Desktop QuranReader, Scroll Down, Sidebar Open**   | Hidden (400)  | Visible top (300) | Visible (300)         | Visible |
| **Mobile Homepage, Scroll Up, Sidebar Closed**       | Visible (400) | N/A               | Hidden left (300)     | Visible |
| **Mobile Homepage, Scroll Down, Sidebar Closed**     | Hidden (400)  | N/A               | Hidden left (300)     | Visible |
| **Mobile Homepage, Scroll Up, Sidebar Open**         | Visible (400) | N/A               | Visible fullish (300) | Hidden  |
| **Mobile Homepage, Scroll Down, Sidebar Open**       | Hidden (400)  | N/A               | Visible fullish (300) | Hidden  |
| **Mobile QuranReader, Scroll Up, Sidebar Closed**    | Visible (400) | Visible (300)     | Hidden left (300)     | Visible |
| **Mobile QuranReader, Scroll Down, Sidebar Closed**  | Hidden (400)  | Visible top (300) | Hidden left (300)     | Visible |
| **Mobile QuranReader, Scroll Up, Sidebar Open**      | Visible (400) | Visible (300)     | Visible fullish (300) | Hidden  |
| **Mobile QuranReader, Scroll Down, Sidebar Open**    | Hidden (400)  | Visible top (300) | Visible fullish (300) | Hidden  |

---

## Transform Values Summary

### Desktop

| State                                | Component       | Transform                                                    |
| ------------------------------------ | --------------- | ------------------------------------------------------------ |
| Navbar Visible                       | **Navbar**      | `none`                                                       |
| Navbar Hidden                        | **Navbar**      | `translate3d(0, -navbar-height, 0)`                          |
| ContextMenu w/ Navbar                | **ContextMenu** | `translate3d(0, navbar-height, 0)`                           |
| ContextMenu w/o Navbar               | **ContextMenu** | `none` (sits at top)                                         |
| Sidebar Visible + Navbar (Home)      | **Sidebar**     | `translateY(navbar-height)`                                  |
| Sidebar Visible + No Navbar (Home)   | **Sidebar**     | `translateY(0)`                                              |
| Sidebar Visible + Navbar (Reader)    | **Sidebar**     | `translateY(sections + navbar + progress)`                   |
| Sidebar Visible + No Navbar (Reader) | **Sidebar**     | `translateY(sections + progress)`                            |
| Sidebar Hidden + Navbar (Reader)     | **Sidebar**     | `translateX(-100%) translateY(sections + navbar + progress)` |
| Sidebar Hidden + No Navbar (Reader)  | **Sidebar**     | `translateX(-100%) translateY(sections + navbar + progress)` |

### Mobile

| State                                | Component       | Transform                                           |
| ------------------------------------ | --------------- | --------------------------------------------------- |
| Navbar Visible                       | **Navbar**      | `none`                                              |
| Navbar Hidden                        | **Navbar**      | `translate3d(0, -(navbar + banner), 0)`             |
| ContextMenu w/ Navbar                | **ContextMenu** | `translate3d(0, navbar + banner, 0)`                |
| Sidebar Visible + Navbar (Home)      | **Sidebar**     | `translateY(navbar + banner)`                       |
| Sidebar Visible + No Navbar (Home)   | **Sidebar**     | `translateY(navbar + banner)` (same, prevents jump) |
| Sidebar Visible + Navbar (Reader)    | **Sidebar**     | `translateY(sections + navbar + progress + banner)` |
| Sidebar Visible + No Navbar (Reader) | **Sidebar**     | `translateY(sections + progress + banner)`          |

---

## Key Implementation Notes

1. **ContextMenu only exists on QuranReader pages** - It's not rendered on the homepage at all.

2. **Same z-index (300) for ContextMenu and Sidebar** - They don't overlap because sidebar is
   positioned to start below the context menu via `translateY()`.

3. **Mobile sidebar uses 100vh height** - This ensures it always reaches the bottom of the viewport.

4. **Sidebar uses consistent Y transform even when hidden** - The `inVisibleContainerCollapsed`
   mixin uses `$top-menu-height` instead of `$context-menu-height` to prevent vertical jumping
   during the horizontal open/close animation.

5. **RTL support** - All transforms have RTL equivalents that swap `translateX(-100%)` to
   `translateX(100%)`.

6. **Banner behavior differs** - On desktop, banner is part of navbar but uses absolute positioning.
   On mobile, banner contributes to the layout flow, so transforms must account for banner height.

---

## Guide: Adding/Removing the Donation Banner

The donation banner significantly impacts the mobile layout because it contributes to the layout
flow on mobile devices (unlike desktop where it uses absolute positioning). When adding or removing
the banner, you must update multiple files to ensure the UI stacking works correctly.

### Files That Need Modification

| File                                                                         | Purpose                                 |
| ---------------------------------------------------------------------------- | --------------------------------------- |
| `src/components/Navbar/Navbar.tsx`                                           | Add/remove Banner component             |
| `src/components/Navbar/Navbar.module.scss`                                   | Navbar hidden transform for mobile      |
| `src/components/QuranReader/ContextMenu.module.scss`                         | ContextMenu position relative to navbar |
| `src/components/QuranReader/QuranReader.module.scss`                         | Content padding on mobile               |
| `src/components/QuranReader/SidebarNavigation/SidebarNavigation.module.scss` | Sidebar positioning                     |
| `src/pages/index.module.scss`                                                | Homepage content padding on mobile      |
| `src/pages/contentPage.module.scss`                                          | Content page padding on mobile          |
| `src/styles/variables.scss`                                                  | CSS variable for banner-active class    |

---

### ➕ ADDING the Donation Banner

Follow these steps when enabling the donation banner:

#### Step 1: Add Banner to Navbar (`Navbar.tsx`)

```tsx
import Banner from '../Banner/Banner';
import useTranslation from 'next-translate/useTranslation';

const Navbar = () => {
  const { t } = useTranslation('common');
  // ... existing code ...

  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !showNavbar })}>
        <Banner text={t('fundraising.donation-campaign.text')} shouldShowPrefixIcon={false} />
        <NavbarBody />
      </nav>
    </>
  );
};
```

#### Step 2: Update Navbar Hidden Transform (`Navbar.module.scss`)

Add mobile-specific transform that includes banner height:

```scss
.hiddenNav {
  transform: translate3d(0, calc(-1 * var(--navbar-container-height)), 0);
  @include breakpoints.smallerThanTablet {
    transform: translate3d(
      0,
      calc(-1 * (var(--navbar-container-height) + var(--banner-height))),
      0
    );
  }
}
```

#### Step 3: Update ContextMenu Position (`ContextMenu.module.scss`)

Add banner height to mobile transform:

```scss
.containerVisible {
  transform: translate3d(0, var(--navbar-container-height), 0);
  @include breakpoints.smallerThanTablet {
    transform: translate3d(0, calc(var(--navbar-container-height) + var(--banner-height)), 0);
  }
}
```

#### Step 4: Update QuranReader Padding (`QuranReader.module.scss`)

Add banner height to mobile padding:

```scss
.container {
  @include breakpoints.smallerThanTablet {
    padding-block-start: calc($quran-reader-padding-mobile + var(--banner-height));
  }
  // ... rest
}
```

#### Step 5: Update SidebarNavigation (`SidebarNavigation.module.scss`)

Add `$banner-height` variable and update mobile height calculations:

```scss
$banner-height: var(--banner-height);

// Mobile heights (include banner height since banner is not absolute on mobile)
$top-menu-height-home-mobile: calc($navbar-height + $banner-height);
$top-menu-height-mobile: calc(
  $sections-menu-height + $navbar-height + $progress-bar-height + $banner-height
);
$context-menu-height-mobile: calc($sections-menu-height + $progress-bar-height + $banner-height);
```

Also update homepage collapsed states to use `$context-menu-height-home` (which is 0) instead of
`$top-menu-height-home`:

```scss
// In @mixin sidebarInvisibleCollapsed
&[data-is-homepage='true'] {
  transform: translateX(-100%) translateY($context-menu-height-home);
  // ... mobile uses $top-menu-height-home-mobile
}

// In .visibleContainerCollapsed
&[data-is-homepage='true'] {
  transform: translateY($context-menu-height-home);
  // ... mobile uses $top-menu-height-home-mobile
}

// In .containerAutoCollapsed
&[data-is-homepage='true'] {
  transform: translateY($context-menu-height-home);
  // ...
}
```

#### Step 6: Update Homepage Padding (`index.module.scss`)

Add mobile padding for banner:

```scss
.pageContainer {
  @include breakpoints.smallerThanTablet {
    padding-block-start: var(--banner-height);
  }
  // ... rest
}
```

#### Step 7: Update Content Page Padding (`contentPage.module.scss`)

Add tablet/mobile padding for banner:

```scss
// Inside .container
@include breakpoints.smallerThanDesktop {
  padding-block-start: var(--banner-height);
  inline-size: 90%;
}
```

#### Step 8: Add Banner-Active Class (`variables.scss`)

Add the dynamic class that adjusts navbar container height:

```scss
.banner-active {
  --banner-height: 3rem;
  --navbar-container-height: calc(var(--navbar-height) + var(--banner-height));

  @include breakpoints.tablet {
    --banner-height: var(--navbar-height);
    --navbar-container-height: var(--navbar-height);
  }
}
```

---

### ➖ REMOVING the Donation Banner

Follow these steps when disabling the donation banner:

#### Step 1: Remove Banner from Navbar (`Navbar.tsx`)

```tsx
// Remove these imports:
// import Banner from '../Banner/Banner';
// import useTranslation from 'next-translate/useTranslation';

const Navbar = () => {
  // Remove: const { t } = useTranslation('common');

  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !showNavbar })}>
        {/* Remove: <Banner text={...} /> */}
        <NavbarBody />
      </nav>
    </>
  );
};
```

#### Step 2: Simplify Navbar Hidden Transform (`Navbar.module.scss`)

Remove mobile-specific transform:

```scss
.hiddenNav {
  transform: translate3d(0, calc(-1 * var(--navbar-container-height)), 0);
  // Remove the @include breakpoints.smallerThanTablet block
}
```

#### Step 3: Simplify ContextMenu Position (`ContextMenu.module.scss`)

Remove banner height from mobile transform:

```scss
.containerVisible {
  transform: translate3d(0, var(--navbar-container-height), 0);
  @include breakpoints.smallerThanTablet {
    transform: translate3d(0, var(--navbar-container-height), 0);
  }
}
```

#### Step 4: Simplify QuranReader Padding (`QuranReader.module.scss`)

Remove banner height from mobile padding:

```scss
.container {
  @include breakpoints.smallerThanTablet {
    padding-block-start: $quran-reader-padding-mobile;
  }
  // ... rest
}
```

#### Step 5: Simplify SidebarNavigation (`SidebarNavigation.module.scss`)

Remove `$banner-height` variable and simplify mobile heights:

```scss
// Remove: $banner-height: var(--banner-height);

// Mobile heights (same as desktop now that banner is removed)
$top-menu-height-home-mobile: $navbar-height;
$top-menu-height-mobile: calc($sections-menu-height + $navbar-height + $progress-bar-height);
$context-menu-height-mobile: calc($sections-menu-height + $progress-bar-height);
```

**IMPORTANT**: Update homepage collapsed states to use `$top-menu-height-home` instead of
`$context-menu-height-home` to prevent vertical jumping during sidebar animations:

```scss
// In @mixin sidebarInvisibleCollapsed
&[data-is-homepage='true'] {
  // Use $top-menu-height-home to match visible state transform and prevent
  // vertical movement during the sidebar open/close animation.
  transform: translateX(-100%) translateY($top-menu-height-home);
  // ...
}

// In .visibleContainerCollapsed
&[data-is-homepage='true'] {
  // Use $top-menu-height-home to match visible state and prevent vertical
  // jumping when navbar collapses while sidebar is open.
  transform: translateY($top-menu-height-home);
  // ...
}

// In .containerAutoCollapsed
&[data-is-homepage='true'] {
  // Use $top-menu-height-home to match visible state and prevent vertical jumping.
  transform: translateY($top-menu-height-home);
  // ...
}
```

#### Step 6: Remove Homepage Padding (`index.module.scss`)

Remove mobile padding block:

```scss
.pageContainer {
  // Remove the @include breakpoints.smallerThanTablet block
  padding-block-end: var(--spacing-small);
  // ... rest
}
```

#### Step 7: Remove Content Page Padding (`contentPage.module.scss`)

Remove banner padding:

```scss
// Inside .container
@include breakpoints.smallerThanDesktop {
  // Remove: padding-block-start: var(--banner-height);
  inline-size: 90%;
}
```

#### Step 8: Remove Banner-Active Class (`variables.scss`)

Remove the `.banner-active` class entirely:

```scss
// Remove the entire .banner-active block
```

---

### Testing Checklist

After making changes, verify the following scenarios:

#### Mobile Testing

- [ ] Homepage: No gap at top of page
- [ ] Homepage: Sidebar opens flush with navbar (no gap)
- [ ] Homepage: Scrolling down hides navbar smoothly
- [ ] Homepage: Sidebar closes with purely horizontal animation (no vertical jump)
- [ ] QuranReader: ContextMenu sits directly below navbar
- [ ] QuranReader: Sidebar opens below ContextMenu (no gap)
- [ ] QuranReader: Scrolling down hides navbar, ContextMenu stays at top
- [ ] QuranReader: Sidebar adjusts position when navbar hides/shows

#### Desktop Testing

- [ ] Homepage: Sidebar opens correctly
- [ ] Homepage: Sidebar closes with horizontal animation only
- [ ] QuranReader: All components stack correctly
- [ ] QuranReader: Navbar collapse/expand doesn't cause sidebar jumping

#### RTL Testing

- [ ] All of the above work correctly in RTL mode (sidebar opens from right)
