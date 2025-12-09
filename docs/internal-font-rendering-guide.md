# Internal Developer Guide: Quran Font Rendering System

## Overview

This guide documents how the `quran.com-frontend-next` codebase renders Quran fonts. It covers the
architecture, components, hooks, utilities, and patterns used internally to support multiple Mushaf
(script) types with dynamic font loading.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Font Types & Enums](#font-types--enums)
3. [Key Source Files](#key-source-files)
4. [API Integration](#api-integration)
   - [View Modes: Reading View vs Translation View](#view-modes-reading-view-vs-translation-view)
5. [Font Loading System](#font-loading-system)
6. [Component Architecture](#component-architecture)
7. [Redux State Management](#redux-state-management)
8. [SCSS Styling System](#scss-styling-system)
9. [Font Scaling System](#font-scaling-system)
10. [Theme Integration](#theme-integration)
11. [Development Workflow](#development-workflow)
12. [Testing & Debugging](#testing--debugging)
13. [Common Patterns](#common-patterns)

---

## Architecture Overview

### High-Level Flow

```text
User Settings (Redux)
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                 │
│  • Determines mushaf ID based on selected font                  │
│  • Constructs word_fields parameter for API request             │
│  • Fetches verses with appropriate text fields                  │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Font Loading Layer                           │
│  • useQcfFont hook detects page numbers in response             │
│  • Dynamically loads page-specific fonts using FontFace API     │
│  • Tracks loaded fonts in Redux to prevent duplicate loads      │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Rendering Layer                               │
│  • QuranWord component decides: GlyphWord vs TextWord           │
│  • GlyphWord: Uses QCF glyph codes with dynamic font-family     │
│  • TextWord: Uses Unicode text with static font-family          │
│  • Fallback text shown until page font is fully loaded          │
└─────────────────────────────────────────────────────────────────┘
```

### Two Rendering Strategies

| Strategy               | Fonts                      | How It Works                                                                                                                                           |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **QCF Glyph-Based**    | V1, V2, V4 (Tajweed)       | API returns special glyph codes (`code_v1`, `code_v2`) that map to glyphs in page-specific font files. Each Mushaf page (1-604) has its own font file. |
| **Unicode Text-Based** | Uthmani, IndoPak, QPC Hafs | API returns standard Unicode Arabic text. Single static font file handles all pages.                                                                   |

---

## Font Types & Enums

### Primary Enum: `QuranFont`

**Location:** `types/QuranReader.ts`

```typescript
export enum QuranFont {
  MadaniV1 = 'code_v1', // QCF V1 - King Fahd Complex Madani
  MadaniV2 = 'code_v2', // QCF V2 - Updated Madani
  TajweedV4 = 'tajweed_v4', // QCF V4 - Colored Tajweed rules
  Uthmani = 'text_uthmani', // Unicode Uthmani script
  IndoPak = 'text_indopak', // IndoPak Nastaleeq script
  QPCHafs = 'qpc_uthmani_hafs', // QPC Hafs (used as fallback)
  Tajweed = 'tajweed', // Unicode Tajweed
}
```

### Mushaf ID Enum

```typescript
export enum Mushaf {
  QCFV2 = 1, // QCF V2 (default)
  QCFV1 = 2, // QCF V1
  Indopak = 3, // IndoPak (default)
  UthmaniHafs = 4, // Uthmani Hafs
  KFGQPCHAFS = 5, // QPC Hafs
  Indopak15Lines = 6, // IndoPak 15-line layout
  Indopak16Lines = 7, // IndoPak 16-line layout
  Tajweed = 11, // Unicode Tajweed
  QCFTajweedV4 = 19, // QCF V4 Tajweed
}
```

### Font-to-Mushaf Mapping

```typescript
export const QuranFontMushaf: Record<QuranFont, Mushaf> = {
  [QuranFont.MadaniV1]: Mushaf.QCFV1,
  [QuranFont.MadaniV2]: Mushaf.QCFV2,
  [QuranFont.TajweedV4]: Mushaf.QCFTajweedV4,
  [QuranFont.Uthmani]: Mushaf.UthmaniHafs,
  [QuranFont.IndoPak]: Mushaf.Indopak,
  [QuranFont.QPCHafs]: Mushaf.KFGQPCHAFS,
  [QuranFont.Tajweed]: Mushaf.Tajweed,
};
```

### IndoPak Line Variations

```typescript
export enum MushafLines {
  FifteenLines = '15_lines',
  SixteenLines = '16_lines',
}
```

---

## Key Source Files

### Type Definitions

| File                   | Purpose                                |
| ---------------------- | -------------------------------------- |
| `types/QuranReader.ts` | Font enums, Mushaf enums, mappings     |
| `types/Word.ts`        | Word interface with all text fields    |
| `types/Verse.ts`       | Verse interface containing words array |

### Utilities

| File                          | Purpose                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/utils/fontFaceHelper.ts` | Core font utilities:`isQCFFont()`, `getFontFaceNameForPage()`, `getQCFFontFaceSource()`, `getFontClassName()` |
| `src/utils/api.ts`            | API helpers:`getDefaultWordFields()`, `getMushafId()`                                                         |
| `src/utils/apiPaths.ts`       | URL construction:`makeVersesUrl()`                                                                            |
| `src/utils/cdn.ts`            | CDN URL generation                                                                                            |

### Hooks

| File                           | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `src/hooks/useQcfFont.ts`      | Dynamic QCF font loading              |
| `src/hooks/useIsFontLoaded.ts` | Check if specific page font is loaded |

### Components

| File                                           | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| `src/components/Verse/VerseText.tsx`           | Main verse container                       |
| `src/components/dls/QuranWord/QuranWord.tsx`   | Word-level routing (GlyphWord vs TextWord) |
| `src/components/dls/QuranWord/GlyphWord.tsx`   | QCF glyph rendering                        |
| `src/components/dls/QuranWord/TextWord.tsx`    | Unicode text rendering                     |
| `src/components/Verse/TajweedFontPalettes.tsx` | CSS font palettes for Tajweed V4 themes    |

### Redux Slices

| File                                         | Purpose                 |
| -------------------------------------------- | ----------------------- |
| `src/redux/slices/QuranReader/font-faces.ts` | Track loaded font faces |
| `src/redux/slices/QuranReader/styles.ts`     | User font preferences   |

### Styles

| File                                                 | Purpose                               |
| ---------------------------------------------------- | ------------------------------------- |
| `src/styles/_utility.scss`                           | Font scale maps and generated classes |
| `src/components/dls/QuranWord/GlyphWord.module.scss` | QCF glyph styles                      |
| `src/components/dls/QuranWord/TextWord.module.scss`  | Unicode text styles                   |

---

## API Integration

### Constructing API Requests

#### 1. Get Mushaf ID

**Purpose:** Maps user-selected font to correct Mushaf ID for API requests.

**Logic (Pseudo-code):**

```text
if font is IndoPak:
    return mushafLines === '15_lines' ? Mushaf.Indopak15Lines : Mushaf.Indopak16Lines
else:
    return QuranFontMushaf[font]  // Lookup from mapping table
```

**Reference:** `src/utils/api.ts` → `getMushafId()`

#### 2. Get Word Fields

**Purpose:** Constructs `word_fields` parameter with required text fields.

**Logic (Pseudo-code):**

```text
wordFields = [verse_key, verse_id, page_number, location, text_uthmani, text_imlaei_simple]
wordFields += primary font field (code_v1, code_v2, or text_* based on font)
if font != QPCHafs:
    wordFields += qpc_uthmani_hafs  // Always include fallback
```

**Why include multiple fields?**

- Primary font field (e.g., `code_v2`) for rendering
- `qpc_uthmani_hafs` as fallback during font load
- `text_uthmani` for copy-to-clipboard
- `text_imlaei_simple` for SEO/search

**Reference:** `src/utils/api.ts` → `getDefaultWordFields()`

#### 3. Construct URL

Combine `getMushafId()` and `getDefaultWordFields()` with `makeVersesUrl()` to build the API URL.

**Reference:** `src/utils/apiPaths.ts` → `makeVersesUrl()`

### API Response Word Object

Key fields in each word object:

| Field                                              | Description                        |
| -------------------------------------------------- | ---------------------------------- |
| `verse_key`                                        | Verse reference (e.g., "1:1")      |
| `page_number`                                      | Mushaf page (1-604)                |
| `line_number`                                      | Line on the page                   |
| `position`                                         | Word position in verse             |
| `char_type_name`                                   | Type: 'word', 'end', 'pause', etc. |
| `code_v1`, `code_v2`                               | QCF glyph codes                    |
| `text_uthmani`, `text_indopak`, `qpc_uthmani_hafs` | Unicode text fields                |

**Reference:** `types/Word.ts`

### View Modes: Reading View vs Translation View

The Quran.com frontend has two primary view modes with different data transformation requirements:

| Aspect                | Reading View                        | Translation View            |
| --------------------- | ----------------------------------- | --------------------------- |
| **Layout Unit**       | Mushaf page (lines)                 | Single verse                |
| **Data Grouping**     | Words → Lines → Pages               | Verses (no grouping)        |
| **Pagination**        | Physical Mushaf page boundaries     | API pagination (perPage)    |
| **Line Construction** | Required                            | Not applicable              |
| **Key File**          | `ReadingView/groupLinesByVerses.ts` | `TranslationView/index.tsx` |

---

### Reading View: Line Construction

The API returns **verses**, but Reading View needs **lines** to match the physical Mushaf layout.

**Why?** A single Mushaf line often contains words from multiple verses. We must group by line, not
by verse.

**Word Layout Metadata:**

Each word in the API response includes:

- `pageNumber`: Which Mushaf page (1-604)
- `lineNumber`: Which line on that page (1-15 typically)
- `position`: Word order within the verse

**Data Transformation Pipeline:**

```text
verses.flatMap(verse => verse.words)           // Step 1: Extract all words
        ↓
groupBy(words, word => `Page${pageNumber}-Line${lineNumber}`)  // Step 2: Group by line
        ↓
{ "Page1-Line1": [words], "Page1-Line2": [words], ... }        // Result: lines object
        ↓
Render each line → Render words within line                    // Step 3-4: Render
```

**Component Hierarchy:**

```text
ReadingView
    └── Page (for each Mushaf page)
            └── Line (for each line)
                    └── VerseText → QuranWord → GlyphWord/TextWord
```

**Implementation:** See `src/components/QuranReader/ReadingView/groupLinesByVerses.ts` and
`Page.tsx`

---

### Translation View: Verse-by-Verse Rendering

Translation View displays verses one by one with translations. No line grouping needed.

**Data Flow:**

```text
For each verse:
    Render VerseText (Quran words)
    Render TranslationText (translations)
```

**Component Hierarchy:**

```text
TranslationView
    └── TranslationViewVerse (for each verse)
            ├── VerseText → QuranWord → GlyphWord/TextWord
            └── TranslationText
```

**Implementation:** See `src/components/QuranReader/TranslationView/`

---

## Font Loading System

### QCF Font Loading Hook

**Purpose:** Dynamically loads QCF page fonts when verses are rendered.

**Logic (Pseudo-code):**

```text
if font is not QCF or no verses:
    return early

pageNumbers = extract unique page numbers from verses

for each pageNumber:
    fontFaceName = "p{pageNumber}-{version}"  // e.g., "p50-v2"

    if fontFaceName already in Redux loadedFonts:
        skip
    if fontFaceName currently being fetched:
        skip

    fontFace = new FontFace(fontFaceName, source URL)
    fontFace.display = 'block'  // FOIT strategy
    document.fonts.add(fontFace)

    await fontFace.load()
    dispatch addLoadedFontFace(fontFaceName) to Redux
```

**Reference:** `src/hooks/useQcfFont.ts`

### Font Face Naming Convention

**Format:** `p{pageNumber}-{version}`

**Examples:** `p1-v1`, `p50-v2`, `p604-v4`

| Font      | Version Suffix |
| --------- | -------------- |
| MadaniV1  | `v1`           |
| MadaniV2  | `v2`           |
| TajweedV4 | `v4`           |

**Reference:** `src/utils/fontFaceHelper.ts` → `getFontFaceNameForPage()`, `quranFontToVersion()`

### Font Source Generation

**Purpose:** Builds the CSS `src` value for `@font-face` with local and remote fallbacks.

**Logic (Pseudo-code):**

```text
1. Try local system font first (for users who installed fonts)
2. Fall back to CDN URLs: woff2 → woff → ttf
3. For Tajweed V4 in Firefox dark mode: use OT-SVG format instead of COLRv1
```

**Reference:** `src/utils/fontFaceHelper.ts` → `getQCFFontFaceSource()`

### Font File Structure

```text
public/fonts/quran/hafs/
├── v1/                           # QCF V1 (604 page files)
│   ├── woff2/p1.woff2 ... p604.woff2
│   ├── woff/p1.woff ... p604.woff
│   └── ttf/p1.ttf ... p604.ttf
│
├── v2/                           # QCF V2 (604 page files)
│   ├── woff2/
│   ├── woff/
│   └── ttf/
│
├── v4/                           # QCF V4 Tajweed
│   ├── colrv1/                   # COLRv1 format (Chrome, Safari, Edge)
│   │   ├── woff2/
│   │   ├── woff/
│   │   └── ttf/
│   └── ot-svg/                   # OT-SVG format (Firefox dark mode)
│       ├── dark/
│       ├── light/
│       └── sepia/
│
├── uthmanic_hafs/                # Unicode Uthmani (single file)
│   ├── UthmanicHafs1Ver18.woff2
│   └── UthmanicHafs1Ver18.ttf
│
└── nastaleeq/indopak/            # IndoPak Nastaleeq (single file)
    ├── indopak-nastaleeq-waqf-lazim-v4.2.1.woff2
    ├── indopak-nastaleeq-waqf-lazim-v4.2.1.woff
    └── indopak-nastaleeq-waqf-lazim-v4.2.1.ttf
```

---

## Component Architecture

### Component Hierarchy

```text
<VerseText verses={verses} quranFont={quranFont}>
  │
  ├── <SEOTextForVerse />           // Hidden text for search engines
  │
  ├── <TajweedFontPalettes />       // CSS palettes (Tajweed V4 only)
  │
  └── {verses.map(verse => (
        verse.words.map(word => (
          <QuranWord
            word={word}
            font={quranFont}
            isFontLoaded={useIsFontLoaded(word.pageNumber)}
          >
            │
            ├── if isQCFFont(font):
            │     <GlyphWord
            │       textCodeV1={word.codeV1}
            │       textCodeV2={word.codeV2}
            │       pageNumber={word.pageNumber}
            │       isFontLoaded={isFontLoaded}
            │       qpcUthmaniHafs={word.qpcUthmaniHafs}  // fallback
            │     />
            │
            └── else:
                  <TextWord
                    text={word.text}
                    font={font}
                  />
        ))
      ))}
</VerseText>
```

### GlyphWord Component

**Purpose:** Renders QCF glyph codes with dynamic per-page font-family.

**Logic (Pseudo-code):**

```text
if font not loaded:
    text = fallback text (qpcUthmaniHafs)
    fontFamily = none (uses fallback CSS class)
else:
    text = font === V1 ? textCodeV1 : textCodeV2
    fontFamily = "p{pageNumber}-{version}"  // e.g., "p50-v2"

return <span
    innerHTML={text}  // QCF codes require innerHTML
    style={{ fontFamily }}
    class={highlighted ? 'highlighted' : ''}
/>
```

**Key Points:**

- Uses `dangerouslySetInnerHTML` because QCF codes contain HTML entities
- Shows `qpcUthmaniHafs` text with fallback font until page font loads
- Sets inline `fontFamily` to page-specific font (e.g., `p1-v2`)

**Reference:** `src/components/dls/QuranWord/GlyphWord.tsx`

### CLS (Cumulative Layout Shift) Minimization

The fallback font classes are calibrated to match actual QCF font sizes, minimizing visual jump when
fonts finish loading.

**Reference:** `src/components/dls/QuranWord/GlyphWord.module.scss`

### TextWord Component

**Purpose:** Renders Unicode text with static pre-loaded fonts.

**Logic (Pseudo-code):**

```text
className = select based on font type:
    - charType === 'end' or QPCHafs → UthmanicHafs class
    - IndoPak → IndoPak class
    - Uthmani → Uthmani class

return <span class={className}>{text}</span>
```

**Key Points:**

- Uses CSS classes referencing pre-loaded fonts
- No fallback needed (Unicode fonts load once for all pages)

**Reference:** `src/components/dls/QuranWord/TextWord.tsx`

---

## Redux State Management

### Font Faces Slice

**Purpose:** Tracks which QCF page fonts have been loaded.

**State Shape:**

```text
fontFaces: {
    loadedFontFaces: ["p1-v2", "p2-v2", "p50-v2", ...]  // Font names loaded
}
```

**Actions:**

- `addLoadedFontFace(fontName)` - Add font to loaded list
- `resetLoadedFontFaces()` - Clear all (used on font change)

**Reference:** `src/redux/slices/QuranReader/font-faces.ts`

### Styles Slice (User Preferences)

**Purpose:** Stores user font preferences.

**Key State:**

- `quranFont` - Selected font enum
- `quranTextFontScale` - Current scale level (1-10)
- `mushafLines` - IndoPak line variant (15 or 16)

**Reference:** `src/redux/slices/QuranReader/styles.ts`

### Hook: useIsFontLoaded

**Purpose:** Checks if a specific page font is loaded.

**Logic (Pseudo-code):**

```text
if font is not QCF:
    return true  // Unicode fonts always "loaded"

fontFaceName = "p{pageNumber}-{version}"
return loadedFonts from Redux includes fontFaceName
```

**Reference:** `src/hooks/useIsFontLoaded.ts`

---

## SCSS Styling System

### Font Scale Configuration

**Purpose:** Defines font sizes for each font type and scale level (1-10) with responsive
breakpoints.

**Structure (Pseudo-code):**

```text
$scales-map: (
    font_name: (
        tablet: (1: size, 2: size, ... 10: size),
        mobile: (1: size, 2: size, ... 10: size)
    ),
    // For each font: qpc_uthmani_hafs, code_v1, code_v2, tajweed_v4,
    // text_indopak_15_lines, text_indopak_16_lines, fallback_code_v1, etc.
)
```

**Generated CSS Classes:**

- `.code_v2-font-size-3` → `font-size: 3.9vh` (tablet), `5.3vw` (mobile)
- `.qpc_uthmani_hafs-font-size-5` → `font-size: 5.4vh` (tablet)
- `.fallback_code_v2-font-size-3` → calibrated to match QCF sizes

**Reference:** `src/styles/_utility.scss`

### Getting Font Class Name

**Purpose:** Generates the appropriate CSS class name for a font/scale combination.

**Format:**

- Standard: `{font}-font-size-{scale}` (e.g., `code_v2-font-size-3`)
- IndoPak: `{font}_{lines}-font-size-{scale}` (e.g., `text_indopak_15_lines-font-size-3`)
- Fallback: `fallback_{font}-font-size-{scale}`

**Reference:** `src/utils/fontFaceHelper.ts` → `getFontClassName()`

---

## Font Scaling System

The font scaling system provides users with granular control over Quran text size across different
fonts, devices, and content types. It uses a 10-level scale with responsive adjustments for mobile
and tablet/desktop.

### Scale Levels Overview

| Level | Description  | Use Case                          |
| ----- | ------------ | --------------------------------- |
| 1-3   | Small sizes  | Mobile-optimized, compact reading |
| 3     | **Default**  | Balanced default for most users   |
| 4-5   | Medium sizes | Comfortable extended reading      |
| 6-10  | Large sizes  | Accessibility, presentations      |

### Content Type Scales

| Content Type | Max Scale | Default | Redux Action                                                    |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| Quran Text   | 10        | 3       | `increaseQuranTextFontScale` / `decreaseQuranTextFontScale`     |
| Translation  | 10        | 3       | `increaseTranslationFontScale` / `decreaseTranslationFontScale` |
| Tafsir       | 10        | 3       | `increaseTafsirFontScale` / `decreaseTafsirFontScale`           |
| Word-by-Word | 6         | 3       | `increaseWordByWordFontScale` / `decreaseWordByWordFontScale`   |

### Font Scale Redux State

Font scale is stored in Redux under `quranReaderStyles`:

```typescript
// State shape (src/redux/slices/QuranReader/styles.ts)
interface QuranReaderStyles {
  quranTextFontScale: number; // 1-10
  translationFontScale: number; // 1-10
  tafsirFontScale: number; // 1-10
  wordByWordFontScale: number; // 1-6
  quranFont: QuranFont;
  mushafLines: MushafLines;
  isUsingDefaultFont: boolean;
}

// Constants
export const MAXIMUM_QURAN_FONT_STEP = 10;
export const MAXIMUM_TRANSLATIONS_FONT_STEP = 10;
export const MAXIMUM_TAFSIR_FONT_STEP = 10;
export const MAXIMUM_WORD_BY_WORD_FONT_STEP = 6;
export const MINIMUM_FONT_STEP = 1;
```

### Responsive Sizing

Font sizes use viewport-relative units for responsive scaling:

| Device         | Unit | Example (Scale 5)         |
| -------------- | ---- | ------------------------- |
| Mobile         | `vw` | `10vw` (viewport width)   |
| Tablet/Desktop | `vh` | `3.7vh` (viewport height) |

### Layout Behavior Changes

Font scale affects layout behavior, particularly in Reading View where we aim to replicate the
physical Mushaf experience.

#### Why Layout Behavior Changes Matter

In Reading View, we strive to maintain the **authentic Mushaf page boundaries**. This means:

- Each line should match the same boundaries as the physical Mushaf
- Page breaks should align with the printed Mushaf pages
- Words should not overflow their designated line positions
- Consistent visual appearance across different pages

This creates an interleaved reading experience that closely mirrors reading from a physical Quran.

#### Big Text Layout Mode

When font scale exceeds level 3, or when Word-by-Word features are enabled, we switch to "Big Text
Layout" mode:

```tsx
// From VerseText.tsx
const isBigTextLayout =
  isReadingMode &&
  (quranTextFontScale > 3 || showWordByWordTranslation || showWordByWordTransliteration);
```

**What changes in Big Text Layout:**

| Aspect          | Normal Layout (Scale 1-3)    | Big Text Layout (Scale 4+) |
| --------------- | ---------------------------- | -------------------------- |
| Line boundaries | Strictly maintained          | Relaxed for readability    |
| Page fidelity   | Matches physical Mushaf      | May differ from print      |
| Word wrapping   | Preserves Mushaf line breaks | Allows natural wrapping    |
| Primary goal    | Authenticity                 | Accessibility              |

**Rationale:** At larger font sizes, it becomes physically impossible to maintain the exact line
boundaries of the printed Mushaf without horizontal scrolling or text overflow. The system
prioritizes readability and accessibility over strict adherence to print layout when users choose
larger text sizes.

### Line Width Scaling

For Reading View, line width also scales with font size to maintain proper layout.

**Reference:** `src/utils/fontFaceHelper.ts` → `getLineWidthClassName()`

### Skeleton Height Scaling

Loading skeletons match the expected text height at each scale level to prevent Cumulative Layout
Shift (CLS).

**Reference:** `src/styles/_utility.scss` → `$skeleton-height-map`

### Mobile-Specific Adjustments

On mobile in translation/tafsir mode, font size is increased by 20% for better readability.

**Reference:** `src/styles/` SCSS files with `.tafsirOrTranslationMode` class

---

## Theme Integration

### Theme Types

Supported themes: `Auto`, `Light`, `Sepia`, `Dark`

**Reference:** `types/Theme.ts`

### Tajweed V4 Special Handling

Tajweed V4 uses colored glyphs that require special handling per theme.

**Important Limitation:** Tajweed V4 words cannot use CSS-based word highlighting (e.g., during
audio playback). The COLRv1 glyphs render their own colors at the font level.

**Theme-Specific Font Loading (Pseudo-code):**

```text
if font is TajweedV4:
    if browser is Firefox AND theme is Dark:
        use OT-SVG format with theme-specific files
    else:
        use COLRv1 format with CSS font-palette-values
```

**Reference:** `src/utils/fontFaceHelper.ts` → `getFontPath()`

### Tajweed Font Palettes Component

**Purpose:** Generates CSS `@font-palette-values` rules for each loaded page font.

**Palettes:**

- Light: `base-palette: 0`
- Dark: `base-palette: 1`
- Sepia: `base-palette: 2`

**Reference:** `src/components/Verse/TajweedFontPalettes.tsx`

---

## Development Workflow

### Adding a New Font Type

1. **Add enum value** in `types/QuranReader.ts` → `QuranFont` enum
2. **Add Mushaf mapping** in `types/QuranReader.ts` → `QuranFontMushaf`
3. **Update `isQCFFont`** in `src/utils/fontFaceHelper.ts` if glyph-based
4. **Add font files** to `public/fonts/quran/hafs/`
5. **Add SCSS scale configuration** in `src/styles/_utility.scss`
6. **Update UI selectors** in `QuranFontSection.tsx`

### Testing Font Changes

1. Run `yarn dev`
2. Navigate to any Surah page
3. Open browser DevTools → Network tab, filter by "woff"
4. Open Redux DevTools, check `fontFaces.loadedFontFaces` state

---

## Testing & Debugging

### Browser DevTools Techniques

**Check Loaded Fonts:** In console, run
`document.fonts.forEach(f => console.log(f.family, f.status))`

**Check Redux State:** Use Redux DevTools or `store.getState().fontFaces.loadedFontFaces`

**Network Debugging:**

1. Open Network tab, filter by "font" or "woff"
2. Check that page fonts are loaded on-demand
3. Verify correct font version (v1/v2/v4) is requested
4. Check for duplicate requests (should be prevented)

### Common Issues

| Issue                             | Cause                         | Solution                              |
| --------------------------------- | ----------------------------- | ------------------------------------- |
| Font not rendering                | Font not in `loadedFontFaces` | Check useQcfFont hook is being called |
| Fallback showing indefinitely     | Font failed to load           | Check Network tab for 404             |
| Wrong font version                | Incorrect `quranFont` prop    | Verify Redux state                    |
| Tajweed colors wrong in dark mode | Browser-specific issue        | Check OT-SVG fallback                 |
| IndoPak layout issues             | Wrong `mushafLines`           | Check 15 vs 16 lines config           |

### Debug Utilities

Import from `@/utils/fontFaceHelper`:

- `isQCFFont(font)` - Check if font is QCF type
- `getFontFaceNameForPage(font, page)` - Get expected font face name

---

## Common Patterns

### Pattern 1: Fetching Verses with Correct Font Data

**Flow:**

1. Get `quranFont` and `mushafLines` from Redux
2. Build URL with `getMushafId()` and `getDefaultWordFields()`
3. Fetch with useSWR
4. Call `useQcfFont(quranFont, verses)` to load fonts
5. Render with `<VerseText verses={verses} quranFont={quranFont} />`

**Reference:** Any page component in `src/pages/`

### Pattern 2: Rendering with Fallback

**Flow:**

1. Check `useIsFontLoaded(pageNumber, font)`
2. If loaded: use actual font className
3. If not loaded: use fallback font className
4. Route to `GlyphWord` (QCF) or `TextWord` (Unicode)

**Reference:** `src/components/dls/QuranWord/QuranWord.tsx`

### Pattern 3: Theme-Aware Tajweed

**Flow:**

1. Get theme from `useThemeDetector()`
2. Render `<TajweedFontPalettes>` for CSS palettes
3. Apply `fontPalette: --{theme}` style to container

**Reference:** `src/components/Verse/TajweedFontPalettes.tsx`

---

## Browser-Specific Handling

### Firefox V1 Mushaf Spacing

Firefox has a `word-spacing` bug with QCF V1 fonts at smaller font scales.

**Fix:** CSS adds extra margin between words when using V1 at small scales (`fontScale < 6`).

**Reference:** `src/components/dls/QuranWord/GlyphWord.module.scss` and `GlyphWord.tsx`

### Firefox Dark Mode with Tajweed V4

Firefox doesn't support COLRv1 font palettes properly in dark mode.

**Solution:** Use separate OT-SVG font files with baked-in theme colors.

**Reference:** `src/utils/fontFaceHelper.ts` → `getQCFFontPath()`

---

## Summary

The internal font rendering system:

1. **Uses Redux** to manage user font preferences and track loaded fonts
2. **Dynamically loads** QCF page fonts using the FontFace API
3. **Provides fallback** text using QPC Hafs until fonts load
4. **Routes rendering** through QuranWord → GlyphWord/TextWord based on font type
5. **Supports themes** with special handling for Tajweed V4 colors
6. **Optimizes performance** through deduplication and on-demand loading

For questions or issues, contact the frontend team or open a GitHub issue.
