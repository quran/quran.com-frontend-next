# Internal Page Layout System Guide

> **For Quran.com Frontend Engineers**
>
> This guide explains how the page layout and Mushaf pagination system works internally in the
> Quran.com frontend. It covers the Pages Lookup API integration, view modes, virtualization, and
> how font selection affects page boundaries.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Concepts](#core-concepts)
4. [Pages Lookup API](#pages-lookup-api)
5. [Reading View Implementation](#reading-view-implementation)
6. [Translation View Implementation](#translation-view-implementation)
7. [Font and Mushaf Relationship](#font-and-mushaf-relationship)
8. [Data Flow](#data-flow)
9. [Caching and Revalidation Strategy](#caching-and-revalidation-strategy)
10. [Virtualization](#virtualization)
11. [SSR and Hydration](#ssr-and-hydration)
12. [Key Files Reference](#key-files-reference)

---

## Overview

The Quran.com page layout system manages how Quranic content is organized and displayed across
different view modes and Mushaf types. The system handles:

- **Mushaf-specific pagination**: Different Mushafs have different page boundaries (e.g., Indopak
  15-line has 610 pages, 16-line has 548 pages, while most others have 604 pages)
- **Two view modes**: Reading View (Mushaf-style) and Translation View (verse-by-verse)
- **Dynamic content loading**: Virtualized scrolling for performance
- **Font-aware rendering**: Page layouts depend on the selected Quran font/Mushaf

### Key Principle

> **The same verse can appear on different pages depending on the selected Mushaf.**
>
> For example, verse 2:255 (Ayatul Kursi) might be on page 42 in QCF V2 but on a different page in
> Indopak 15-line Mushaf.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              QuranReader                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         QuranReaderView                               │  │
│  │  ┌─────────────────────────┐    ┌─────────────────────────┐           │  │
│  │  │     ReadingView         │    │    TranslationView      │           │  │
│  │  │  (Mushaf-style pages)   │ OR │   (Verse-by-verse)      │           │  │
│  │  └────────────┬────────────┘    └───────────┬─────────────┘           │  │
│  └───────────────┼─────────────────────────────┼─────────────────────────┘  │
│                  │                             │                            │
│  ┌───────────────▼─────────────────────────────▼─────────────────────────┐  │
│  │                    useFetchPagesLookup Hook                           │  │
│  │  - Fetches page boundaries for current Mushaf                         │  │
│  │  - Returns pagesVersesRange, pagesCount, lookupRange                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Pages Lookup API                              │  │
│  │  GET /api/qdc/pages/lookup?mushaf=X&chapter_number=Y                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### QuranReaderDataType

Defines what type of Quranic content is being displayed (Chapter, Verse, Juz, Hizb, Page, etc.).

**Reference:** `types/QuranReader.ts`

### Mushaf Types and Page Counts

Different Mushafs have different total page counts:

| Mushaf                                  | Pages |
| --------------------------------------- | ----- |
| Most Mushafs (QCF V1/V2, Uthmani, etc.) | 604   |
| IndoPak 16-line                         | 548   |
| IndoPak 15-line                         | 610   |

**Reference:** `src/utils/page.ts` → `PAGES_MUSHAF_MAP`

### QuranFont to Mushaf Mapping

Each font maps to a specific Mushaf ID. IndoPak font is further split by line count (15 or 16
lines).

**Reference:** `types/QuranReader.ts` → `QuranFontMushaf`

### LookupRecord and LookupRange

Types defining verse ranges:

- `LookupRange`: Contains `from` and `to` verse keys (e.g., "2:1" to "2:286")
- `LookupRecord`: Extends LookupRange with `firstVerseKey` and `lastVerseKey`

**Reference:** `types/LookupRange.ts`, `types/LookupRecord.ts`

---

## Pages Lookup API

### Purpose

The Pages Lookup API returns the page boundaries for a given resource (chapter, juz, hizb, etc.) in
a specific Mushaf. This is essential because:

1. **Different Mushafs have different pagination**
2. **We need to know which verses appear on which page**
3. **Virtualized rendering requires knowing total page count upfront**

### API Endpoint

```
GET /api/qdc/pages/lookup
```

### Request Parameters

Pass one resource identifier (chapterNumber, juzNumber, pageNumber, etc.) plus the required `mushaf`
ID. Optionally specify `from`/`to` verse keys for ranges.

**Reference:** `types/ApiRequests.ts` → `PagesLookUpRequest`

### Response Structure

Returns:

- `lookupRange`: Overall verse range for the resource
- `pages`: Map of page numbers to verse ranges (e.g., page "3" → verses "2:6" to "2:16")
- `totalPage`: Total page count for this resource

**Reference:** `types/ApiResponses.ts` → `PagesLookUpResponse`

### Example Response

```json
{
  "lookupRange": {
    "from": "2:1",
    "to": "2:286"
  },
  "pages": {
    "2": {
      "from": "2:1",
      "to": "2:5",
      "firstVerseKey": "2:1",
      "lastVerseKey": "2:5"
    },
    "3": {
      "from": "2:6",
      "to": "2:16",
      "firstVerseKey": "2:6",
      "lastVerseKey": "2:16"
    }
    // ... more pages
  },
  "totalPage": 48
}
```

### URL Generation

**Reference:** `src/utils/apiPaths.ts` → `makePagesLookupUrl()`

---

## Reading View Implementation

### Overview

The Reading View displays Quranic text in a Mushaf-style layout, where each "page" corresponds to an
actual Mushaf page.

### Component Hierarchy

```
ReadingView
├── useFetchPagesLookup (hook)
├── useQcfFont (hook)
├── Virtuoso (virtualized list)
│   └── PageContainer (for each page index)
│       ├── useSWRImmutable (fetches page verses)
│       └── Page
│           └── Line (for each line)
│               └── QuranWord (for each word)
└── PageNavigationButtons
```

### ReadingView Component

Main responsibilities:

1. Track verses per Mushaf page in local state
2. Fetch page boundaries via `useFetchPagesLookup`
3. Load QCF fonts for visible verses via `useQcfFont`
4. Render virtualized list of pages via React Virtuoso

**Reference:** `src/components/QuranReader/ReadingView/index.tsx`

### PageContainer Component

Fetches verses for a specific Mushaf page:

```text
Pseudo-code:
1. Wait for Redux hydration to complete
2. Convert pageIndex → pageNumber using pagesVersesRange
3. Generate cache key for this page
4. Fetch verses via useSWR (with SSR fallback data)
5. Render Page component with fetched verses
```

**Reference:** `src/components/QuranReader/ReadingView/PageContainer.tsx`

### Page-to-Verse Mapping

Utility functions:

- `getPageNumberByPageIndex()`: Converts virtualized list index to Mushaf page number
- `getPageVersesRange()`: Gets verse range (from/to) for a specific page

**Reference:** `src/components/QuranReader/ReadingView/PageContainer.tsx`

### From API Response to Rendered Page

Understanding the data transformation from API response to rendered Reading View is essential. The
API returns **verses**, but we need to render **lines** that match the physical Mushaf layout.

#### Word Layout Metadata

Each word includes `pageNumber` (1-604), `lineNumber` (1-15), and `position` (order within verse).
This metadata enables reconstructing the exact Mushaf layout.

#### Transformation Pipeline (Pseudo-code)

```text
API Response (Verses with Words)
        ↓
Extract all words from all verses
        ↓
Group words by "Page{pageNumber}-Line{lineNumber}"
        ↓
Render each line in order within Page component
```

> **Key Insight:** A single Mushaf line often contains words from multiple verses. We must group by
> line (not verse) for accurate physical layout.

#### Implementation Reference

- **Line grouping logic:** `src/components/QuranReader/ReadingView/groupLinesByVerses.ts`
- **Page component:** `src/components/QuranReader/ReadingView/Page.tsx`
- **Line component:** `src/components/QuranReader/ReadingView/Line.tsx`

#### Reading View Component Hierarchy

```text
ReadingView → Page → groupLinesByVerses() → Line → VerseText → QuranWord
```

---

## Translation View Implementation

### Overview

Translation View displays verses one by one with translations, not bound by Mushaf page boundaries.

### Key Difference from Reading View

| Aspect           | Reading View             | Translation View         |
| ---------------- | ------------------------ | ------------------------ |
| Unit             | Mushaf page              | Single verse             |
| Pagination       | Physical page boundaries | API pagination (perPage) |
| Layout           | Lines within pages       | Verse blocks             |
| Uses pagesLookup | For page boundaries      | For verse count only     |

### Component Hierarchy

```
TranslationView
├── useGetVersesCount (hook) - uses useFetchPagesLookup
├── useQcfFont (hook)
├── Virtuoso (virtualized list)
│   └── TranslationViewVerse (for each verse index)
│       ├── VerseText (Quran text)
│       └── TranslationText (translations)
└── EndOfScrollingControls
```

### useGetVersesCount Hook

Calculates total verses for Translation View virtualization:

1. Uses `useFetchPagesLookup` to get the verse range
2. Generates all verse keys between `from` and `to`
3. Returns the count for Virtuoso's `totalCount`

**Reference:** `src/components/QuranReader/TranslationView/hooks/useGetVersesCount.ts`

---

## Font and Mushaf Relationship

### How Font Selection Affects Page Layout

The selected `quranFont` determines which `mushaf` ID is used for API calls, which in turn affects:

1. **Page boundaries** - Which verses appear on which page
2. **Total page count** - Different Mushafs have different total pages
3. **Word positioning** - Each word has `pageNumber` and `lineNumber` for that Mushaf

### getMushafId Function

Converts font selection to Mushaf ID. Special handling for IndoPak font which splits into 15-line
(610 pages) or 16-line (548 pages) variants.

**Reference:** `src/utils/api.ts` → `getMushafId()`

### Font Selection Flow

```
User changes font in settings
        │
        ▼
Redux action: setQuranFont
        │
        ▼
quranReaderStyles.quranFont updates
        │
        ▼
useFetchPagesLookup recalculates mushafId
        │
        ▼
New API call to /pages/lookup?mushaf=NEW_ID
        │
        ▼
pagesVersesRange updates with new page boundaries
        │
        ▼
Components re-render with correct page layout
```

### Connection to Font Rendering

> **See also:** `docs/internal-font-rendering-guide.md`

The page layout system is tightly coupled with font rendering:

1. **QCF fonts** (V1, V2, V4) use glyph codes that are page-specific
2. **Each word** has a `pageNumber` field used for:
   - Loading the correct page-specific font file
   - Grouping words into lines for Reading View
   - Determining when to switch font files

Each word includes `pageNumber`, `lineNumber`, glyph codes (`code_v1`, `code_v2`), and Unicode text
(`text_uthmani`).

**Reference:** `types/Word.ts`

### Font Scale Impact on Page Layout

> **See also:** `docs/font-rendering-system.md` - Font Scaling section

Font scale selection directly affects how page layouts are rendered in Reading View.

#### Maintaining Mushaf Page Boundaries

In Reading View at smaller font scales (1-3), we strive to maintain **authentic Mushaf page
boundaries**:

- Each line matches the same boundaries as the physical Mushaf
- Page breaks align with printed Mushaf pages
- Words don't overflow their designated line positions
- Consistent visual appearance across different pages

This creates an interleaved reading experience that closely mirrors reading from a physical Quran.

#### Big Text Layout Mode

When font scale exceeds level 3, or when Word-by-Word features are enabled, we switch to "Big Text
Layout" mode.

**Trigger conditions:** Font scale > 3 OR Word-by-Word translation/transliteration enabled.

**Reference:** `src/components/dls/QuranWord/VerseText.tsx` → `isBigTextLayout`

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

#### Line Width Scaling

For Reading View, line width scales with font size. The function `getLineWidthClassName()` generates
classes like `.code_v2-line-width-1` through `.code_v2-line-width-10` to size line containers
appropriately.

**Reference:** `src/utils/quranReaderStyles.ts` → `getLineWidthClassName()`

---

## Data Flow

### Server-Side (getStaticProps)

```text
Pseudo-code:
1. Get default Mushaf ID for locale
2. Fetch pages lookup with default Mushaf
3. Get first page's verse range from lookup response
4. Fetch verses for first page only (for SSR)
5. Attach pagesLookup to response for client reuse
```

**Reference:** `src/pages/[chapterId]/index.tsx` → `getStaticProps`

### Client-Side (useFetchPagesLookup)

Fetches page boundaries with SWR caching:

- Uses SSR data as fallback
- Only revalidates if user changed font from default
- Returns: `pagesCount`, `pagesVersesRange`, `lookupRange`, loading/error states

**Reference:** `src/components/QuranReader/hooks/useFetchPagesLookup.ts`

### getPagesLookupParams

Builds API params based on `QuranReaderDataType`:

- Chapter → `chapterNumber`
- Juz → `juzNumber`
- Hizb → `hizbNumber`
- Page → `pageNumber`
- Verse/Ranges → `from`/`to` verse keys

**Reference:** `src/components/QuranReader/api.ts` → `getPagesLookupParams()`

---

## Caching and Revalidation Strategy

### isUsingDefaultFont Flag

Determines whether to revalidate cached data:

- Default font for locale → use SSR data, no revalidation
- Custom font → revalidate to get correct page boundaries

**Reference:** `src/redux/slices/QuranReader/styles.ts` → `selectIsUsingDefaultFont`

### SWR Configuration

Caching strategy:

- `fallbackData`: SSR data used until client fetch completes
- `revalidateOnMount`: Only revalidate if user settings differ from SSR defaults

### Cache Key Stability

Request keys must be stable to prevent cache misses. Wait for Redux persist hydration to complete
before generating request keys to ensure user settings are loaded.

---

## Virtualization

### Why Virtualization?

A chapter like Al-Baqarah has 286 verses across ~48 Mushaf pages. Rendering all at once would be
slow and memory-intensive.

### React Virtuoso Setup

Configuration:

- Uses window scroll (not internal scroll)
- Pre-renders buffer area for smooth scrolling
- `totalCount` = pages count + 1 (for end-of-scroll controls)
- `initialItemCount` = 1 for SSR compatibility

### Scroll to Verse

Calculates scroll alignment based on verse position within page:

- First third of page → scroll to start
- Middle third → scroll to center
- Last third → scroll to end

**Reference:** `src/components/QuranReader/ReadingView/hooks/useScrollToVirtualizedVerse.ts`

---

## SSR and Hydration

### Initial Data Strategy

1. **Server-side**: Fetch with default locale settings
2. **Client-side**: Use SSR data as fallback, revalidate if settings differ

### Hydration Race Condition Fix

**The Problem:** During SSR, default locale settings are used. After hydration, user's persisted
Redux state may differ (e.g., different `mushafLines`). Different settings → different request keys
→ cache miss and unnecessary refetch.

**The Solution:** Wait for Redux persist hydration to complete before generating request keys. This
ensures user settings are loaded before making API calls.

**Reference:** `src/components/QuranReader/ReadingView/PageContainer.tsx`

---

## Key Files Reference

### Core Components

| File                                                       | Purpose                             |
| ---------------------------------------------------------- | ----------------------------------- |
| `src/components/QuranReader/index.tsx`                     | Main QuranReader wrapper            |
| `src/components/QuranReader/QuranReaderView.tsx`           | View switcher (Reading/Translation) |
| `src/components/QuranReader/ReadingView/index.tsx`         | Mushaf-style Reading View           |
| `src/components/QuranReader/TranslationView/index.tsx`     | Verse-by-verse Translation View     |
| `src/components/QuranReader/ReadingView/PageContainer.tsx` | Page data fetcher and renderer      |
| `src/components/QuranReader/ReadingView/Page.tsx`          | Single Mushaf page component        |

### Hooks

| File                                                                          | Purpose                 |
| ----------------------------------------------------------------------------- | ----------------------- |
| `src/components/QuranReader/hooks/useFetchPagesLookup.ts`                     | Fetches page boundaries |
| `src/components/QuranReader/TranslationView/hooks/useGetVersesCount.ts`       | Calculates total verses |
| `src/components/QuranReader/ReadingView/hooks/useScrollToVirtualizedVerse.ts` | Scroll navigation       |

### API and Utilities

| File                                | Purpose                                        |
| ----------------------------------- | ---------------------------------------------- |
| `src/api.ts`                        | API client functions including`getPagesLookup` |
| `src/components/QuranReader/api.ts` | Request key generators                         |
| `src/utils/apiPaths.ts`             | URL builders including`makePagesLookupUrl`     |
| `src/utils/api.ts`                  | `getMushafId` and word field helpers           |
| `src/utils/page.ts`                 | Mushaf page utilities                          |

### Types

| File                    | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `types/QuranReader.ts`  | Enums:`QuranFont`, `Mushaf`, `QuranReaderDataType` |
| `types/ApiRequests.ts`  | `PagesLookUpRequest`                               |
| `types/ApiResponses.ts` | `PagesLookUpResponse`, `VersesResponse`            |
| `types/LookupRecord.ts` | Page-to-verse mapping type                         |
| `types/LookupRange.ts`  | Verse range type                                   |

### Redux

| File                                     | Purpose                  |
| ---------------------------------------- | ------------------------ |
| `src/redux/slices/QuranReader/styles.ts` | Font/Mushaf settings     |
| `src/redux/defaultSettings/util.ts`      | Locale-specific defaults |

---
