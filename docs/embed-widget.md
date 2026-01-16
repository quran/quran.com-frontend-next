# Embed Widget

This document is a full reference for the Ayah embed widget: architecture, data flow, fonts, and how
to extend it safely. Use this if you are onboarding or adding new widget options.

## What the widget is

The widget renders one ayah (or a small range) with Arabic text, translations, optional audio, and
action buttons. It is embedded on external sites via an `<iframe>` pointing to `/embed/v1`, and it
can also be configured through the builder page inside this app.

## Key entry points

| File                                                | Purpose                                       |
| --------------------------------------------------- | --------------------------------------------- |
| `src/pages/embed/index.tsx`                         | Builder page UI                               |
| `src/pages/embed/v1.tsx`                            | Embed page (iframe content)                   |
| `src/components/AyahWidget/widget-config.ts`        | Main config entry (re-exports modules)        |
| `src/components/AyahWidget/widget-types.ts`         | Type definitions                              |
| `src/components/AyahWidget/widget-defaults.ts`      | Default values and constants                  |
| `src/components/AyahWidget/widget-embed.ts`         | Iframe URL and snippet builders               |
| `src/components/AyahWidget/widget-form.ts`          | Builder form field definitions                |
| `src/components/AyahWidget/widget-utils.ts`         | Utility functions (formatting, grouping)      |
| `src/components/AyahWidget/getAyahWidgetData.ts`    | Server-side data fetching                     |
| `src/components/AyahWidget/queryParsing.ts`         | Query parameter parsing utilities             |
| `src/hooks/widget/useAyahWidgetPreview.ts`          | Preview hook for the builder                  |
| `src/hooks/widget/useWidgetInteractions.ts`         | Client-side interactions (copy, share, audio) |
| `src/hooks/widget/useAyahWidgetEmbedPreferences.ts` | Hook for widget embed preferences             |

## High-level data flow

1. Builder page renders a configuration UI (`BuilderConfigForm`) and a live preview
   (`BuilderPreview`).
2. User changes are stored in React state + Redux overrides.
3. Preview hook builds an iframe URL for `/embed/v1` based on preferences.
4. The iframe renders the embed page, which loads the widget UI via SSR.

## Module structure

The widget configuration is split into focused modules:

```
src/components/AyahWidget/
├── widget-types.ts      # Type definitions (Preferences, RangeMeta, etc.)
├── widget-defaults.ts   # DEFAULTS, INITIAL_PREFERENCES, getMushafFromQuranFont
├── widget-embed.ts      # buildEmbedIframeSrc, buildEmbedIframeConfig, buildEmbedSnippet
├── widget-form.ts       # WIDGET_FIELDS, WIDGET_FORM_BLOCKS, getWidgetLocaleOptions
├── widget-config.ts     # Main entry: re-exports + utility functions
├── getAyahWidgetData.ts # Server-side data fetching
└── queryParsing.ts      # Shared query param parsers
```

### Main exports from widget-config.ts

- `DEFAULTS`: static defaults (surah, ayah, reciter, iframe URL)
- `INITIAL_PREFERENCES`: base preferences for a blank widget
- `getBasePreferences`: merges site defaults (theme/locale/mushaf/wbw) into widget defaults
- `applyWidgetOverrides`: merges Redux overrides into base preferences
- `buildOverridesFromDiff`: creates a minimal override patch after user changes
- `buildEmbedIframeSrc`: builds the `/embed/v1` URL with query params
- `buildEmbedIframeConfig`: computes iframe URL + sizing for snippet/preview
- `buildEmbedSnippet`: builds the final embed HTML snippet
- `WIDGET_FIELDS` and `WIDGET_FORM_BLOCKS`: drive the builder UI

## Builder behavior

The builder maintains two "sources" of defaults:

- Site settings (theme, locale, mushaf, WBW)
- Previously saved widget overrides (Redux)

Flow in `src/pages/embed/index.tsx`:

1. Build base preferences from site settings (`getBasePreferences`).
2. Apply stored widget overrides (`applyWidgetOverrides`).
3. Persist future user changes using `setUserPreferences` which also updates overrides.

This means:

- First time visit uses site defaults.
- Any user change becomes an override.
- Returning to `/embed` uses overrides first, otherwise site defaults.

### Translations behavior

Translations are stored as objects in `Preferences`, but overrides store only IDs. On load,
translations are rehydrated once translations are fetched.

### Range behavior

Range selection is clamped:

- Max 10 verses from the start
- Never beyond the chapter verse count

