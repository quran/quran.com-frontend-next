/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import type { Preferences } from '@/components/AyahWidget/builder/types';
import BuilderConfigForm from '@/components/AyahWidget/BuilderConfigForm';
import BuilderPreview from '@/components/AyahWidget/BuilderPreview';
import { parseString, parseVersesParam } from '@/components/AyahWidget/queryParsing';
import {
  DEFAULTS,
  applyWidgetOverrides,
  buildEmbedSnippet,
  buildOverridesFromDiff,
  clampAyahNumber,
  getBasePreferences,
  getMushafFromQuranFont,
  groupTranslationsByLanguage,
  makeVerseOptions,
  toTranslationIdsCsv,
} from '@/components/AyahWidget/widget-config';
import useThemeDetector from '@/hooks/useThemeDetector';
import useAyahWidgetPreview from '@/hooks/widget/useAyahWidgetPreview';
import useAyahWidgetReciters from '@/hooks/widget/useAyahWidgetReciters';
import useAyahWidgetSurahs from '@/hooks/widget/useAyahWidgetSurahs';
import useAyahWidgetTranslations from '@/hooks/widget/useAyahWidgetTranslations';
import { logErrorToSentry } from '@/lib/sentry';
import { selectAyahWidgetOverrides, updateAyahWidgetOverrides } from '@/redux/slices/ayahWidget';
import { selectReadingPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranFont } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import ThemeType from '@/redux/types/ThemeType';
import styles from '@/styles/embed.module.scss';
import { WordByWordDisplay, WordByWordType } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import { logEvent } from '@/utils/eventLogger';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import type AvailableTranslation from 'types/AvailableTranslation';

/**
 * The React setState signature we pass down to the form to update preferences.
 */
type SetPreferences = Dispatch<SetStateAction<Preferences>>;

/**
 * AyahWidgetBuilderPage
 *
 * Responsibilities:
 * - Resolve base defaults from QDC (theme/locale/mushaf/wbw).
 * - Apply persisted widget overrides from Redux on top of those defaults.
 * - Keep local preferences state in sync when base defaults or overrides change.
 * - Persist user-driven changes back to Redux as a small "diff patch" of overrides.
 * - Fetch remote lists (surahs/translations/reciters) for the builder controls.
 * - Build the embed snippet and provide live preview + copy to clipboard.
 *
 * @returns {JSX.Element} The Ayah Widget Builder page.
 */
