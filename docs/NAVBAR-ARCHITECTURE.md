# Navbar Architecture Reference

Technical documentation for the Quran.com navbar system, including all components, variants, state
management, and CSS variables.

---

## Table of Contents

1. [Component Hierarchy](#1-component-hierarchy)
2. [Screen Size Breakpoints](#2-screen-size-breakpoints)
3. [CSS Variables](#3-css-variables)
4. [Redux State](#4-redux-state)
5. [Component Details](#5-component-details)
6. [Behavioral Logic](#6-behavioral-logic)
7. [Route Configuration](#7-route-configuration)

---

## 1. Component Hierarchy

```
AppContent (wrapper with .bannerActive class)
├── Navbar
│   ├── emptySpacePlaceholder (reserves space)
│   └── nav.container
│       └── NavbarBody
│           ├── bannerContainerTop (mobile only, < 768px)
│           │   └── Banner
│           ├── itemsContainer
│           │   ├── NavbarLogoWrapper
│           │   ├── bannerContainerCenter (desktop only, >= 768px)
│           │   │   └── Banner
│           │   ├── ProfileAvatarButton
│           │   ├── SearchButton → SearchDrawer
│           │   ├── SidebarNavigation (dynamic import)
│           │   ├── MenuButton → NavigationDrawer
│           │   └── SettingsDrawer
│           └── [dimmed overlay pseudo-element]
│
├── contentContainer
│   └── Page Component
│       └── QuranReader (on reader routes)
│           ├── ContextMenu
│           │   ├── sectionsContainer
│           │   │   ├── ChapterNavigation
│           │   │   ├── PageInfo
│           │   │   └── ReadingPreferenceSwitcher
│           │   ├── MobileReadingTabs (mobile + navbar visible)
│           │   ├── TajweedBar (when Tajweed mushaf selected)
│           │   └── ProgressBar
│           ├── SidebarNavigation (left)
│           ├── QuranReaderView
│           └── Notes (right sidebar)
│
├── AudioPlayer (fixed bottom)
└── Footer
```

---

## 2. Screen Size Breakpoints

### Breakpoint Definitions

| Name       | Min Width | SCSS Mixin            | CSS Media Query       |
| ---------- | --------- | --------------------- | --------------------- |
| Mobile S   | 320px     | `breakpoints.mobileS` | `(min-width: 320px)`  |
| Mobile M   | 375px     | `breakpoints.mobileM` | `(min-width: 375px)`  |
| Mobile L   | 425px     | `breakpoints.mobileL` | `(min-width: 425px)`  |
| **Tablet** | **768px** | `breakpoints.tablet`  | `(min-width: 768px)`  |
| Desktop    | 1024px    | `breakpoints.desktop` | `(min-width: 1024px)` |

### Inverse Breakpoints

| Name                    | Max Width | SCSS Mixin                       |
| ----------------------- | --------- | -------------------------------- |
| Smaller than Mobile S   | 320px     | `breakpoints.smallerThanMobileS` |
| Smaller than Mobile M   | 375px     | `breakpoints.smallerThanMobileM` |
| Smaller than Mobile L   | 425px     | `breakpoints.smallerThanMobileL` |
| **Smaller than Tablet** | **768px** | `breakpoints.smallerThanTablet`  |
| Smaller than Desktop    | 1024px    | `breakpoints.smallerThanDesktop` |

### Critical Breakpoint: 768px

The tablet breakpoint (768px) is the primary divider for navbar behavior:

| Behavior            | < 768px (Mobile) | >= 768px (Desktop) |
| ------------------- | ---------------- | ------------------ |
| Banner position     | Above navbar     | Centered in navbar |
| Banner adds height  | Yes (+3rem)      | No                 |
| MobileReadingTabs   | Visible          | Hidden             |
| Context menu layout | Condensed        | Full               |

---

## 3. CSS Variables

### Variable Definitions

**File:** `src/styles/variables.scss`

```scss
:root {
  --navbar-height: 3.6rem;
  --context-menu-container-height: 3rem;
  --mobile-reading-mode-tabs-height: 3.25rem;
  --navbar-container-height: var(--navbar-height);
  --banner-height: 3rem;
}
```

### Dynamic Variable States

**File:** `src/styles/global.scss`

```scss
.bannerActive {
  // Mobile (< 768px): Banner adds extra height
  --navbar-container-height: calc(var(--navbar-height) + var(--banner-height));

  @include breakpoints.tablet {
    // Desktop (>= 768px): Banner inside navbar, no extra height
    --banner-height: var(--navbar-height);
    --navbar-container-height: var(--navbar-height);
  }
}
```

### Variable Usage Map

| Variable                            | Used By                                                             | Purpose                       |
| ----------------------------------- | ------------------------------------------------------------------- | ----------------------------- |
| `--navbar-height`                   | Navbar container, Drawer header                                     | Base navbar height            |
| `--navbar-container-height`         | Placeholder, hidden transform, Context menu, Sidebar, Notes, Drawer | Total height including banner |
| `--banner-height`                   | Banner container, height calculations                               | Banner height                 |
| `--context-menu-container-height`   | Context menu, Sidebar position                                      | Context menu height           |
| `--mobile-reading-mode-tabs-height` | MobileReadingTabs, QuranReader padding                              | Mobile tabs height            |

### Files Using `--navbar-container-height`

| File                            | Usage                                                               |
| ------------------------------- | ------------------------------------------------------------------- |
| `Navbar.module.scss`            | `.emptySpacePlaceholder`, `.hiddenNav` transform                    |
| `Drawer.module.scss`            | `.searchContainer`, `.bodyContainer`, `.header`, `.navbarInvisible` |
| `ContextMenu.module.scss`       | `.visibleContainer` transform                                       |
| `SidebarNavigation.module.scss` | `$navbar-height` variable, multiple transforms                      |
| `Notes.module.scss`             | `.container` padding-top                                            |

---

## 4. Redux State

### 4.1 Navbar Slice

**File:** `src/redux/slices/navbar.ts`

```typescript
type Navbar = {
  isVisible: boolean; // Scroll-based visibility
  isNavigationDrawerOpen: boolean; // Navigation drawer state
  isSearchDrawerOpen: boolean; // Search drawer state
  isSettingsDrawerOpen: boolean; // Settings drawer state
  settingsView: SettingsView; // Current settings tab
  disableSearchDrawerTransition: boolean;
  lockVisibilityState: boolean; // Lock during tab switch
};
```

### 4.2 Banner Slice

**File:** `src/redux/slices/banner.ts`

```typescript
type BannerState = {
  isBannerVisible: boolean; // Banner visibility
};
```

### 4.3 Context Menu Slice

**File:** `src/redux/slices/QuranReader/contextMenu.ts`

```typescript
type ContextMenu = {
  isExpanded: boolean; // Expanded state
  showReadingPreferenceSwitcher: boolean; // Show preference toggle
};
```

### 4.4 Sidebar Navigation Slice

**File:** `src/redux/slices/QuranReader/sidebarNavigation.ts`

```typescript
type SidebarNavigation = {
  isVisible: boolean | 'auto'; // Visibility state
  selectedNavigationItem: string; // surah/juz/page/hizb/verse
};
```

### 4.5 Notes Slice

**File:** `src/redux/slices/QuranReader/notes.ts`

```typescript
type Notes = {
  isVisible: boolean; // Notes sidebar visibility
};
```

---

## 5. Component Details

### 5.1 Navbar (`Navbar.tsx`)

**Props:** None (uses Redux)

**Key Logic:**

- Uses `useDebounceNavbarVisibility` hook (150ms debounce)
- Passes `isBannerVisible` to NavbarBody
- Renders placeholder div for layout space

**Classes:**

- `.emptySpacePlaceholder` - Reserves space for fixed navbar
- `.container` - Fixed position navbar
- `.hiddenNav` - Transform up to hide

### 5.2 NavbarBody (`NavbarBody/index.tsx`)

**Props:**

```typescript
interface Props {
  isBannerVisible: boolean;
}
```

**Key Logic:**

- Renders Banner in two locations (top for mobile, center for desktop)
- Applies `.dimmed` class when navigation drawer open
- Manages sidebar navigation lifecycle

**Conditional Rendering:**

- `bannerContainerTop` - Only when `isBannerVisible` (hidden on tablet+)
- `bannerContainerCenter` - Only when `isBannerVisible` (hidden below tablet)
- `SidebarNavigation` - Only on Quran reader routes

### 5.3 Banner (`Banner.tsx`)

**Props:**

```typescript
interface BannerProps {
  text: string;
  ctaButtonText?: string;
}
```

**Key Logic:**

- CTA navigates to `/reading-goal` or `/reading-goal/progress` based on user state
- Logs click events

### 5.4 ContextMenu (`ContextMenu/index.tsx`)

**Props:** None (uses Redux and hooks)

**Key Logic:**

- Uses `useContextMenuState` hook for all state
- Renders differently based on `showNavbar` and `isMobile()`
- Shows TajweedBar only for `Mushaf.QCFTajweedV4`

**Conditional Rendering:**

- Mobile scrolled view: Only PageInfo
- Mobile with navbar: MobileReadingTabs
- Desktop: Full layout with all sections

### 5.5 TajweedBar (`TajweedBar.tsx`)

**Props:** None

**Key Logic:**

- Collapsible color legend
- Uses local state for expand/collapse
- Translates up/down based on `showTajweedBar`

**Visibility:** Only when `mushaf === Mushaf.QCFTajweedV4`

### 5.6 MobileReadingTabs (`MobileReadingTabs.tsx`)

**Props:**

```typescript
interface MobileReadingTabsProps {
  t: (key: string) => string;
}
```

**Key Logic:**

- Switches between Translation/Reading modes
- Locks navbar visibility during switch
- Uses scroll restoration

**Visibility:** Only on mobile (< 768px) when navbar is visible

---

## 6. Behavioral Logic

### 6.1 Scroll Behavior

**File:** `src/components/GlobalScrollListener.tsx`

```
Scroll Down (> 50px):
  → setIsExpanded(false)
  → setIsVisible(false) [if not locked]

Scroll Up (>= 0):
  → setIsExpanded(true)
  → setIsVisible(true) [if not locked]

Scroll Down (> 150px):
  → setShowReadingPreferenceSwitcher(true)

Scroll Up (<= 150px):
  → setShowReadingPreferenceSwitcher(false)
```

### 6.2 Visibility Debounce

**File:** `src/hooks/useDebounceNavbarVisibility.ts`

- 150ms delay before visibility changes
- Prevents flickering during rapid scroll
- Onboarding active forces visibility

### 6.3 Dimmed Overlay

**File:** `src/styles/_utility.scss`

```scss
@mixin dimmedOverlay($position: fixed) {
  position: relative;

  &::before {
    content: '';
    position: $position; // fixed or absolute
    inset: 0;
    background-color: var(--color-background-backdrop);
    opacity: 0;
    pointer-events: none;
    z-index: var(--z-index-smaller-modal);
  }

  &.dimmed::before {
    opacity: var(--opacity-50);
    pointer-events: auto;
  }
}
```

**Usage:**

- `itemsContainer` - `dimmedOverlay(absolute)`
- `bannerContainerTop` - `dimmedOverlay(absolute)`
- `contentContainer` - `dimmedOverlay` (default: fixed)

---

## 7. Route Configuration

### 7.1 Quran Reader Routes (Context Menu Visible)

```typescript
const QURAN_READER_ROUTES = new Set([
  '/[chapterId]',
  '/[chapterId]/[verseId]',
  '/hizb/[hizbId]',
  '/juz/[juzId]',
  '/page/[pageId]',
  '/rub/[rubId]',
]);
```

### 7.2 Auth Routes (No Navbar)

```typescript
// Routes where navbar is hidden
- /login
- /auth
- /logout
- /forgot-password
- /reset-password
- /complete-signup
```

### 7.3 Route → Component Matrix

| Route Pattern            | Navbar | Banner | Context Menu | Sidebar Nav |
| ------------------------ | ------ | ------ | ------------ | ----------- |
| `/`                      | Yes    | Yes    | No           | No          |
| `/[chapterId]`           | Yes    | Yes    | Yes          | Available   |
| `/[chapterId]/[verseId]` | Yes    | Yes    | Yes          | Available   |
| `/page/[pageId]`         | Yes    | Yes    | Yes          | Available   |
| `/juz/[juzId]`           | Yes    | Yes    | Yes          | Available   |
| `/hizb/[hizbId]`         | Yes    | Yes    | Yes          | Available   |
| `/rub/[rubId]`           | Yes    | Yes    | Yes          | Available   |
| `/search`                | Yes    | Yes    | No           | No          |
| `/profile`               | Yes    | Yes    | No           | No          |
| `/reciters/*`            | Yes    | Yes    | No           | No          |
| `/login`, `/auth`        | No     | No     | No           | No          |

---

## Appendix: File Locations

| Component            | Path                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| AppContent           | `src/components/AppContent/AppContent.tsx`                                |
| Navbar               | `src/components/Navbar/Navbar.tsx`                                        |
| NavbarBody           | `src/components/Navbar/NavbarBody/index.tsx`                              |
| Banner               | `src/components/Banner/Banner.tsx`                                        |
| NavigationDrawer     | `src/components/Navbar/NavigationDrawer/NavigationDrawer.tsx`             |
| SearchDrawer         | `src/components/Navbar/SearchDrawer/SearchDrawer.tsx`                     |
| SettingsDrawer       | `src/components/Navbar/SettingsDrawer/SettingsDrawer.tsx`                 |
| ContextMenu          | `src/components/QuranReader/ContextMenu/index.tsx`                        |
| TajweedBar           | `src/components/QuranReader/TajweedBar/TajweedBar.tsx`                    |
| MobileReadingTabs    | `src/components/QuranReader/ContextMenu/components/MobileReadingTabs.tsx` |
| SidebarNavigation    | `src/components/QuranReader/SidebarNavigation/SidebarNavigation.tsx`      |
| Notes                | `src/components/QuranReader/Notes/Notes.tsx`                              |
| GlobalScrollListener | `src/components/GlobalScrollListener.tsx`                                 |

---

## Appendix: Theme Support

The navbar supports three themes:

- **Light** - Default light colors
- **Dark** - Dark mode colors
- **Sepia** - Warm sepia tones

Theme affects:

- Background colors (`--color-background-elevated`)
- Text colors (`--color-text-default`)
- Border colors (`--color-borders-hairline`)
- Backdrop color (`--color-background-backdrop`)
- TajweedBar color mappings (light-_, dark-_, sepia-\*)

---

## Appendix: Mushaf Types

```typescript
export enum Mushaf {
  QCFV2 = 1,
  QCFV1 = 2,
  Indopak = 3,
  UthmaniHafs = 4,
  KFGQPCHAFS = 5,
  Indopak15Lines = 6,
  Indopak16Lines = 7,
  Tajweed = 11,
  QCFTajweedV4 = 19, // Only this shows TajweedBar
}
```
