/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react';

import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import type { Preferences } from '@/components/AyahWidget/builder/types';
import BuilderConfigForm from '@/components/AyahWidget/BuilderConfigForm';
import BuilderPreview from '@/components/AyahWidget/BuilderPreview';
import useThemeDetector from '@/hooks/useThemeDetector';
import useAyahWidgetPreview from '@/hooks/widget/useAyahWidgetPreview';
import useAyahWidgetReciters from '@/hooks/widget/useAyahWidgetReciters';
import useAyahWidgetSurahs from '@/hooks/widget/useAyahWidgetSurahs';
import useAyahWidgetTranslations from '@/hooks/widget/useAyahWidgetTranslations';
import type { AyahWidgetOverrides } from '@/redux/slices/ayahWidget';
import { selectAyahWidgetOverrides, updateAyahWidgetOverrides } from '@/redux/slices/ayahWidget';
import { selectReadingPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranFont } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import ThemeType from '@/redux/types/ThemeType';
import styles from '@/styles/ayah-widget.module.scss';
import { QuranFont, WordByWordType } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import type AvailableTranslation from 'types/AvailableTranslation';
import type { MushafType } from 'types/ayah-widget';

// Default values for the Ayah Widget Builder
const DEFAULTS = {
  containerId: 'quran-embed-1',
  surah: 33, // Surah Al-Ahzab
  ayah: 56, // Ayah 56
  reciterId: 7, // Mishary Rashid Alafasy (ID 7)
  translationId: 131, // Mustafa Khattab
  copySuccessDurationMs: 2000,
  // CDN script used by the external embed snippet
  snippetScriptUrl:
    process.env.NEXT_PUBLIC_AYAH_WIDGET_SCRIPT_URL || 'https://quran.com/embed/quran-embed.js',
  // Optional origin override, mostly useful for local/testing
  snippetWidgetOrigin: process.env.NEXT_PUBLIC_AYAH_WIDGET_ORIGIN || '',
} as const;

// Initial settings shown in the builder UI
const INITIAL_PREFERENCES: Preferences = {
  containerId: DEFAULTS.containerId,
  selectedSurah: DEFAULTS.surah,
  selectedAyah: DEFAULTS.ayah,
  translations: [],
  theme: ThemeType.Light,
  mushaf: 'qpc',
  enableAudio: true,
  enableWbwTranslation: false,
  showTranslatorName: false,
  showTafsirs: true,
  showReflections: true,
  showAnswers: true,
  locale: 'en',
  reciter: DEFAULTS.reciterId,
  showArabic: true,
  rangeEnabled: false,
  rangeEnd: DEFAULTS.ayah + 1,
  customSize: {
    width: '100%',
    height: '',
  },
};

/**
 * Map the selected Quran font (reader setting) to the widget mushaf option.
 * @param {QuranFont} quranFont The selected Quran font.
 * @returns {MushafType} The corresponding mushaf type for the widget.
 */
const getMushafFromQuranFont = (quranFont: QuranFont): MushafType => {
  switch (quranFont) {
    case QuranFont.MadaniV1:
      return 'kfgqpc_v1';
    case QuranFont.MadaniV2:
      return 'kfgqpc_v2';
    case QuranFont.IndoPak:
      return 'indopak';
    case QuranFont.TajweedV4:
    case QuranFont.Tajweed:
      return 'tajweed';
    default:
      return 'qpc';
  }
};

/**
 * Build a comma-separated list of translation IDs from selected translations.
 * @param {AvailableTranslation[]} translations The selected translations.
 * @returns {string} Comma-separated translation IDs.
 */
function toTranslationIdsCsv(translations: AvailableTranslation[]): string {
  return translations
    .map((t) => t.id)
    .filter((id): id is number => typeof id === 'number')
    .join(',');
}

/**
 * Ensure the selected ayah stays in range [1..versesCount] for the selected surah.
 * @param {number} ayah The selected ayah number.
 * @param {number} versesCount The total number of verses in the selected surah.
 * @returns {number} The clamped ayah number.
 */
function clampAyahNumber(ayah: number, versesCount: number): number {
  if (ayah < 1) return 1;
  if (ayah > versesCount) return versesCount;
  return ayah;
}

