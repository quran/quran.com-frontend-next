---
description: How to add a new language/locale to Quran.com Frontend
---

# Adding a New Language to Quran.com Frontend

This guide explains how to add support for a new language (e.g., Vietnamese `vi`).

## Prerequisites

Before starting, you need:

1. **Content DB Language ID** - The numeric ID of the language in the content database (e.g., `177`
   for Vietnamese)
2. **Default Translation ID** - A translation ID from the content DB to use as the default for this
   locale
3. **Backend API support** - The language ISO code must be added to the backend types

---

## Step-by-Step Guide

### 1. Add Language Enum (Frontend)

**File:** `types/Language.ts`

Add the new language ISO code to the enum:

```typescript
enum Language {
  // ... existing languages
  VI = 'vi', // Vietnamese
}
```

---

### 2. Add Language Enum (Backend)

**File:** `packages/types/src/preferences/Language.ts` (in `quran.com-users-backend`)

Add the language to the backend types so the API can accept it:

```typescript
enum Language {
  // ... existing languages
  Vietnamese = 'vi',
}
```

---

### 3. Add to i18n Config

**File:** `i18n.json`

Add the locale code to the `locales` array:

```json
{
  "locales": [
    "en",
    "ar",
    // ... other locales
    "vi" // Add new locale
  ]
}
```

---

### 4. Create Locale Translations Folder

**Directory:** `locales/{iso_code}/`

Create a new folder with all required translation JSON files. Copy from an existing locale (like
`en`) and translate:

```bash
cp -r locales/en locales/vi
```

Then translate each JSON file (e.g., `common.json`, `home.json`, etc.).

---

### 5. Add Locale Metadata

**File:** `src/utils/locale.ts`

This file contains several mappings that serve different purposes:

#### 5.1 Add to `LOCALE_NAME`

**Purpose:** Display the language name in its native script in the UI (language selector dropdown,
navigation drawer, settings).

**Used by:** `getLocaleName()` → `LanguageSelector`, `NavigationDrawer`, `TranslationSelectionBody`,
`WordByWordSection`

```typescript
const LOCALE_NAME = {
  // ... existing
  [Language.VI]: 'Tiếng Việt',
};
```

#### 5.2 Add to `LOCALE_NAME_TO_CODE` (if applicable)

**Purpose:** Map full language names (from backend/content DB) back to ISO codes. Used when
translation or reciter data returns the full language name (e.g., "vietnamese") instead of ISO code.

**Used by:** `getLocaleNameByFullName()` → `TafsirView/LanguageAndTafsirSelection`

> [!NOTE] Only add here if the backend returns full language names that need mapping. Check if
> translations/tafsirs return `"vietnamese"` as a language name.

```typescript
const LOCALE_NAME_TO_CODE = {
  // ... existing
  vietnamese: Language.VI,
};
```

#### 5.3 Add to `LANG_LOCALE_MAP`

**Purpose:** Full locale code (language + region) for JavaScript `Intl` APIs - used for number
formatting (`toLocalizedNumber`), date formatting (`toLocalizedDate`), and OpenGraph meta tags.

**Used by:** `toLocalizedNumber()`, `toLocalizedDate()`, `getOpenGraphLocale()`,
`getOpenGraphAlternateLocales()`

```typescript
export const LANG_LOCALE_MAP = {
  // ... existing
  [Language.VI]: 'vi-VN',
};
```

#### 5.4 Add to `Languages` object

**Purpose:** Map **Content DB language IDs** to locale metadata. Used to get direction, font, and
locale code when rendering translations/tafsirs (which return a `languageId` from the API).

**Used by:** `getLanguageDataById()` → `TafsirBody`, `TranslationText`, `FootnoteText`

```typescript
export const Languages = {
  // ... existing
  177: {
    // <-- Content DB language ID
    locale: Language.VI,
    // Optional: font: 'fontKey' - if custom font needed (mapped in global.scss)
    // Optional: dir: Direction.RTL - if RTL language
  },
};
```

#### 5.5 For RTL Languages Only

**Purpose:** Determine text direction for the locale. Affects `document.documentElement.dir` and
various RTL-aware components.

**Used by:** `isRTLLocale()`, `getDir()` → `_app.tsx`, `DirectionProvider`

```typescript
const RTL_LOCALES = [Language.AR, Language.FA, Language.UR, Language.NEW_RTL_LANG];
```

---

### 6. Create Default Settings for Locale

**File:** `src/redux/defaultSettings/locales/{iso_code}.ts`

Create a new file with locale-specific default settings. You can override **any setting from
`defaultSettings.ts`**:

#### Available Overrides:

| Setting                                       | Type                | Description                             | Example                     |
| --------------------------------------------- | ------------------- | --------------------------------------- | --------------------------- |
| `translations.selectedTranslations`           | `number[]`          | Default translation IDs from content DB | `[131]`                     |
| `tafsirs.selectedTafsirs`                     | `string[]`          | Default tafsir slugs                    | `['en-tafisr-ibn-kathir']`  |
| `quranReaderStyles.quranFont`                 | `QuranFont`         | Mushaf script style                     | `QuranFont.IndoPak`         |
| `readingPreferences.readingPreference`        | `ReadingPreference` | Translation vs Reading mode             | `ReadingPreference.Reading` |
| `readingPreferences.selectedWordByWordLocale` | `string`            | Word-by-word translation language       | `'bn'`                      |

#### Example: Simple locale (Vietnamese)

```typescript
import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

const DEFAULT_TRANSLATION = 220; // Translation ID from content DB

export default {
  ...DEFAULT_SETTINGS,
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
} as DefaultSettings;
```

#### Example: Arabic locale (no translation, reading mode, custom tafsir)

```typescript
import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';
import { ReadingPreference } from '@/types/QuranReader';

const DEFAULT_TAFSIR = 'ar-tafseer-al-qurtubi';

export default {
  ...DEFAULT_SETTINGS,
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [DEFAULT_TAFSIR] },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [] }, // No translation
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    readingPreference: ReadingPreference.Reading, // Reading mode instead of translation
  },
} as DefaultSettings;
```

#### Example: Bengali locale (IndoPak font, word-by-word, tafsir)

```typescript
import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';
import { QuranFont } from '@/types/QuranReader';

const DEFAULT_TRANSLATION = 161; // Taisirul Quran
const DEFAULT_TAFSIR = 'bn-tafsir-ahsanul-bayaan';

export default {
  ...DEFAULT_SETTINGS,
  quranReaderStyles: {
    ...DEFAULT_SETTINGS.quranReaderStyles,
    quranFont: QuranFont.IndoPak, // IndoPak script preferred in South Asia
  },
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedWordByWordLocale: 'bn', // Bengali word-by-word
  },
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [DEFAULT_TAFSIR] },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
} as DefaultSettings;
```

> [!TIP] Check existing locale files in `src/redux/defaultSettings/locales/` for more examples.

### 7. (Optional) Add Custom Font Support

If the language requires a special font:

#### 7.1 Download and optimize font file

```bash
# Download font (TTF format)
curl -L "https://example.com/Font-Regular.ttf" -o public/fonts/lang/{language}/Font-Regular.ttf

# Convert to optimized woff2 format
woff2_compress public/fonts/lang/{language}/Font-Regular.ttf

# Remove original TTF
rm public/fonts/lang/{language}/Font-Regular.ttf
```

Alternatively, download pre-compressed woff2 from sources like
[fontsource CDN](https://fontsource.org/).

#### 7.2 Add `@font-face` declaration

**File:** `src/styles/fonts.scss`

```scss
@font-face {
  font-family: 'CustomFontName';
  src: local('Custom Font'), url('/fonts/lang/{language}/Font-Regular.woff2') format('woff2');
  font-display: swap;
  // Optional: unicode-range for subsetting
  unicode-range: U+0102-0103, U+0110-0111;
}
```

#### 7.3 Add to FontPreLoader

**File:** `src/components/Fonts/FontPreLoader.tsx`

```typescript
const LOCALE_PRELOADED_FONTS = {
  // ... existing
  vi: [
    { type: 'font/woff2', location: '/fonts/lang/vietnamese/Font-Regular.woff2' },
    { ...SURAH_NAMES_FONT },
  ],
};
```

#### 7.4 Add font-family to global styles

**File:** `src/styles/global.scss`

```scss
:lang(vi),
:lang(vietnamese) {
  font-family: 'CustomFontName', 'Fallback Font', 'Figtree', Arial;
}
```

#### 7.5 Update `Languages` object with font reference

**File:** `src/utils/locale.ts`

```typescript
177: {
  locale: Language.VI,
  font: 'vietnamese',  // Add font key
},
```

---

## Checklist Summary

| Step                       | File(s)                                           | Required |
| -------------------------- | ------------------------------------------------- | -------- |
| 1. Add to Language enum    | `types/Language.ts`                               | ✅       |
| 2. Add to Backend types    | `packages/types/src/preferences/Language.ts`      | ✅       |
| 3. Add to i18n config      | `i18n.json`                                       | ✅       |
| 4. Create locale folder    | `locales/{iso_code}/`                             | ✅       |
| 5. Add locale metadata     | `src/utils/locale.ts` (5 places)                  | ✅       |
| 6. Create default settings | `src/redux/defaultSettings/locales/{iso_code}.ts` | ✅       |
| 7. Add custom font         | Multiple files                                    | Optional |

---

## Notes

- **Content DB IDs**: Language ID (step 5.4) and Translation ID (step 6) must match IDs in the
  Quran.com content database
- **Font optimization**: Always use woff2 format - compress with `woff2_compress` if you have TTF
  files
- **RTL languages**: Don't forget to add to `RTL_LOCALES` array
- **Fallback behavior**: If no custom font is specified, the default `Figtree` font will be used
