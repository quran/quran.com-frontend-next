# Embeddable Quran Verse Widget

This document describes the embeddable Quran verse widget feature that allows third-party websites to embed Quran verses in iframes.

## Overview

The embed widget provides a way to display Quran verses with translations on external websites. It renders Arabic text using the same QCF (Quran Complex Font) fonts as the main Quran.com website, ensuring authentic and beautiful Quranic typography.

## Usage

### Basic Embed URL

```text
https://quran.com/embed/v1?verses=1:1-7&translations=131
```

### URL Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `verses` | Yes | Verse range in format `chapter:start-end` or `chapter:verse` | `1:1-7`, `2:255` |
| `translations` | No | Comma-separated translation IDs | `131`, `131,85` |
| `theme` | No | Theme: `light`, `dark`, or `auto` (default: `light`) | `dark` |
| `font` | No | Font style: `v1`, `v2`, `uthmani`, or `indopak` (default: `v2`) | `v2` |
| `fontSize` | No | Font size: `small`, `normal`, `large`, `xlarge` (default: `normal`) | `large` |
| `textAlign` | No | Text alignment: `start`, `center`, `end` (default: `start`) | `center` |
| `borderRadius` | No | Border radius in pixels (default: `8`) | `12` |
| `locale` | No | Locale code (default: `en`) | `ar`, `ur` |
| `showReference` | No | Show verse reference (`true`/`false`, default: `true`) | `false` |
| `showTranslationName` | No | Show translator name (`true`/`false`, default: `true`) | `false` |
| `audio` | No | Enable audio player (`true`/`false`, default: `false`) | `true` |
| `reciter` | No | Reciter ID for audio (default: `7` - Mishary Alafasy) | `2` |
| `autoPlay` | No | Auto-play audio on load (`true`/`false`, default: `false`) | `true` |
| `wbw` | No | Enable word-by-word translation (`true`/`false`, default: `false`) | `true` |
| `wbwLocale` | No | Word-by-word translation locale (default: `en`) | `ur` |
| `wbwTransliteration` | No | Show transliteration (`true`/`false`, default: `true`) | `false` |
| `tafsir` | No | Show tafsir button (`true`/`false`, default: `false`) | `true` |
| `aid` | No | Analytics/affiliate ID for tracking | `my-site-id` |

### Embedding in HTML

```html
<iframe
  src="https://quran.com/embed/v1?verses=1:1-7&translations=131"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 8px;"
></iframe>
```

### Advanced Example with Audio

```html
<iframe
  src="https://quran.com/embed/v1?verses=2:255&translations=131&audio=true&reciter=7&theme=dark&font=v2"
  width="100%"
  height="500"
  frameborder="0"
  style="border-radius: 12px;"
></iframe>
```

### Embed Generator

Use the visual embed generator at `/embed-preview.html` to configure your embed:

- Select chapter and verses
- Choose translations
- Customize appearance (theme, fonts, colors)
- Enable audio playback
- Copy the generated embed code

## Architecture

### File Structure

```text
src/
├── pages/embed/v1/
│   └── index.tsx          # Embed page with SSR data fetching
├── components/Embed/
│   ├── EmbedContainer.tsx # Main container, handles font loading
│   ├── EmbedVerse.tsx     # Individual verse display
│   ├── EmbedVerseText.tsx # QCF glyph rendering component
│   ├── EmbedFooter.tsx    # Quran.com branding footer
│   ├── Embed.module.scss  # Container styles
│   └── EmbedVerseText.module.scss # Verse text styles
├── utils/
│   └── embed.ts           # Config parsing and validation
└── types/
    └── Embed.ts           # TypeScript interfaces
```

### Key Components

#### `EmbedContainer`

- Wraps all verses in a scrollable container
- Loads QCF fonts using `useQcfFont` hook
- Passes font configuration to child components

#### `EmbedVerseText`

- Renders Arabic text using QCF glyph codes
- Applies page-specific font-family for each word
- Handles both MadaniV1 and MadaniV2 font variants

#### `parseEmbedConfig`

- Parses and validates URL query parameters
- Provides sensible defaults for optional parameters
- Returns typed `EmbedConfig` object

### Font Rendering

The widget uses the same QCF (Quran Complex Font) system as the main site:

1. **Font Loading**: The `useQcfFont` hook dynamically loads font files from `qurancdn.com`
2. **Page-Specific Fonts**: Each Quran page has its own font file (e.g., `p1-v2` for page 1, V2 font)
3. **Glyph Codes**: API returns `codeV1`/`codeV2` fields containing special Unicode glyphs
4. **Inline Styling**: Each word span gets `fontFamily` set to the appropriate page font

```tsx
// Example: Rendering a QCF glyph
<span style={{ fontFamily: getFontFaceNameForPage(quranFont, word.pageNumber) }}>
  {word.codeV2}
</span>
```

## Security

### Content Security Policy

The embed pages have a custom CSP configured in `src/middleware.ts`:

```javascript
// CSP for embed pages
"frame-ancestors *;
 default-src 'self' *.qurancdn.com;
 style-src 'self' 'unsafe-inline';
 script-src 'self' 'unsafe-inline' 'unsafe-eval';
 font-src 'self' *.qurancdn.com data: blob:;
 img-src * data:;
 connect-src *"
```

Key security features:

- `frame-ancestors *` - Allows embedding in any iframe
- `'unsafe-inline'` for styles - Required for font-family inline styles
- Font sources limited to `self` and `qurancdn.com`

### API Protection

The embed uses server-side rendering (SSR) to fetch data, which:

- Keeps API tokens/signatures on the server
- Prevents exposure of internal API endpoints
- Allows caching at the edge

## Development

### Running Locally

```bash
yarn dev
# Visit: http://localhost:3000/embed/v1?verses=1:1-7&translations=131
```

### Testing

```bash
# Run embed-related tests
yarn test src/utils/embed.test.ts
```

### Adding New Parameters

1. Update `EmbedConfig` interface in `types/Embed.ts`
2. Add parsing logic in `parseEmbedConfig()` in `src/utils/embed.ts`
3. Add tests in `src/utils/embed.test.ts`
4. Use the new config in components

## Troubleshooting

### Fonts Not Rendering

1. **CSP Blocking**: Check browser console for CSP violations
2. **Font Loading**: Verify `useQcfFont` is called with correct parameters
3. **API Response**: Ensure API returns `codeV1`/`codeV2` fields

### Iframe Not Displaying

1. Check that the parent site allows iframes
2. Verify the embed URL is correct
3. Check browser console for mixed content warnings (http/https)

## Future Improvements

- [x] Theme customization (light/dark)
- [x] Audio playback support
- [x] Word-by-word translation overlay
- [x] Multiple font options (MadaniV1, MadaniV2, Uthmani, IndoPak)
- [x] Font size scaling
- [x] Embed code generator UI
- [ ] Custom CSS injection for advanced styling
- [ ] Verse highlighting during audio playback
- [ ] Social sharing buttons
- [ ] Bookmark/save functionality
