# Font Rendering System Documentation

> **Last Updated:** December 2025

## Overview

This document provides a comprehensive guide to rendering Quran text using the Quran Foundation APIs
and fonts. It covers the font system architecture, API integration, and rendering techniques that
can be implemented in **any programming language or framework**.

### Related Guides

| Guide                                                                  | Audience                     |
| ---------------------------------------------------------------------- | ---------------------------- |
| [📘 Internal Font Rendering Guide](./internal-font-rendering-guide.md) | Quran.com frontend engineers |
| [📘 Internal Page Layout Guide](./internal-page-layout-guide.md)       | Internal page layout work    |

---

## Quick Reference

### Supported Fonts and Mushaf IDs

| Font            | API Field       | Mushaf ID | Pages   | Type    | Use Case                    |
| --------------- | --------------- | --------- | ------- | ------- | --------------------------- |
| QCF V1          | `code_v1`       | 2         | 604     | Glyph   | Traditional Madani          |
| QCF V2          | `code_v2`       | 1         | 604     | Glyph   | Modern Madani (recommended) |
| QCF V4          | `code_v2`       | 19        | 604     | Glyph   | Colored Tajweed             |
| QPC Hafs        | `text_qpc_hafs` | 5         | 604     | Unicode | Simple apps, fallback       |
| Uthmani         | `text_uthmani`  | 4         | 604     | Unicode | Standard Uthmani            |
| IndoPak 15-line | `text_indopak`  | 6         | **610** | Unicode | South Asian style           |
| IndoPak 16-line | `text_indopak`  | 7         | **548** | Unicode | South Asian style           |

### Important URLs