The range UI is normalized by `normalizeRangePreferences`. When range is enabled/disabled, it
recomputes a valid `rangeEnd`.

## Preview behavior

`src/hooks/widget/useAyahWidgetPreview.ts`:

- Clears the preview container
- Creates an `<iframe>` inside the preview container
- Uses `buildEmbedIframeConfig` to compute URL + sizing

## Embed iframe

The embed is an iframe pointing to `/embed/v1` with query params.

### Environment variables

- `NEXT_PUBLIC_EMBED_URL`: forces the iframe base URL (useful for local/testing)

### Query parameters

| Parameter             | Description                                          | Default |
| --------------------- | ---------------------------------------------------- | ------- |
| `verses`              | Verse range (e.g., `33:56` or `33:56-60`)            | `33:56` |
| `translations`        | Comma-separated translation IDs                      | -       |
| `audio`               | Enable audio (`true`/`false`)                        | `true`  |
| `reciter`             | Reciter ID                                           | `7`     |
| `theme`               | Theme (`light`/`dark`/`sepia`)                       | `light` |
| `mushaf`              | Mushaf type (`qpc`, `kfgqpc_v1`, etc.)               | `qpc`   |
| `locale`              | Widget locale                                        | `en`    |
| `wbw`                 | Enable word-by-word translation (`true`/`false`)     | `false` |
| `wbwTransliteration`  | Enable word-by-word transliteration (`true`/`false`) | `false` |
| `showTranslationName` | Show translator names                                | `false` |
| `showArabic`          | Show Arabic text                                     | `true`  |
| `tafsir`              | Show tafsirs button                                  | `true`  |
| `lessons`             | Show lessons button                                  | `true`  |
| `reflections`         | Show reflections button                              | `true`  |
| `answers`             | Show answers button                                  | `true`  |

## Widget interactions

Client-side interactions are handled by `src/hooks/widget/useWidgetInteractions.ts`:

- **Copy**: Copies formatted text (Arabic + translation + URL) to clipboard
- **Share**: Copies the quran.com URL to clipboard
- **Audio**: Toggle play/pause with time clamping for verse segments

## Fonts and mushaf system

Mushaf selection determines the Arabic font and verse-end glyph handling.

Key files:

- `src/components/AyahWidget/mushaf-fonts.ts`: maps mushaf to font families
- `src/components/AyahWidget/ArabicVerse.tsx`: renders Arabic + verse-end token
- `docs/font-rendering-system.md` and `docs/internal-font-rendering-guide.md`

Notes:

- For IndoPak, the verse-end glyphs come from the API text, not manual construction.
- The API uses 16-line mushaf for IndoPak to ensure glyphs exist.
- The verse-end glyph spans should use the same mushaf font family to render correctly.

## Localization

Widget labels are localized via `next-translate` in the embed page. The builder locale list is
derived from `i18n.json`. The header now uses a `quran` label from `quran-reader` (`q-and-a.quran`).
Action labels include separate `reflections` and `lessons` keys.

If you add new labels:

- Add keys in translation JSONs
- Update `WidgetLabels` in `types/Embed.ts` if needed
- Ensure the embed page returns the new labels

## Adding a new widget option

Example: add a new "playButtonPosition".

1. Add the new field in `Preferences` inside `widget-types.ts`.
2. Add a default value in `INITIAL_PREFERENCES` in `widget-defaults.ts`.
3. If it is not a simple scalar, add it to `SPECIAL_PREFERENCE_KEYS` in `widget-config.ts`.
4. If it needs to be passed to the iframe, add it in `buildEmbedIframeSrc` in `widget-embed.ts`.
5. Add a UI field to `WIDGET_FIELDS` and place it in `WIDGET_FORM_BLOCKS` in `widget-form.ts`.
6. Update the embed page (`src/pages/embed/v1.tsx`) to parse and apply the new query param.
7. Update widget components to consume the option.
8. Add or update Playwright tests in `tests/integration/widget`.

## Testing

Tests live in `tests/integration/widget`. The helper `renderWidgetPage` in
`tests/integration/widget/widget-helper.ts` can render the widget in isolation.

Add tests for:

- Default behaviors
- Range behavior
- Locale changes
- Mushaf glyphs
- Copy and link behavior
- Error handling

## Debug tips

- Inspect the iframe `src` to confirm the right query params.
- Use `NEXT_PUBLIC_AYAH_WIDGET_ORIGIN` for local/testing if you need a custom origin.
- Check the browser console for clipboard or audio errors.
