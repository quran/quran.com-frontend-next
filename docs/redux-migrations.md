# Migration 46 — Font Scale Remap

**Store version:** 46 (set in `src/redux/store.ts`) **Slice:** `quranReaderStyles` **Migration
script:** `src/redux/migration-scripts/remap-font-scale.ts` **Tests:**
`src/redux/migration-scripts/remap-font-scale.test.ts`, `src/redux/migrations.test.ts`

## Why

The SCSS `$scales-map` in `src/styles/_utility.scss` was refactored. The tablet font size values for
scales 6-10 shifted significantly, and a new `mobile-reading` breakpoint was added alongside the
existing `mobile` breakpoint. Without a migration, users who had persisted a `quranTextFontScale` of
6-9 would see a noticeably different (smaller) font size after the update.

## Affected Fonts

All 5 Quran fonts share the same remap table:

| Enum Value            | Font Key           |
| --------------------- | ------------------ |
| `QuranFont.QPCHafs`   | `qpc_uthmani_hafs` |
| `QuranFont.MadaniV1`  | `code_v1`          |
| `QuranFont.MadaniV2`  | `code_v2`          |
| `QuranFont.TajweedV4` | `tajweed_v4`       |
| `QuranFont.IndoPak`   | `text_indopak_*`   |

**Not affected:** `QuranFont.Uthmani` (`text_uthmani`) and `QuranFont.Tajweed` (legacy, no SCSS
scales).

## Remap Table

| Old Scale | New Scale | Action                     |
| --------- | --------- | -------------------------- |
| 1         | 1         | Unchanged                  |
| 2         | 2         | Unchanged                  |
| 3         | 3         | Unchanged                  |
| 4         | 4         | Unchanged                  |
| 5         | 5         | Unchanged                  |
| 6         | **7**     | Remapped                   |
| 7         | **9**     | Remapped                   |
| 8         | **10**    | Remapped                   |
| 9         | **10**    | Remapped                   |
| 10        | 10        | Unchanged (already at max) |

## Tablet Value Analysis

The remap was chosen to preserve the user's visual font size on tablet, where `vh` units make the
mapping deterministic. Below is the QPCHafs example (all fonts follow the same shift pattern):

| Old Scale | Old Tablet Value | New Scale | New Tablet Value | Match Quality   |
| --------- | ---------------- | --------- | ---------------- | --------------- |
| 1         | 3.2vh            | 1         | 3.2vh            | Exact           |
| 2         | 3.5vh            | 2         | 3.5vh            | Exact           |
| 3         | 4vh              | 3         | 4vh              | Exact           |
| 4         | 4vh              | 4         | 4.2vh            | ~Exact          |
| 5         | 4.4vh            | 5         | 4.4vh            | Exact           |
| 6         | 5.56vh           | **7**     | 5.56vh           | Exact           |
| 7         | 6.72vh           | **9**     | 6.72vh           | Exact           |
| 8         | 7.88vh           | **10**    | 9.04vh           | Nearest (lossy) |
| 9         | 9.04vh           | **10**    | 9.04vh           | Exact           |
| 10        | 10.27vh          | **10**    | 9.04vh           | Capped at max   |

Scales 8 and 10 are lossy — the new scale grid doesn't have an exact equivalent. Both map to scale
10 (the maximum).

## Mobile Reading Impact

There is only one stored `quranTextFontScale` integer, but tablet and mobile-reading breakpoints
have different value grids. The migration optimizes for tablet. On mobile-reading, some users will
see a slight shift:

| Old Scale | Old Mobile-Reading Value | After Remap (New Scale) | New Mobile-Reading Value | Shift           |
| --------- | ------------------------ | ----------------------- | ------------------------ | --------------- |
| 1-5       | —                        | 1-5 (unchanged)         | —                        | None            |
| 6         | 7.5vw                    | 7                       | 8.9vw                    | +1.4vw (larger) |
| 7         | 8.9vw                    | 9                       | 12vw                     | +3.1vw (larger) |
| 8         | 11vw                     | 10                      | 13vw                     | +2vw (larger)   |
| 9         | 12vw                     | 10                      | 13vw                     | +1vw (larger)   |

Mobile values shown above are for QPCHafs. The direction is consistent across all fonts:
mobile-reading text gets somewhat larger. This is an acceptable trade-off since tablet is the
primary reading viewport.

## Implementation Details

```
src/redux/migration-scripts/remap-font-scale.ts
```

- `QURAN_FONTS`: Set of the 5 affected font enums
- `FONT_SCALE_REMAP`: Lookup table `{ 6: 7, 7: 9, 8: 10, 9: 10 }`
- `remapFontScale(quranFont, scale)`: Returns remapped scale for Quran fonts, passthrough for
  others. Uses `??` fallback so unmapped scales (1-5, 10) return as-is.
- `needsFontScaleRemap(quranFont, scale)`: Returns `true` if the scale would change.

The migration in `src/redux/migrations.ts` (key `46`) calls `remapFontScale()` on
`state.quranReaderStyles.quranTextFontScale` and spreads the result back into the slice.

## Test Coverage

### Unit tests (`remap-font-scale.test.ts`) — 100 tests

- `needsFontScaleRemap`: Verified for all 5 Quran fonts at scales 6-9 (true) and scales 1-5, 10
  (false). Verified for Uthmani at all scales 1-10 (false).
- `remapFontScale`: Verified correct output for all 5 fonts across all 10 scales. Verified Uthmani
  passthrough at all scales.

### Integration tests (`migrations.test.ts`) — 5 tests for migration 46

- Remaps each font at a different scale: QPCHafs 6->7, MadaniV1 7->9, MadaniV2 8->10, TajweedV4
  9->10, IndoPak 6->7
- Verifies no remap for QPCHafs at scale 3 (below threshold)
- Verifies no remap for Uthmani at scale 6 (non-Quran font)
- Verifies other `quranReaderStyles` properties and sibling slices are preserved