| Resource           | URL                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------- |
| API Documentation  | [api-docs.quran.foundation](https://api-docs.quran.foundation)                               |
| Production API     | `https://apis.quran.foundation/content/api/v4`                                               |
| Font CDN           | `https://verses.quran.foundation/fonts/quran`                                                |
| Request API Access | [api-docs.quran.foundation/request-access](https://api-docs.quran.foundation/request-access) |

### Key Concepts

1. **QCF Fonts (V1, V2, V4):** Glyph-based fonts with 604 page-specific files
2. **Unicode Fonts:** Standard Arabic text fonts with a single font file
3. **Fallback Strategy:** Show Unicode text (e.g., QPC Hafs) while QCF fonts load
4. **Mushaf ID:** Determines page layout and word breaks in API response

---

## Architecture

### How Font Rendering Works

```text
1. Choose a font type (e.g., QCF V2)
        │
        ▼
2. Get the Mushaf ID for that font (e.g., 1)
        │
        ├─────────────────────────┐
        ▼                         ▼
3a. Fetch verses with          3b. Load fonts
    correct mushaf param           (per-page for QCF,
                                    single file for Unicode)
        │                         │
        └─────────────┬───────────┘
                      ▼
4. Render words with appropriate font-family
   (for QCF: use page_number to select font file)
```

**Key Insight:** The same verse can appear on different pages in different Mushafs. Changing the
font changes the Mushaf ID, which changes page boundaries and requires different font files.

### Rendering Decision Flow

```text
Fetch API Response (word data)
        ↓
   ┌────┴────┐
   ↓         ↓
QCF Font?  Unicode Font?
   ↓         ↓
Load page-  Load single
specific    font file
font files
   ↓         ↓
Render      Render
glyph       Unicode
codes       text
```

---

## View Modes

When building a Quran application, there are two common approaches to displaying verses:

| Aspect                | Reading/Mushaf View                     | Translation/Study View      |
| --------------------- | --------------------------------------- | --------------------------- |
| **Layout Unit**       | Mushaf page (organized by lines)        | Single verse                |
| **Data Grouping**     | Words → Lines → Pages                   | Verses (no grouping needed) |
| **Pagination**        | Physical Mushaf page boundaries         | API pagination (per_page)   |
| **Line Construction** | Required (words grouped by line_number) | Not applicable              |

### Reading/Mushaf View

For authentic Mushaf rendering, you need to reconstruct the physical page layout. The API returns
verses, but each word includes `page_number` and `line_number` properties.

**Data Transformation (Pseudo-code):**

```text
API Response (Verses with Words)
        │
        ▼
Step 1: Extract all words from all verses
        │  // A line can contain words from MULTIPLE verses
        ▼
Step 2: Group words by page and line
        │  // Group by: page_number + line_number
        │  // Result: { "Page1-Line1": [words], "Page1-Line2": [words], ... }
        ▼
Step 3: Render each page
        │  // For each page, render its lines in order
        ▼
Step 4: Render words within each line
        │  // Words rendered in order, font applied per page_number
        ▼
   Rendered Mushaf Page
```

### Translation/Study View

For verse-by-verse display with translations, no line grouping is needed:

```text
API Response (Verses)
        │
        ▼
For each verse:
        │  Render Quran text (words)
        │  Render translation(s)
        ▼
   Rendered Verse Block
```

### Why Reading View Needs Line Construction

1. **Cross-Verse Lines:** A single Mushaf line often contains words from multiple verses
2. **Mushaf Accuracy:** The `page_number` and `line_number` from the API match the physical Quran
   book
3. **Font Loading:** For QCF fonts, `page_number` determines which font file to load

---

## Font Types

### Font Categories

| Category               | API Fields                                      | Rendering                 | Loading          |
| ---------------------- | ----------------------------------------------- | ------------------------- | ---------------- |
| **QCF (Glyph-Based)**  | `code_v1`, `code_v2`                            | Glyph codes → font glyphs | Dynamic per-page |
| **Unicode Text-Based** | `text_uthmani`, `text_indopak`, `text_qpc_hafs` | Standard Unicode Arabic   | Single font file |

### Font to Mushaf ID Mapping

When making API requests, use the `mushaf` parameter to get the correct word data:

| Font Type       | Mushaf ID | API Field to Request |
| --------------- | --------- | -------------------- |
| QCF V1          | 2         | `code_v1`            |
| QCF V2          | 1         | `code_v2`            |
| QCF V4 Tajweed  | 19        | `code_v2`            |
| Uthmani         | 4         | `text_uthmani`       |
| IndoPak         | 3         | `text_indopak`       |
| QPC Hafs        | 5         | `text_qpc_hafs`      |
| IndoPak 15-line | 6         | `text_indopak`       |
| IndoPak 16-line | 7         | `text_indopak`       |

---

## API Integration

### Verse Endpoints

The API provides multiple endpoints to fetch verses with word data for font rendering. All endpoints
support the same query parameters (`words`, `word_fields`, `mushaf`, etc.) and return verses with
word-level data needed for font rendering.

| Endpoint                                 | Description                       | Range | Documentation                                                                                      |
| ---------------------------------------- | --------------------------------- | ----- | -------------------------------------------------------------------------------------------------- |
| `GET /verses/by_chapter/:chapter_number` | Verses by chapter/surah           | 1-114 | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-chapter-number)     |
| `GET /verses/by_page/:page_number`       | Verses by Mushaf page             | 1-604 | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-page-number)        |
| `GET /verses/by_juz/:juz_number`         | Verses by Juz                     | 1-30  | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-juz-number)         |
| `GET /verses/by_hizb/:hizb_number`       | Verses by Hizb (half)             | 1-60  | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-hizb-number)        |
| `GET /verses/by_rub/:rub_el_hizb_number` | Verses by Rub el Hizb (quarter)   | 1-240 | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-rub-el-hizb-number) |
| `GET /verses/by_manzil/:manzil_number`   | Verses by Manzil                  | 1-7   | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-manzil-number)      |
| `GET /verses/by_ruku/:ruku_number`       | Verses by Ruku                    | 1-558 | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-ruku-number)        |
| `GET /verses/by_key/:verse_key`          | Single verse by key (e.g., "1:1") | N/A   | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/verses-by-verse-key)          |
| `GET /verses/random`                     | Random verse (optionally scoped)  | N/A   | [Docs](https://api-docs.quran.foundation/docs/content_apis_versioned/random-verse)                 |

> **Note:** All paginated endpoints support `page` and `per_page` parameters (max 50 records per
> call).

### Word Fields (`word_fields` parameter)

| Field           | Description          | Use Case               |
| --------------- | -------------------- | ---------------------- |
| `code_v1`       | QCF V1 glyph codes   | Madani V1 rendering    |
| `code_v2`       | QCF V2 glyph codes   | Madani V2 & Tajweed V4 |
| `text_uthmani`  | Unicode Uthmani text | Uthmani font & copying |
| `text_indopak`  | IndoPak script text  | IndoPak Nastaleeq      |
| `text_qpc_hafs` | QPC Hafs text        | Fallback font          |
| `page_number`   | Mushaf page (1-604)  | QCF font file loading  |
| `line_number`   | Line on Mushaf page  | Reading View layout    |

### Sample API Requests

**By Chapter (e.g., Al-Fatiha):**

```bash
GET /api/v4/verses/by_chapter/1?words=true&word_fields=verse_key,page_number,line_number,code_v2,text_qpc_hafs&mushaf=1
```

**By Mushaf Page:**

```bash
GET /api/v4/verses/by_page/1?words=true&word_fields=verse_key,page_number,line_number,code_v2,text_qpc_hafs&mushaf=1
```

**By Juz:**

```bash
GET /api/v4/verses/by_juz/1?words=true&word_fields=verse_key,page_number,code_v2,text_qpc_hafs&mushaf=1&per_page=50
```

**Single Verse by Key:**

```bash
GET /api/v4/verses/by_key/1:1?words=true&word_fields=verse_key,page_number,code_v2,text_qpc_hafs&mushaf=1
```

---

## Font Loading

### QCF Fonts (Per-Page Loading)

QCF fonts require loading a separate font file for each Mushaf page (1-604). This is because each
page has unique glyph mappings.

**Loading Strategy (Pseudo-code):**

```text
function loadQcfFont(pageNumber, version):
    fontName = "p{pageNumber}-{version}"  // e.g., "p1-v2", "p50-v2"

    if fontName already loaded:
        return

    fontUrl = "{CDN_BASE}/hafs/{version}/woff2/p{pageNumber}.woff2"

    // Load font dynamically (using FontFace API, CSS, or platform-specific method)
    load font from fontUrl with name fontName

    // Track loaded fonts to avoid re-loading
    mark fontName as loaded
```

**Key Points:**

- Only load fonts for pages you're displaying
- Track loaded fonts to prevent duplicate requests
- Use WOFF2 format for best compression

### Font Face Naming Convention

**Format:** `p{pageNumber}-{version}`

**Examples:**

- `p1-v1` - Page 1, QCF V1
- `p50-v2` - Page 50, QCF V2
- `p604-v4` - Page 604, QCF V4 Tajweed

### Font File URLs (CDN)

**Base URL:** `https://verses.quran.foundation/fonts/quran/hafs/`

| Font Version | URL Pattern                                                    |
| ------------ | -------------------------------------------------------------- |
| QCF V1       | `/v1/woff2/p{PAGE}.woff2`                                      |
| QCF V2       | `/v2/woff2/p{PAGE}.woff2`                                      |
| V4 COLRv1    | `/v4/colrv1/woff2/p{PAGE}.woff2`                               |
| V4 OT-SVG    | `/v4/ot-svg/{theme}/woff2/p{PAGE}.woff2`                       |
| QPC Hafs     | `/uthmanic_hafs/UthmanicHafs1Ver18.woff2`                      |
| IndoPak      | `/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2` |

Replace `{PAGE}` with 1-604 and `{theme}` with `light`, `dark`, or `sepia`.

### Unicode Fonts (Single File)

Unicode fonts only require loading one font file:

```text
// Load once at application start
load "UthmanicHafs" from "{CDN}/uthmanic_hafs/UthmanicHafs1Ver18.woff2"
load "IndoPakNastaleeq" from "{CDN}/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2"
```

---

## Rendering Words

### Rendering QCF Fonts (Glyph-Based)

QCF glyph codes are special Unicode characters that only render correctly with the matching page
font.

**Rendering Logic (Pseudo-code):**

```text
function renderQcfWord(word, loadedFonts):
    pageNumber = word.page_number
    fontName = "p{pageNumber}-{version}"

    if fontName in loadedFonts:
        // Render with QCF font
        text = word.code_v2  // or code_v1
        fontFamily = fontName
    else:
        // Fallback to Unicode while font loads
        text = word.text_qpc_hafs
        fontFamily = "UthmanicHafs"

    // IMPORTANT: QCF codes contain special characters
    // Use innerHTML/equivalent, NOT textContent
    render text with fontFamily
```

> ⚠️ **Critical:** QCF glyph codes must be rendered using `innerHTML` (or equivalent in your
> platform), not `textContent`. Using `textContent` will display incorrect characters.

### Rendering Unicode Fonts

Unicode fonts are simpler—use the text directly with the appropriate font-family:

```text
function renderUnicodeWord(word, fontType):
    if fontType == "uthmani":
        text = word.text_uthmani
        fontFamily = "UthmanicHafs"
    else if fontType == "indopak":
        text = word.text_indopak
        fontFamily = "IndoPakNastaleeq"
    else:
        text = word.text_qpc_hafs
        fontFamily = "UthmanicHafs"

    render text with fontFamily
```

### Fallback Strategy

Always implement a fallback for better user experience:

1. Request both QCF codes and `text_qpc_hafs` in your API call
2. Show Unicode text immediately
3. When QCF font loads, switch to glyph rendering
4. This prevents blank text while fonts download

---

## Tajweed V4 Theme Handling

Tajweed V4 fonts include colored glyphs for Tajweed rules. Theme handling varies by browser:

### Browser Support

| Browser              | Format | Theme Method                  |
| -------------------- | ------ | ----------------------------- |
| Chrome, Safari, Edge | COLRv1 | CSS `font-palette` property   |
| Firefox              | OT-SVG | Separate font files per theme |

### COLRv1 (Most Browsers)

Use CSS `font-palette` to switch themes:

```css
/* Define palette overrides */
@font-palette-values --Light {
  font-family: 'p1-v4';
  base-palette: 0;
}

@font-palette-values --Dark {
  font-family: 'p1-v4';
  base-palette: 1;
}

@font-palette-values --Sepia {
  font-family: 'p1-v4';
  base-palette: 2;
}

/* Apply theme */
.quran-text.light {
  font-palette: --Light;
}
.quran-text.dark {
  font-palette: --Dark;
}
.quran-text.sepia {
  font-palette: --Sepia;
}
```

### OT-SVG (Firefox)

Firefox requires loading different font files for each theme:

```text
Light: /v4/ot-svg/light/woff2/p{PAGE}.woff2
Dark:  /v4/ot-svg/dark/woff2/p{PAGE}.woff2
Sepia: /v4/ot-svg/sepia/woff2/p{PAGE}.woff2
```

---

## Font Scaling

Implementing font size controls improves accessibility and user experience.

### Recommended Scale System

Use a multi-level scale (e.g., 1-10) for font size control:

| Level | Description  | Use Case                          |
| ----- | ------------ | --------------------------------- |
| 1-3   | Small sizes  | Mobile-optimized, compact reading |
| 3     | **Default**  | Balanced default for most users   |
| 4-5   | Medium sizes | Comfortable extended reading      |
| 6-10  | Large sizes  | Accessibility, presentations      |

### Responsive Sizing

Use viewport-relative units for responsive scaling:

| Device         | Unit | Example (Scale 5)         |
| -------------- | ---- | ------------------------- |
| Mobile         | `vw` | `10vw` (viewport width)   |
| Tablet/Desktop | `vh` | `3.7vh` (viewport height) |

### Example Scale Values for QCF V2

| Scale | Mobile | Tablet/Desktop |
| ----- | ------ | -------------- |
| 1     | 4vw    | 2.9vh          |
| 3     | 5.3vw  | 3.2vh          |
| 5     | 10vw   | 3.7vh          |
| 10    | 15vw   | 11vh           |

> **Note:** IndoPak/Nastaleeq fonts typically need larger sizes due to script complexity.

---

## Best Practices

### Performance Optimization

1. **Page-based loading:** Only load fonts for pages currently being displayed
2. **Deduplication:** Track loaded fonts to prevent duplicate network requests
3. **Font display:** Use `font-display: block` or equivalent to control loading behavior
4. **Preload critical fonts:** For Unicode fonts used as fallback, preload them early

### API Request Optimization

- Always request `text_qpc_hafs` as fallback text
- Request only the specific font code you need (`code_v1` OR `code_v2`, not both)
- Include `text_uthmani` if you need copy-to-clipboard functionality
- Use pagination (`per_page`) for large requests

### Accessibility

- Provide font size controls for users
- Ensure sufficient color contrast, especially for Tajweed colors
- Support RTL (right-to-left) text direction
- Include hidden Unicode text for screen readers when using QCF fonts

---

## Troubleshooting

| Issue                 | Possible Cause            | Solution                                  |
| --------------------- | ------------------------- | ----------------------------------------- |
| Font not rendering    | Font file not loaded      | Check network requests, verify font URL   |
| Fallback text showing | Page font not downloaded  | Verify page_number and font URL           |
| Tajweed colors wrong  | Wrong theme/palette       | Check browser support, use correct format |
| Garbled characters    | Using textContent for QCF | Use innerHTML or equivalent               |
| Wrong page layout     | Wrong Mushaf ID           | Verify mushaf parameter matches font      |

### Debug Tips

**Browser Console:**

```javascript
// Check which fonts are loaded
document.fonts.forEach((f) => console.log(f.family, f.status));
```

**Network Tab:**

- Verify font files are downloading from CDN
- Check for 404 errors on font URLs

---

## Additional Resources

- **Full API Documentation:** [api-docs.quran.foundation](https://api-docs.quran.foundation)
- **Request API Access:**
  [api-docs.quran.foundation/request-access](https://api-docs.quran.foundation/request-access)

For Quran.com internal implementation details, see:

- [Internal Font Rendering Guide](./internal-font-rendering-guide.md)
- [Internal Page Layout Guide](./internal-page-layout-guide.md)
