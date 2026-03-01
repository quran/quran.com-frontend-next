# Donation Surfaces Pixel-Perfect Misses (Postmortem)

## Scope

Figma nodes used as source of truth:

- Mobile strip: `32437:268801`
- Desktop homepage strip: `32361:227384`
- Desktop reader inline chip row: `32437:267074`
- Mobile homepage card: `32437:268831`
- Desktop homepage card: `32437:267604`
- Reader floating card: `32437:267362`
- Reader placements: `32437:267073`, `32433:263405`, `32437:270006`, `32437:270404`

## What Was Missed Initially

1. Desktop standalone strip height was implemented as `40px` instead of `45px`.
2. Mobile standalone strip horizontal padding was implemented as `10px` instead of `20px`.
3. Homepage/reader donation card used legacy i18n copy (`Monthly donations...`) instead of Figma
   copy (`Monthly donors...`), causing extra wrapping and incorrect card heights.
4. Close icon visual size was oversized (`20px` icon inside 32px hit area) vs Figma icon rendering.
5. Reader desktop floating offset was `bottom: 16px` instead of `15px`.
6. Sepia strip token mapping was off (`... -> #124245`) instead of the Figma sepia variant gradient
   (`... -> #d8b677`) and CTA chip styling.
7. Homepage mobile card still rendered ~`1.86px` too tall due inherited `1.4` description
   line-height (`19.6px` on 14px text) instead of Figma-matching `19px`.
8. Title line-box sizing was not explicit per layout mode; desktop inline and floating variants
   needed explicit title line-height to hit the exact card heights.
9. Desktop standalone strip layout was left on `justify-content: space-between`, which incorrectly
   split copy and CTA to the edges instead of centering the group.
10. Desktop light strip style applied `background-image: none` at tablet breakpoint, removing the
    Figma gradient.
11. Global theme files were changed unnecessarily for donation sizing, instead of keeping the
    implementation component-scoped.
12. An incorrect sepia override forced the homepage inline CTA to blue on desktop, diverging from
    the Figma sepia desktop card/button color.
13. Homepage standalone desktop strip reused the reader desktop copy key
    (`Contribute to our mission`) instead of using the homepage month-of-Quran message.

## Why It Happened

1. The first pass matched structure and behavior but did not enforce a strict value-by-value
   acceptance checklist per node.
2. Old translation keys were reused for convenience, which silently changed line wrapping and
   therefore dimensions.
3. Some values were inferred from nearby surfaces instead of being taken directly from the exact
   node variant.
4. Visual verification was performed, but not with a per-property runtime measurement table before
   sign-off.
5. Shared typography defaults were allowed to cascade into Figma-locked surfaces without
   route/layout-specific overrides.
6. Desktop-specific strip behavior was inferred from mobile behavior, so centering/gradient
   differences were missed in the homepage desktop variant.
7. Global theme variables were edited for convenience instead of using local semantic variables in
   component styles.
8. The implementation assumed sepia CTA color should be unified across breakpoints without a locked
   variant matrix for homepage desktop vs homepage mobile.
9. Copy mapping was validated by component-level key presence, not by a strict route+variant copy
   matrix.

## Fixes Applied

1. Updated desktop strip height token to `45px`.
2. Updated mobile standalone strip horizontal padding to `20px` (desktop remains `10px`).
3. Added and switched to `fundraising-card-v2` i18n keys with exact Figma copy.
4. Adjusted donation CTA sizing and close icon sizing to match node metrics.
5. Updated reader floating desktop bottom offset to `15px`.
6. Corrected sepia donation strip tokens to match the Figma variant.
7. Set homepage mobile inline description line-height to `var(--line-height-large)` (`19px`) to land
   the card at ~`350x183`.
8. Set layout-specific title line-heights:
   - desktop inline: `var(--line-height-jumbo)` (`36px`) for exact `1230x163`
   - floating: `1.2` for exact floating card heights (`370x194/195`)
9. Changed standalone strip layout to center on desktop and keep left-aligned text with CTA
   separation on mobile only.
10. Removed desktop light override that disabled strip gradient and restored theme-token gradients
    for all themes.
11. Reverted global theme-file edits and moved donation-specific sizing to local semantic variables
    in component/page styles.
12. Removed the incorrect homepage inline sepia CTA override and returned sepia CTA color control to
    theme-surface tokens until variant mapping is explicitly locked.
13. Split top-strip copy selection by variant and route so homepage standalone uses the
    month-of-Quran message and reader desktop inline chip keeps `Contribute to our mission`.

## Guardrails Added

1. Route-by-route, breakpoint-by-breakpoint Playwright measurement checks against Figma values
   before finalizing.
2. Dedicated i18n keys for Figma-locked copy to avoid accidental wrapping regressions.
3. Token-first sizing with semantic CSS variables for donation surfaces.
4. This postmortem is now a required reference for future donation-surface iterations.
5. Any text block that drives card height must have explicit line-height in the target layout mode
   (`inline` vs `floating`) before sign-off.
6. Desktop strip sign-off now requires explicit checks for alignment mode (`centered group` vs
   `edge split`) and gradient visibility in light/dark/sepia.