/**
 * Group translations by language and apply a text filter.
 * @param {AvailableTranslation[]} allTranslations All available translations.
 * @param {string} searchQuery The search query to filter translations.
 * @param {string} otherLanguageLabel Label to use for translations with missing languageName
 * @returns {Array<[string, translations[]]>} Array tuples: [languageName, translations[]], sorted by languageName.
 */
function groupTranslationsByLanguage(
  allTranslations: AvailableTranslation[],
  searchQuery: string,
  otherLanguageLabel: string,
): Array<[string, AvailableTranslation[]]> {
  if (!allTranslations.length) return [];

  const q = searchQuery.trim().toLowerCase();

  // Filter by name/author/language
  const filtered = allTranslations.filter((tr) => {
    if (!q) return true;
    return (
      tr.name?.toLowerCase().includes(q) ||
      tr.authorName?.toLowerCase().includes(q) ||
      tr.languageName?.toLowerCase().includes(q)
    );
  });

  // Group by languageName (fallback label if missing)
  const grouped: Record<string, AvailableTranslation[]> = {};
  filtered.forEach((tr) => {
    const key = tr.languageName || otherLanguageLabel;
    grouped[key] ||= [];
    grouped[key].push(tr);
  });

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Generate verse options for the given versesCount.
 * Example: versesCount=3 -> [1,2,3]
 * @param {number | undefined} versesCount The total number of verses in the selected surah.
 * @returns {number[]} Array of verse numbers.
 */
function makeVerseOptions(versesCount?: number): number[] {
  if (!versesCount || versesCount < 1) return [];
  return Array.from({ length: versesCount }, (unused, i) => i + 1);
}

const hasOverride = (overrides: AyahWidgetOverrides, key: keyof AyahWidgetOverrides) =>
  Object.prototype.hasOwnProperty.call(overrides, key);

const getTranslationIds = (translations: AvailableTranslation[]): number[] =>
  translations.map((t) => t.id).filter((id): id is number => typeof id === 'number');

/**
 * Simple property keys that can be copied directly from overrides to preferences.
 */
const SIMPLE_OVERRIDE_KEYS: Array<keyof AyahWidgetOverrides> = [
  'containerId',
  'selectedSurah',
  'selectedAyah',
  'theme',
  'mushaf',
  'enableAudio',
  'enableWbwTranslation',
  'showTranslatorName',
  'showTafsirs',
  'showReflections',
  'showAnswers',
  'locale',
  'reciter',
  'showArabic',
  'rangeEnabled',
  'rangeEnd',
];

/**
 * Apply widget overrides to base preferences.
 * Handles simple properties via iteration and special cases (customSize) explicitly.
 * @param {Preferences} base The base preferences.
 * @param {AyahWidgetOverrides} overrides The overrides to apply.
 * @returns {Preferences} The merged preferences.
 */
const applyWidgetOverrides = (base: Preferences, overrides: AyahWidgetOverrides): Preferences => {
  const next: Preferences = { ...base };

  // Apply simple properties
  SIMPLE_OVERRIDE_KEYS.forEach((key) => {
    if (hasOverride(overrides, key)) {
      // Use type assertion since we know the types match between overrides and preferences
      (next as any)[key] = overrides[key] ?? (base as any)[key];
    }
  });

  // Handle customSize separately (nested object)
  if (hasOverride(overrides, 'customSize')) {
    next.customSize = {
      width: overrides.customSize?.width ?? base.customSize.width,
      height: overrides.customSize?.height ?? base.customSize.height,
    };
  }

  return next;
};

/**
 * Build overrides object by comparing previous and next preferences.
 * Only includes properties that actually changed.
 * @param {Preferences} prev The previous preferences.
 * @param {Preferences} next The next preferences.
 * @returns {AyahWidgetOverrides} The overrides representing the differences.
 */
const buildOverridesFromDiff = (prev: Preferences, next: Preferences): AyahWidgetOverrides => {
  const overrides: AyahWidgetOverrides = {};

  // Compare simple properties
  SIMPLE_OVERRIDE_KEYS.forEach((key) => {
    if ((prev as any)[key] !== (next as any)[key]) {
      (overrides as any)[key] = (next as any)[key];
    }
  });

  // Handle translations (convert to translationIds)
  const prevTranslationIds = getTranslationIds(prev.translations);
  const nextTranslationIds = getTranslationIds(next.translations);
  if (!areArraysEqual(prevTranslationIds, nextTranslationIds)) {
    overrides.translationIds = nextTranslationIds;
  }

  // Handle customSize (nested object comparison)
  if (
    prev.customSize.width !== next.customSize.width ||
    prev.customSize.height !== next.customSize.height
  ) {
    overrides.customSize = { ...next.customSize };
  }

  return overrides;
};

/**
 * Build the external embed snippet based on current preferences.
 *
 * The snippet uses:
 * - A <div> container with an id
 * - A <script> tag with `src` + `data-*` attributes
 *
 * The script reads the data-* and renders the widget into the target container.
 *
 * @param {Preferences} preferences The current widget preferences.
 * @param {string} translationIdsCsv Comma-separated list of selected translation IDs.
 * @returns {string} The complete embed snippet HTML.
 */
function buildEmbedSnippet(preferences: Preferences, translationIdsCsv: string): string {
  const widthValue = preferences.customSize.width?.trim() || '100%';
  const heightValue = preferences.customSize.height?.trim();

  // Inline styles on the container keep it self-contained for integrators.
  const containerStyles: string[] = [`width: ${widthValue}`];
  if (heightValue) containerStyles.push(`height: ${heightValue}`);

  const containerStyleAttr = containerStyles.length ? ` style="${containerStyles.join('; ')}"` : '';

  // The embed script consumes these attributes. We omit defaults where possible.
  const attrs: string[] = [
    `src="${DEFAULTS.snippetScriptUrl}"`,
    `data-quran-target="${preferences.containerId}"`,
    `data-quran-ayah="${preferences.selectedSurah}:${preferences.selectedAyah}"`,
  ];

  /**
   * Append an attribute if:
   * - the value is defined/non-empty
   * - and it differs from the provided defaultValue (if any)
   */
  const pushAttrIfNotDefault = (key: string, value: string | undefined, defaultValue?: string) => {
    if (!value) return;
    if (defaultValue !== undefined && value === defaultValue) return;
    attrs.push(`${key}="${value}"`);
  };

  // Optional origin override (mainly for testing/local)
  if (DEFAULTS.snippetWidgetOrigin) {
    attrs.splice(1, 0, `data-quran-origin="${DEFAULTS.snippetWidgetOrigin}"`);
  }

  // Push other attributes if they differ from defaults
  pushAttrIfNotDefault('data-quran-translation-ids', translationIdsCsv, '');
  pushAttrIfNotDefault(
    'data-quran-reciter-id',
    preferences.reciter ? String(preferences.reciter) : String(DEFAULTS.reciterId),
    String(DEFAULTS.reciterId),
  );
  pushAttrIfNotDefault('data-quran-audio', String(preferences.enableAudio), 'true');
  pushAttrIfNotDefault(
    'data-quran-word-by-word',
    String(preferences.enableWbwTranslation),
    'false',
  );
  pushAttrIfNotDefault('data-quran-theme', preferences.theme, 'light');
  pushAttrIfNotDefault('data-quran-mushaf', preferences.mushaf, 'qpc');
  pushAttrIfNotDefault(
    'data-quran-show-translator-names',
    String(preferences.showTranslatorName),
    'false',
  );
  pushAttrIfNotDefault('data-quran-show-arabic', String(preferences.showArabic), 'true');
  pushAttrIfNotDefault('data-quran-show-tafsirs', String(preferences.showTafsirs), 'true');
  pushAttrIfNotDefault('data-quran-show-reflections', String(preferences.showReflections), 'true');
  pushAttrIfNotDefault('data-quran-show-answers', String(preferences.showAnswers), 'true');
  pushAttrIfNotDefault('data-quran-locale', preferences.locale, 'en');
  pushAttrIfNotDefault(
    'data-quran-range-end',
    preferences.rangeEnabled ? String(preferences.rangeEnd) : undefined,
  );

  // Some embed scripts also read width/height from data attributes.
  // Keep them for compatibility with existing embed implementations.
  pushAttrIfNotDefault('data-width', widthValue, '100%');
  if (heightValue) {
    attrs.push(`data-height="${heightValue}"`);
  }

  return `<div id="${preferences.containerId}"${containerStyleAttr}></div>

<script
  ${attrs.join('\n  ')}
  async>
</script>`;
}

const AyahWidgetBuilderPage = () => {
  const { t, lang } = useTranslation('ayah-widget');
  const dispatch = useDispatch();

  // Redux selectors and memoized values
  const { themeVariant, settingsTheme } = useThemeDetector();
  const widgetOverrides = useSelector(selectAyahWidgetOverrides);
  const selectedTranslationIdsFromRedux = useSelector(selectSelectedTranslations);
  const quranFont = useSelector(selectQuranFont);
  const readingPreferences = useSelector(selectReadingPreferences);

  // Find the default resolved theme for the widget
  const resolvedTheme = useMemo(
    () => (settingsTheme.type === ThemeType.Auto ? themeVariant : settingsTheme.type),
    [settingsTheme.type, themeVariant],
  );
  // Map the selected Quran font to the widget mushaf option
  const mushafFromFont = useMemo(() => getMushafFromQuranFont(quranFont), [quranFont]);
  // Determine if word-by-word translation should be enabled based on reading preferences
  const shouldEnableWbwTranslation = readingPreferences.wordByWordContentType.includes(
    WordByWordType.Translation,
  );

  const basePreferences = useMemo(
    () => ({
      ...INITIAL_PREFERENCES,
      theme: resolvedTheme,
      locale: lang,
      mushaf: mushafFromFont,
      enableWbwTranslation: shouldEnableWbwTranslation,
    }),
    [resolvedTheme, lang, mushafFromFont, shouldEnableWbwTranslation],
  );

  // Builder preferences state (base defaults + user overrides).
  const [preferences, setPreferences] = useState<Preferences>(() =>
    applyWidgetOverrides(basePreferences, widgetOverrides),
  );

  // Keep preferences in sync when base defaults or stored overrides change.
  useEffect(() => {
    setPreferences((prev) => ({
      ...applyWidgetOverrides(basePreferences, widgetOverrides),
      // Preserve translations; we resolve them once translations are loaded.
      translations: prev.translations,
    }));
  }, [basePreferences, widgetOverrides]);

  // User-driven updates should persist their overrides to Redux.
  const setUserPreferences = useCallback(
    (updater: SetStateAction<Preferences>) => {
      setPreferences((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (next === prev) return prev;

        const overridesPatch = buildOverridesFromDiff(prev, next);
        if (Object.keys(overridesPatch).length) {
          dispatch(updateAyahWidgetOverrides(overridesPatch));
        }
        return next;
      });
    },
    [dispatch],
  );

  // Remote data sources used by the builder
  const surahs = useAyahWidgetSurahs(preferences.locale);
  const translations = useAyahWidgetTranslations(preferences.locale);
  const reciters = useAyahWidgetReciters(undefined, DEFAULTS.reciterId);

  // UI state
  const [translationSearch, setTranslationSearch] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // CSV of selected translation IDs: "131,20,17"
  const translationIdsCsv = useMemo(
    () => toTranslationIdsCsv(preferences.translations),
    [preferences.translations],
  );

  // Live preview ref (the hook is responsible for rendering/re-rendering preview)
  const previewRef = useAyahWidgetPreview({ preferences, translationIds: translationIdsCsv });

  /**
   * When translations are loaded, initialize selection from the user's current settings.
   */
  useEffect(() => {
    if (!translations.length) return;

    const hasTranslationOverride = hasOverride(widgetOverrides, 'translationIds');
    const baseIds = selectedTranslationIdsFromRedux.filter(
      (id): id is number => typeof id === 'number',
    );
    const selectedIds = hasTranslationOverride ? widgetOverrides.translationIds ?? [] : baseIds;
    const selectedSet = new Set(selectedIds);
    let nextTranslations = selectedSet.size
      ? translations.filter((tr) => selectedSet.has(tr.id))
      : [];

    if (selectedSet.size && !nextTranslations.length) {
      const fallback = translations.find((tr) => tr.id === DEFAULTS.translationId);
      if (fallback) {
        nextTranslations = [fallback];
      }
    }

    setPreferences((prev) => {
      const prevIds = prev.translations
        .map((translation) => translation.id)
        .filter((id): id is number => typeof id === 'number');
      const nextIds = nextTranslations
        .map((translation) => translation.id)
        .filter((id): id is number => typeof id === 'number');

      if (areArraysEqual(prevIds, nextIds)) {
        return prev;
      }

      return { ...prev, translations: nextTranslations };
    });
  }, [translations, selectedTranslationIdsFromRedux, widgetOverrides]);

  /**
   * If the user changes Surah, ensure the selected Ayah remains valid.
   * This prevents invalid states like selecting ayah 286 in a short surah.
   */
  useEffect(() => {
    if (!surahs.length) return;

    setPreferences((prev) => {
      const selectedSurah = surahs.find((s) => Number(s.id) === prev.selectedSurah);
      if (!selectedSurah) return prev;

      const nextAyah = clampAyahNumber(prev.selectedAyah, selectedSurah.versesCount);
      if (nextAyah === prev.selectedAyah) return prev;

      return { ...prev, selectedAyah: nextAyah };
    });
  }, [surahs, preferences.selectedSurah]);

  /**
   * Translations grouped by language, filtered by user search.
   * Returned format: [ [languageName, translations[]], ... ]
   */
  const groupedTranslations = useMemo(() => {
    return groupTranslationsByLanguage(
      translations,
      translationSearch,
      t('translations.otherLanguage'),
    );
  }, [translations, translationSearch, t]);

  /**
   * Verse options (1..versesCount) for the currently selected surah.
   */
  const verseOptions = useMemo(() => {
    const selected = surahs.find((s) => Number(s.id) === preferences.selectedSurah);
    return makeVerseOptions(selected?.versesCount);
  }, [surahs, preferences.selectedSurah]);

  /**
   * The embed snippet that external websites can copy/paste.
   * We generate it from preferences and hide defaults where possible.
   */
  const embedSnippet = useMemo(() => {
    return buildEmbedSnippet(preferences, translationIdsCsv);
  }, [preferences, translationIdsCsv]);

  /**
   * Copy the embed snippet to clipboard and show a short success state.
   */
  const handleCopy = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error(t('errors.clipboardUnavailable'));
      }

      await navigator.clipboard.writeText(embedSnippet);

      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), DEFAULTS.copySuccessDurationMs);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(t('errors.clipboardFallback'), error);
    }
  }, [embedSnippet, t]);

  /**
   * Toggle a translation selection on/off.
   */
  const toggleTranslation = useCallback(
    (translation: AvailableTranslation) => {
      setUserPreferences((prev) => {
        const exists = prev.translations.some((selected) => selected.id === translation.id);

        return {
          ...prev,
          translations: exists
            ? prev.translations.filter((selected) => selected.id !== translation.id)
            : [...prev.translations, translation],
        };
      });
    },
    [setUserPreferences],
  );

  /**
   * Quick lookup for selected translation IDs
   */
  const selectedTranslationIds = useMemo(() => {
    return new Set(preferences.translations.map((tr) => tr.id));
  }, [preferences.translations]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
      </Head>

      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h1 className={styles.title}>{t('header.title')}</h1>
            <p className={styles.subtitle}>{t('header.subtitle')}</p>
          </header>

          <div className={styles.grid}>
            <BuilderConfigForm
              preferences={preferences}
              setPreferences={setPreferences}
              setUserPreferences={setUserPreferences}
              surahs={surahs}
              verseOptions={verseOptions}
              groupedTranslations={groupedTranslations}
              translationSearch={translationSearch}
              setTranslationSearch={setTranslationSearch}
              selectedTranslationIds={selectedTranslationIds}
              toggleTranslation={toggleTranslation}
              reciters={reciters}
            />

            <BuilderPreview
              previewRef={previewRef}
              embedSnippet={embedSnippet}
              isCopySuccess={copySuccess}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AyahWidgetBuilderPage;
