---
description:
  Convert Figma nodes into implementation-ready specs, token mappings, and validation steps for
  pixel-accurate delivery.
---

# Figma → Implementation Workflow

## Goal

Turn selected Figma nodes into shippable UI with minimal rework:

1. Extract exact node values and screenshots.
2. Map values to existing repo tokens first.
3. Isolate unmatched values as semantic CSS variables.
4. Implement by UI surface group, not by page.
5. Validate each group with screenshot diff + behavior checks.

Recent donation-surface regressions are now mandatory guardrails for this workflow. See:

- `docs/figma-pixel-perfect-misses.md`

## Input Contract

- One or more Figma URLs with explicit `node-id`.
- Target route + breakpoint matrix (`homepage` vs `reader`, `mobile` vs `desktop`).
- Theme matrix (`light`, `dark`, `sepia`).
- Interaction contract (placement, dismiss rules, analytics events).

## Output Contract

- Updated components and SCSS with token-first values.
- New semantic variables only where no token exists.
- `docs/templates/figma-implementation-checklist.md` filled for the feature.
- Updated stacking notes when fixed/sticky/floating behavior changes.

## Execution Steps

1. **Scope nodes**

   - Split into implementable groups:
     - `Header strip`
     - `Navbar row / chip`
     - `Donation card`
     - `Floating placement`

2. **Extract node data (MCP-first)**

   - For each group, run:
     - `get_design_context`
     - `get_screenshot`
     - `get_variable_defs`
   - Save references in a short node table before coding.
   - Build a required variant lock table before coding:
     - one row per `route + breakpoint + theme`
     - exact node ID for that row
     - screenshot artifact for that row
   - If a matrix row has no explicit node, mark it `missing` and stop inferring values until
     fallback is explicitly approved.

3. **Normalize to a UI contract**

   - For each value (size, spacing, radius, shadow, color):
     - Reuse existing token if equivalent.
     - If unmatched, add semantic variable in theme files.
   - Do not keep repeated raw pixel literals in component SCSS.
   - For size values used only by one surface, prefer local semantic variables in that
     component/module first.
   - For feature-specific theme colors/gradients, define local theme-scoped vars in the
     feature/module using `@include theme.light/dark/sepia`; only promote to `src/styles/themes/*`
     when reused across multiple product surfaces.
   - Never unify colors/typography across breakpoints or themes by assumption, even for the same
     surface, unless the variant lock table shows the same source node/value.

4. **Implement by group**

   - Ship one UI group at a time.
   - Keep route logic centralized (`src/utils/routes.ts`).
   - Keep stacking math in `src/styles/global.scss` and document any formula change.
   - Do not change `src/styles/_theme.scss` or `src/styles/theme.scss` for feature-local styling
     unless explicitly required by a cross-app theme contract.

5. **Validate**

   - Visual:
     - Compare implementation screenshots to Figma node screenshots.
     - Target <= 1px tolerance for spacing/alignment.
     - Validate alignment mode explicitly (`centered group` vs `edge split`) for each
       route+breakpoint variant.
     - Validate gradient presence/angle/stops explicitly for each theme variant.
     - Validate text wrapping and line-height for text blocks that determine container height.
     - For every matrix row, run runtime computed-style capture for critical props (surface
       gradient/colors, CTA colors, dimensions) and record it in the checklist measurement table.
     - If Figma data conflicts across selected nodes for the same matrix row, do not pick one ad
       hoc: flag conflict, attach screenshots/values, and resolve before code changes.
   - Behavioral:
     - Route/breakpoint variant behavior.
     - Dismiss persistence scope.
     - Drawer/context/sidebar layering and inert states.
   - Runtime checks must be done on real routes under local app URLs:
     - homepage (`/`)
     - reader (`/2` or another in-scope reader route)

6. **Finalize**
   - Update:
     - `docs/ui-stacking-analysis.md` (if stacking changed)
     - locale keys (if copy changed)
     - analytics event names (if surface changed)
   - If any mismatch was found and corrected, append the root cause and guardrail update in
     `docs/figma-pixel-perfect-misses.md`.

## Fast Rules

- Prefer existing tokens from `src/styles/*`.
- Add semantic vars only for true gaps.
- Keep feature-specific theme vars local to the feature/module first; promote globally only for
  proven cross-surface reuse.
- Never infer behavior from unrelated Figma frames.
- Keep feature parity with existing Redux persistence and analytics hooks.
- Do not reuse legacy i18n strings for Figma-locked text when wrapping/height can change; use
  dedicated keys.
- Desktop and mobile are separate contracts. Never copy layout behavior across breakpoints without
  explicit node evidence.
- Desktop and mobile may share structure while differing in color tokens. Treat colors as
  per-variant until proven equal by locked node evidence.
