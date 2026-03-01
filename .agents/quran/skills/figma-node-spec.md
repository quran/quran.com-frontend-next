# Figma Node Spec Playbook

Use this playbook to convert Figma nodes into implementation-ready specs for this repo.

## When to Use

- Design-to-code tasks requiring exact spacing/typography/colors.
- Any work where desktop/mobile/theme variants must match specific node IDs.

## Inputs

- Figma file key + node IDs.
- Route context (`homepage`, `quran-reader`, etc.).
- Breakpoint and theme matrix.

## Extraction Sequence (Required)

1. `get_design_context(fileKey, nodeId)`
2. `get_screenshot(fileKey, nodeId)`
3. `get_variable_defs(fileKey, nodeId)`

If output is too large:

1. `get_metadata(fileKey, nodeId)` to discover child node IDs.
2. Re-run extraction on the child nodes only.

## Build the Node Spec

For each node, create a compact spec with:

- **Geometry:** width/height, padding, gap, radius, shadow.
- **Typography:** font family, size, weight, line-height.
- **Color model:** surface/background, text, icon, button states.
- **Behavior:** placement mode, responsive behavior, dismiss rules.
- **Stacking:** z-index target and interactions with fixed/sticky layers.

Also capture an explicit **variant lock row** for each route + breakpoint + theme combination in
scope:

- Route (`homepage`, `reader`, etc.)
- Breakpoint (`mobile`, `desktop`)
- Theme (`light`, `dark`, `sepia`)
- Visual mode checks (alignment mode, gradient usage, text wrapping mode)
- Exact source node ID (do not leave implicit)
- Screenshot reference captured from that exact node
- Critical color fields captured explicitly (surface start/end, CTA bg/fg, text/icon colors)

If a variant row is missing or conflicts with another selected node:

- Mark the row as unresolved.
- Do not infer from another breakpoint/theme row.
- Resolve node selection first, then implement.

## Repo Mapping Rules

1. Map to existing tokens in `src/styles/*` first.
2. If no equivalent token exists, add a semantic CSS variable in theme files:
   - `src/styles/themes/_light.scss`
   - `src/styles/themes/_dark.scss`
   - `src/styles/themes/_sepia.scss`
3. Avoid repeating raw pixel values across components.
4. Keep route logic centralized (`src/utils/routes.ts`) for shared UI mode decisions.
5. Do not change `src/styles/_theme.scss` or `src/styles/theme.scss` for feature-local UI matching;
   use component-level theme mixins and existing theme tokens.
6. If copy is Figma-locked and affects line breaks/heights, add dedicated i18n keys instead of
   reusing legacy strings.
7. Do not assume “same surface” implies same colors across desktop/mobile; color contracts are
   variant-specific unless source nodes prove equality.

## Validation Rules

- Compare implementation screenshots to node screenshots (target <= 1px tolerance).
- Validate route + breakpoint + theme matrix before finalizing.
- Re-check stacking with navbar/context/sidebar overlays whenever fixed/floating UI is added.
- Validate desktop and mobile behavior independently; do not infer one from the other.
- Validate gradient presence and alignment mode explicitly, not just approximate visual similarity.
- For text-driven cards/chips/strips, validate explicit line-height and measured final container
  height.
- Validate critical color props from computed styles against the locked node for each matrix row.
- If a quick fix touches one variant, re-run validation on sibling variants (desktop/mobile +
  light/dark/sepia) before sign-off.
