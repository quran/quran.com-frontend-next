# Embed Widget

This document is a full reference for the Ayah embed widget: architecture, data flow, fonts, and how
to extend it safely. Use this if you are onboarding or adding new widget options.

## What the widget is

The widget renders one ayah (or a small range) with Arabic text, translations, optional audio, and
action buttons. It can be embedded on external sites via a `<script>` tag, and it can also be
configured through the builder page inside this app.

## Key entry points

- Builder page UI: `src/pages/ayah-widget.tsx`
- Embed script: `public/embed/quran-embed.js`
- API endpoint: `src/pages/api/ayah-widget.tsx`
- Widget components: `src/components/AyahWidget/*`
- Preview hook: `src/hooks/widget/useAyahWidgetPreview.ts`
- Widget config registry: `src/components/AyahWidget/widget-config.ts`

## High-level data flow

1. Builder page renders a configuration UI (`BuilderConfigForm`) and a live preview
   (`BuilderPreview`).
2. User changes are stored in React state + Redux overrides.
3. Preview hook injects the embed script and passes data attributes based on preferences.
4. The embed script reads `data-*` attributes and calls `/api/ayah-widget`.
5. The API returns rendered HTML + data needed for the widget.
6. The embed script injects the HTML into the target container.

## The centralized registry (single source of truth)

All widget option metadata and helpers live in:

`src/components/AyahWidget/widget-config.ts`

This file is the single place to:

- Define default values
- Define which options are "simple" and auto-handled
- Build the embed snippet and preview attributes
- Render builder fields
- Normalize range behavior
- Map site preferences to widget defaults

### Important exports

- `DEFAULTS`: static defaults (surah, ayah, reciter, snippet URL)
- `INITIAL_PREFERENCES`: base preferences for a blank widget
- `getBasePreferences`: merges site defaults (theme/locale/mushaf/wbw) into widget defaults
- `applyWidgetOverrides`: merges Redux overrides into base preferences
- `buildOverridesFromDiff`: creates a minimal override patch after user changes
- `buildWidgetScriptAttributes`: generates `data-quran-*` attributes
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
- Creates a target `<div>`
- Injects the embed script
- Sets `data-quran-allow-rerender` so the script can rerender without full reload
- Uses `buildWidgetScriptAttributes` for the rest of the attributes

## Embed script

`public/embed/quran-embed.js` is the external entry point. It reads the `data-quran-*` attributes
and fetches HTML from the API.

### Environment variables

These are the widget-specific environment variables currently supported:

- `NEXT_PUBLIC_AYAH_WIDGET_SCRIPT_URL`: overrides the embed script URL used in the snippet.
- `NEXT_PUBLIC_AYAH_WIDGET_ORIGIN`: forces the embed script to use a specific API origin (useful for
  local/testing).

### Common data attributes

- `data-quran-target`
- `data-quran-ayah` (S:V)
- `data-quran-translation-ids`
- `data-quran-reciter-id`
- `data-quran-audio`
- `data-quran-word-by-word`
- `data-quran-theme`
- `data-quran-mushaf`
- `data-quran-show-translator-names`
- `data-quran-show-arabic`
- `data-quran-show-tafsirs`
- `data-quran-show-reflections`
- `data-quran-show-answers`
- `data-quran-locale`
- `data-quran-range-end`
- `data-width`, `data-height`
- `data-quran-origin` (optional, mostly for local/testing)

The embed script should be treated as the external contract: changes here affect all external users.

## API endpoint

`src/pages/api/ayah-widget.tsx` reads query parameters and returns the widget HTML.

### Validation and errors

- Validates ayah format and bounds.
- Validates chapter/verse ranges against chapter metadata.
- Validates locale against `i18n.json`.
- Range is capped to 10 verses; requesting more returns an error.

Errors are returned with a `message` and surfaced by the embed script.

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
4. If it needs to be passed to the embed script, add it in `buildWidgetScriptAttributes`.
5. Add a UI field to `WIDGET_FIELDS` and place it in `WIDGET_FORM_BLOCKS`.
6. Update the embed script (`public/embed/quran-embed.js`) to read the new `data-*` attribute.
7. Update the API endpoint to parse, validate, and pass it into widget rendering.
8. Update widget components to consume the option.
9. Add or update Playwright tests in `tests/integration/widget`.

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

- Use `data-quran-origin` to point the embed script at a local API.
- Check the API error response body if the widget shows a generic error.
- Verify the `data-quran-*` attributes in the generated snippet and preview.
