# Embed Widget

This document is a full reference for the Ayah embed widget: architecture, data flow, fonts, and how
to extend it safely. Use this if you are onboarding or adding new widget options.

## What the widget is

The widget renders one ayah (or a small range) with Arabic text, translations, optional audio, and
action buttons. It is embedded on external sites via an `<iframe>` pointing to `/embed/v1`, and it
can also be configured through the builder page inside this app.

## Key entry points

- Builder page UI: `src/pages/ayah-widget.tsx`
- Embed page: `/embed/v1` (served by Quran.com)
- Legacy API endpoint (script-based embed): `src/pages/api/ayah-widget.tsx`
- Widget components: `src/components/AyahWidget/*`
- Preview hook: `src/hooks/widget/useAyahWidgetPreview.ts`
- Widget config registry: `src/components/AyahWidget/widget-config.ts`

## High-level data flow

1. Builder page renders a configuration UI (`BuilderConfigForm`) and a live preview
   (`BuilderPreview`).
2. User changes are stored in React state + Redux overrides.
3. Preview hook builds an iframe URL for `/embed/v1` based on preferences.
4. The iframe renders the embed page, which loads the widget UI.

## The centralized registry (single source of truth)

All widget option metadata and helpers live in:

`src/components/AyahWidget/widget-config.ts`

This file is the single place to:

- Define default values
- Define which options are "simple" and auto-handled
- Build the embed snippet and iframe URL
- Render builder fields
- Normalize range behavior
- Map site preferences to widget defaults

### Important exports

- `DEFAULTS`: static defaults (surah, ayah, reciter, iframe URL)
- `INITIAL_PREFERENCES`: base preferences for a blank widget
- `getBasePreferences`: merges site defaults (theme/locale/mushaf/wbw) into widget defaults
- `applyWidgetOverrides`: merges Redux overrides into base preferences
- `buildOverridesFromDiff`: creates a minimal override patch after user changes
- `buildEmbedIframeSrc`: builds the `/embed/v1` URL with query params
- `buildEmbedIframeConfig`: computes iframe URL + sizing for snippet/preview
- `buildEmbedSnippet`: builds the final embed HTML snippet
- `WIDGET_FIELDS` and `WIDGET_FORM_BLOCKS`: drive the builder UI

Because the builder, snippet, and preview all read from this registry, adding a new option should be
centralized here.

## Builder behavior

The builder maintains two "sources" of defaults:

- Site settings (theme, locale, mushaf, WBW)
- Previously saved widget overrides (Redux)

Flow in `src/pages/ayah-widget.tsx`:

1. Build base preferences from site settings (`getBasePreferences`).
2. Apply stored widget overrides (`applyWidgetOverrides`).
3. Persist future user changes using `setUserPreferences` which also updates overrides.

This means:

- First time visit uses site defaults.
- Any user change becomes an override.
- Returning to `/ayah-widget` uses overrides first, otherwise site defaults.

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

These are the widget-specific environment variables currently supported:

- `NEXT_PUBLIC_AYAH_WIDGET_SCRIPT_URL`: overrides the iframe base URL (full URL or path). Default:
  `https://quran.com/embed/v1`.
- `NEXT_PUBLIC_AYAH_WIDGET_ORIGIN`: forces the iframe base origin (useful for local/testing if the
  URL override is not set).

### Common query parameters

- `verses` (S:V or S:V-V)
- `translations`
- `audio`
- `reciter`
- `theme`
- `font`
- `locale`
- `wbw`
- `showTranslationName`
- `showArabic`
- `tafsir`
- `reflections`
- `answers`

## API endpoint

`src/pages/api/ayah-widget.tsx` is the legacy HTML API used by the old script-based embed. The
iframe-based embed uses `/embed/v1` directly, so this endpoint is no longer part of the main
integration flow (keep it only if you still need the legacy path).

### Validation and errors

- Validates ayah format and bounds.
- Validates chapter/verse ranges against chapter metadata.
- Validates locale against `i18n.json`.
- Range is capped to 10 verses; requesting more returns an error.

Errors are returned with a `message` and surfaced by the legacy script-based embed.

### Word by word translation locale

If WBW is enabled, the API tries to use the widget locale for WBW if available. If not available, it
falls back to `en`.

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

If you change mushaf handling, validate both Arabic text and end glyphs in the widget and reader.

## Localization

Widget labels are localized via `next-translate` in the API. The builder locale list is derived from
`i18n.json`.

If you add new labels:

- Add keys in translation JSONs
- Update `WidgetLabels` in `types/ayah-widget.ts` if needed
- Ensure the API returns the new labels

## Adding a new widget option

Example: add a new "playButtonPosition".

1. Add the new field in `Preferences` inside `src/components/AyahWidget/widget-config.ts`.
2. Add a default value in `INITIAL_PREFERENCES`.
3. If it is not a simple scalar, add it to `SPECIAL_PREFERENCE_KEYS`.
4. If it needs to be passed to the iframe, add it in `buildEmbedIframeSrc`.
5. Add a UI field to `WIDGET_FIELDS` and place it in `WIDGET_FORM_BLOCKS`.
6. Update the embed page (Quran.com `/embed/v1`) to read and apply the new query param.
7. Update widget components to consume the option.
8. Add or update Playwright tests in `tests/integration/widget`.

If you do steps 1-5 only, the builder UI and override logic update automatically.

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