const AyahWidgetBuilderPage = () => {
  const router = useRouter();
  const { t, lang } = useTranslation('embed');

  const dispatch = useDispatch();

  // Theme can be Light/Dark/Auto. If Auto, we resolve it to the current variant.
  const { themeVariant, settingsTheme } = useThemeDetector();

  const widgetOverrides = useSelector(selectAyahWidgetOverrides);
  const selectedTranslationIdsFromRedux = useSelector(selectSelectedTranslations);
  const quranFont = useSelector(selectQuranFont);
  const readingPreferences = useSelector(selectReadingPreferences);

  /**
   * Resolved theme:
   * - If QDC is set to Auto => use the current themeVariant
   * - Else => use the explicit chosen theme
   */
  const resolvedTheme = useMemo(() => {
    return settingsTheme.type === ThemeType.Auto ? themeVariant : settingsTheme.type;
  }, [settingsTheme.type, themeVariant]);

  /**
   * Map QDC Quran font choice to widget mushaf option.
   */
  const mushafFromFont = useMemo(() => {
    return getMushafFromQuranFont(quranFont);
  }, [quranFont]);

  /**
   * Enable WBW translation by default if reading preferences include it.
   */
  const shouldEnableWbwTranslation = useMemo(() => {
    // Need to have both inline and translation to enable wbw translation by default
    const shouldDisplayInline = readingPreferences.wordByWordDisplay.includes(
      WordByWordDisplay.INLINE,
    );
    return (
      shouldDisplayInline &&
      readingPreferences.wordByWordContentType.includes(WordByWordType.Translation)
    );
  }, [readingPreferences.wordByWordContentType, readingPreferences.wordByWordDisplay]);

  /**
   * Enable WBW transliteration by default if reading preferences include it.
   */
  const shouldEnableWbwTransliteration = useMemo(() => {
    // Need to have both inline and transliteration to enable wbw transliteration by default
    const shouldDisplayInline = readingPreferences.wordByWordDisplay.includes(
      WordByWordDisplay.INLINE,
    );
    return (
      shouldDisplayInline &&
      readingPreferences.wordByWordContentType.includes(WordByWordType.Transliteration)
    );
  }, [readingPreferences.wordByWordContentType, readingPreferences.wordByWordDisplay]);

  /**
   * Base preferences = QDC-derived defaults (theme/locale/mushaf/wbw, etc.)
   * Note: this does NOT include persisted user overrides from the widget builder.
   */
  const basePreferences = useMemo(() => {
    return getBasePreferences({
      theme: resolvedTheme,
      locale: lang,
      mushaf: mushafFromFont,
      enableWbwTranslation: shouldEnableWbwTranslation,
      enableWbwTransliteration: shouldEnableWbwTransliteration,
    });
  }, [
    resolvedTheme,
    lang,
    mushafFromFont,
    shouldEnableWbwTranslation,
    shouldEnableWbwTransliteration,
  ]);

  /**
   * Local preferences state = base defaults + persisted Redux overrides.
   *
   * This local state is the single source of truth for:
   * - builder form controls
   * - preview rendering
   * - embed snippet
   */
  const [preferences, setPreferences] = useState<Preferences>(() => {
    return applyWidgetOverrides(basePreferences, widgetOverrides);
  });
  const previousPreferencesRef = useRef<Preferences>(preferences);
  const hasPendingUserPreferenceUpdateRef = useRef<boolean>(false);

  /**
   * Keep local preferences in sync when:
   * - base defaults change (theme/locale/mushaf/wbw from QDC)
   * - stored overrides change (Redux)
   *
   * Important:
   * - We preserve `translations` here because we resolve selected translation objects only
   *   after the translations list is loaded from the API.
   */
  useEffect(() => {
    setPreferences((prev) => ({
      ...applyWidgetOverrides(basePreferences, widgetOverrides),
      translations: prev.translations,
    }));
  }, [basePreferences, widgetOverrides]);

  /**
   * Update preferences in a "user-driven" way:
   * - update local state
   * - compute a minimal overrides patch based on diff
   * - persist that patch to Redux
   *
   * @param {SetStateAction<Preferences>} updater - React setState updater.
   * @returns {void}
   */
  const setUserPreferences = useCallback((updater: SetStateAction<Preferences>): void => {
    setPreferences((prev: Preferences) => {
      const next: Preferences = typeof updater === 'function' ? updater(prev) : updater;
      hasPendingUserPreferenceUpdateRef.current =
        hasPendingUserPreferenceUpdateRef.current || !Object.is(next, prev);
      return next;
    });
  }, []);

  /**
   * Persist user-driven changes to Redux after commit.
   * Keeping side effects out of the state updater avoids render-phase update warnings.
   */
  useEffect(() => {
    const prev = previousPreferencesRef.current;

    if (hasPendingUserPreferenceUpdateRef.current) {
      const overridesPatch = buildOverridesFromDiff(prev, preferences);
      if (Object.keys(overridesPatch).length) {
        dispatch(updateAyahWidgetOverrides(overridesPatch));
      }
      hasPendingUserPreferenceUpdateRef.current = false;
    }

    previousPreferencesRef.current = preferences;
  }, [dispatch, preferences]);

  const surahs = useAyahWidgetSurahs(lang);
  const translations = useAyahWidgetTranslations(preferences.locale);
  const reciters = useAyahWidgetReciters(undefined, DEFAULTS.reciterId);

  const [translationSearch, setTranslationSearch] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [lastParsedVersesParam, setLastParsedVersesParam] = useState<string | null>(null);

  /**
   * CSV of selected translation IDs: "131,20,17"
   */
  const translationIdsCsv = useMemo(() => {
    return toTranslationIdsCsv(preferences.translations);
  }, [preferences.translations]);

  /**
   * Live preview ref (the hook handles rendering/re-rendering into a DOM node).
   */
  const { previewRef, isLoading: isPreviewLoading } = useAyahWidgetPreview({
    preferences,
    translationIds: translationIdsCsv,
  });

  /**
   * When translations are loaded, initialize selection from QDC user's current settings
   * unless the widget overrides explicitly specify translationIds.
   *
   * Why:
   * - Redux user settings provide translation IDs.
   * - The widget builder needs the full translation objects, so we map IDs -> objects.
   *
   * Override precedence:
   * - If widgetOverrides.translationIds exists => use it.
   * - Else => use selectedTranslationIdsFromRedux.
   */
  useEffect(() => {
    if (!translations.length) return;

    const hasTranslationOverride: boolean = Object.prototype.hasOwnProperty.call(
      widgetOverrides,
      'translationIds',
    );

    const baseIds: number[] = selectedTranslationIdsFromRedux.filter(
      (id): id is number => typeof id === 'number',
    );

    const selectedIds: number[] = hasTranslationOverride
      ? widgetOverrides.translationIds ?? []
      : baseIds;

    const selectedSet = new Set<number>(selectedIds);

    let nextTranslations: AvailableTranslation[] = selectedSet.size
      ? translations.filter((tr) => selectedSet.has(tr.id))
      : [];

    // If IDs exist but didn't match the list (e.g. locale mismatch), fallback to default.
    if (selectedSet.size && !nextTranslations.length) {
      const fallback = translations.find((tr) => tr.id === DEFAULTS.translationId);
      if (fallback) nextTranslations = [fallback];
    }

    setPreferences((prev: Preferences) => {
      const prevIds: number[] = prev.translations
        .map((tr) => tr.id)
        .filter((id): id is number => typeof id === 'number');

      const nextIds: number[] = nextTranslations
        .map((tr) => tr.id)
        .filter((id): id is number => typeof id === 'number');

      if (areArraysEqual(prevIds, nextIds)) return prev;

      return { ...prev, translations: nextTranslations };
    });
  }, [translations, selectedTranslationIdsFromRedux, widgetOverrides]);

  /**
   * If the page is loaded with a "verses" query param (e.g. from /embed/1/3-5),
   * override the builder's selected surah/ayah and range settings.
   */
  useEffect(() => {
    if (!router.isReady) return;

    const versesParam = parseString(router.query.verses as string | string[] | undefined);
    if (!versesParam || versesParam === lastParsedVersesParam) return;

    try {
      const { ayah, rangeEnd } = parseVersesParam(versesParam);
      const [chapterIdRaw, verseNumberRaw] = getVerseAndChapterNumbersFromKey(ayah);
      const chapterId = Number(chapterIdRaw);
      const verseNumber = Number(verseNumberRaw);

      if (!Number.isFinite(chapterId) || !Number.isFinite(verseNumber)) {
        return;
      }

      const hasRange: boolean = Number.isFinite(rangeEnd);

      setUserPreferences((prev: Preferences) => ({
        ...prev,
        selectedSurah: chapterId,
        selectedAyah: verseNumber,
        rangeEnabled: hasRange,
        rangeEnd: rangeEnd ?? prev.rangeEnd,
      }));

      if (!hasRange) {
        dispatch(updateAyahWidgetOverrides({ rangeEnabled: false }));
      }

      setLastParsedVersesParam(versesParam);
    } catch (error) {
      logErrorToSentry(error as Error);
    }
  }, [dispatch, lastParsedVersesParam, router.isReady, router.query.verses, setUserPreferences]);

  /**
   * If the user changes Surah, ensure the selected Ayah remains valid.
   */
  useEffect(() => {
    if (!surahs.length) return;

    setPreferences((prev: Preferences) => {
      const selectedSurah = surahs.find((s) => Number(s.id) === prev.selectedSurah);
      if (!selectedSurah) return prev;

      const nextAyah: number = clampAyahNumber(prev.selectedAyah, selectedSurah.versesCount);
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
   * Verse options for the selected Surah.
   */
  const verseOptions = useMemo(() => {
    const selected = surahs.find((s) => Number(s.id) === preferences.selectedSurah);
    return makeVerseOptions(selected?.versesCount);
  }, [surahs, preferences.selectedSurah]);

  /**
   * Embed snippet to copy/paste (iframe).
   */
  const embedSnippet = useMemo(() => {
    return buildEmbedSnippet(preferences, translationIdsCsv);
  }, [preferences, translationIdsCsv]);

  /**
   * Quick lookup for selected translation IDs (for checkbox state).
   */
  const selectedTranslationIds = useMemo(() => {
    return new Set<number>(preferences.translations.map((tr) => tr.id));
  }, [preferences.translations]);

  /**
   * Copy the embed snippet to clipboard and show a short success state.
   *
   * @returns {Promise<void>}
   */
  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error(t('errors.clipboardUnavailable'));
      }

      await navigator.clipboard.writeText(embedSnippet);
      logEvent('embed_generated', {
        source: 'embed_builder',
        clientId: preferences.clientId,
        verses:
          preferences.rangeEnabled && preferences.rangeEnd > preferences.selectedAyah
            ? `${preferences.selectedSurah}:${preferences.selectedAyah}-${preferences.rangeEnd}`
            : `${preferences.selectedSurah}:${preferences.selectedAyah}`,
        translations: translationIdsCsv,
        reciter: preferences.reciter,
        locale: preferences.locale,
        theme: preferences.theme,
        mushaf: preferences.mushaf,
        enableAudio: preferences.enableAudio,
        enableWbw: preferences.enableWbwTranslation,
        enableWbwTransliteration: preferences.enableWbwTransliteration,
        showArabic: preferences.showArabic,
        showTranslationName: preferences.showTranslatorName,
        showTafsirs: preferences.showTafsirs,
        showReflections: preferences.showReflections,
        showLessons: preferences.showLessons,
        showAnswers: preferences.showAnswers,
        mergeVerses: preferences.mergeVerses,
      });

      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), DEFAULTS.copySuccessDurationMs);
    } catch (error) {
      logErrorToSentry(error as Error);
    }
  }, [embedSnippet, preferences, t, translationIdsCsv]);

  /**
   * Toggle a translation selection on/off.
   *
   * @param {AvailableTranslation} translation - The translation to toggle.
   * @returns {void}
   */
  const toggleTranslation = useCallback(
    (translation: AvailableTranslation): void => {
      setUserPreferences((prev: Preferences) => {
        const exists: boolean = prev.translations.some(
          (selected) => selected.id === translation.id,
        );

        const nextTranslations: AvailableTranslation[] = exists
          ? prev.translations.filter((selected) => selected.id !== translation.id)
          : [...prev.translations, translation];

        return { ...prev, translations: nextTranslations };
      });
    },
    [setUserPreferences],
  );

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
            <p className={styles.subtitle}>
              <Trans
                i18nKey="embed:header.subtitle"
                components={{
                  bold: <span className={styles.subtitleBold} />,
                  br: <br />,
                }}
              />
            </p>
          </header>

          <div className={styles.grid}>
            <BuilderConfigForm
              preferences={preferences}
              setUserPreferences={setUserPreferences as SetPreferences}
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
              isPreviewLoading={isPreviewLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AyahWidgetBuilderPage;
