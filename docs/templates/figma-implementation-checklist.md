# Figma Implementation Checklist

## 1) Scope

- [ ] Ticket / feature:
- [ ] Figma file URL:
- [ ] Node IDs in scope:
- [ ] Routes in scope:
- [ ] Breakpoints in scope:
- [ ] Themes in scope:
- [ ] Related postmortem reviewed (`docs/figma-pixel-perfect-misses.md`)

## 2) Node Contract Table

| Node | Surface | Screenshot captured | Variables captured | Notes |
| ---- | ------- | ------------------- | ------------------ | ----- |
|      |         |                     |                    |       |

## 2.1) Variant Lock Matrix (Required Before Coding)

| Route | Breakpoint | Theme | Locked node ID | Screenshot reference | Status |
| ----- | ---------- | ----- | -------------- | -------------------- | ------ |
|       |            |       |                |                      |        |

- [ ] No unresolved rows in matrix.
- [ ] No row relies on inferred values from another row.
- [ ] If any row is missing in Figma, fallback decision is explicitly documented and approved.

## 3) Token Mapping

| Property | Figma value | Existing token | New semantic var (if needed) | Final value |
| -------- | ----------- | -------------- | ---------------------------- | ----------- |
|          |             |                |                              |             |

## 3.1) Theme and Variable Discipline

- [ ] Feature-local sizing/colors use component or module semantic vars first.
- [ ] Feature-specific theme values are component-local first (`@include theme.light/dark/sepia`).
- [ ] `src/styles/_theme.scss` unchanged (unless explicitly approved).
- [ ] `src/styles/theme.scss` unchanged (unless explicitly approved).
- [ ] Promotion to global theme files is done only when values are reused across multiple product
      surfaces and explicitly approved.

## 4) Behavior Contract

- [ ] Route variants defined (`homepage` vs `reader`)
- [ ] Breakpoint variants defined (`mobile` vs `desktop`)
- [ ] Theme behavior defined (`light`, `dark`, `sepia`)
- [ ] Dismiss persistence scope defined
- [ ] Analytics events defined
- [ ] Desktop alignment mode defined (`centered group` vs `edge split`)
- [ ] Mobile alignment mode defined
- [ ] Gradient contract defined (direction + stops) per theme
- [ ] CTA color contract defined per variant row (no cross-row assumptions)
- [ ] Copy source locked to dedicated i18n keys (if wrapping-sensitive)
- [ ] Explicit line-height defined for text blocks that drive surface height

## 5) Implementation Order

- [ ] Header strip
- [ ] Navbar row/chip
- [ ] Card surface
- [ ] Floating placement / stacking
- [ ] i18n updates

## 6) Validation

- [ ] Visual diff: mobile light
- [ ] Visual diff: mobile dark
- [ ] Visual diff: mobile sepia
- [ ] Visual diff: desktop light
- [ ] Visual diff: desktop dark
- [ ] Visual diff: desktop sepia
- [ ] Interaction regression: drawer/context/sidebar layering
- [ ] Interaction regression: hidden-navbar transforms
- [ ] Playwright verification run on homepage route (`/`)
- [ ] Playwright verification run on reader route (`/2` or in-scope reader route)

## 6.1) Runtime Measurement Table

| Surface / Node | Property | Figma value | Runtime measured value | Delta | Pass |
| -------------- | -------- | ----------- | ---------------------- | ----- | ---- |
|                |          |             |                        |       |      |

Required properties per row:

- [ ] Surface gradient start/end + angle
- [ ] CTA background + text color
- [ ] Key dimensions (height, width, radius)
- [ ] Typography (size + line-height) for text controlling container height

## 6.2) Critical Visual Gates

- [ ] Strip/chip/card alignment mode matches node exactly.
- [ ] Gradient is present where expected (not flattened by breakpoint/theme overrides).
- [ ] Text wraps to the same lines as Figma.
- [ ] CTA chip/button dimensions and icon sizing match node.
- [ ] Any change for one variant was re-validated on sibling variants (mobile/desktop and
      light/dark/sepia).

## 7) Documentation

- [ ] Updated `docs/ui-stacking-analysis.md` (if needed)
- [ ] Added/updated workflow docs (if needed)
- [ ] Linked PR notes to node IDs and screenshots
- [ ] If any miss was discovered/fixed, appended to `docs/figma-pixel-perfect-misses.md`
