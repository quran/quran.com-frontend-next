/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useState } from 'react';

import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import type { Preferences } from '@/components/AyahWidget/builder/types';
import BuilderConfigForm from '@/components/AyahWidget/BuilderConfigForm';
import BuilderPreview from '@/components/AyahWidget/BuilderPreview';
import useAyahWidgetPreview from '@/hooks/widget/useAyahWidgetPreview';
import useAyahWidgetReciters from '@/hooks/widget/useAyahWidgetReciters';
import useAyahWidgetSurahs from '@/hooks/widget/useAyahWidgetSurahs';
import useAyahWidgetTranslations from '@/hooks/widget/useAyahWidgetTranslations';
import ThemeType from '@/redux/types/ThemeType';
import styles from '@/styles/ayah-widget.module.scss';
import type AvailableTranslation from 'types/AvailableTranslation';

// All default values for the Ayah Widget Builder
const DEFAULT_CONTAINER_ID = 'quran-embed-1';
const DEFAULT_SURAH = 33; // Surah Al-Ahzab
const DEFAULT_AYAH = 56; // Ayah 56
const DEFAULT_RECITER = 7; // Default Reciter: Mishary Rashid Alafasy (ID 7)
const DEFAULT_TRANSLATION = 131; // Mustafa Khattab
const COPY_SUCCESS_DURATION_MS = 2000; // The duration to show copy success state
const DEFAULT_SNIPPET_SCRIPT =
  process.env.NEXT_PUBLIC_AYAH_WIDGET_SCRIPT_URL || 'https://quran.com/embed/quran-embed.js';
const SNIPPET_WIDGET_ORIGIN = process.env.NEXT_PUBLIC_AYAH_WIDGET_ORIGIN || '';

// The builder's default settings
const INITIAL_PREFERENCES: Preferences = {
  containerId: DEFAULT_CONTAINER_ID,
  selectedSurah: DEFAULT_SURAH,
  selectedAyah: DEFAULT_AYAH,
  translations: [],
  theme: ThemeType.Light,
  mushaf: 'qpc',
  enableAudio: true,
  enableWbwTranslation: false,
  showTranslatorName: false,
  showQuranLink: true,
  reciter: DEFAULT_RECITER,
  customSize: {
    width: '100%',
    height: '',
  },
};

// The Ayah Widget Builder Page
const AyahWidgetBuilderPage = () => {
  const { t } = useTranslation('ayah-widget');
  const [preferences, setPreferences] = useState<Preferences>(INITIAL_PREFERENCES);
  const surahs = useAyahWidgetSurahs();
  const translations = useAyahWidgetTranslations();
  const reciters = useAyahWidgetReciters(undefined, DEFAULT_RECITER);
  const [translationSearch, setTranslationSearch] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Memoized comma-separated translation IDs for the selected translations
  const translationIds = useMemo(
    () =>
      preferences.translations
        .map((translation) => translation.id)
        .filter((id): id is number => typeof id === 'number')
        .join(','),
    [preferences.translations],
  );

  const previewRef = useAyahWidgetPreview({ preferences, translationIds });

  /**
   * Set default translation (Mustafa Khattab) when translations are loaded.
   */
  useEffect(() => {
    if (!translations.length) {
      return;
    }
    setPreferences((prev) => {
      if (prev.translations.length) {
        return prev;
      }
      const defaultTranslation = translations.find(
        (translation) => translation.id === DEFAULT_TRANSLATION,
      );
      if (!defaultTranslation) {
        return prev;
      }
      return {
        ...prev,
        translations: [defaultTranslation],
      };
    });
  }, [translations]);

  /**
   * Ensure selected Ayah is valid when selected Surah changes.
   */
  useEffect(() => {
    if (!surahs.length) {
      return;
    }
    setPreferences((prev) => {
      // Find the selected Surah
      const selected = surahs.find((surah) => Number(surah.id) === prev.selectedSurah);
      if (!selected) {
        return prev;
      }
      // Adjust the selected Ayah if out of bounds
      if (prev.selectedAyah > selected.versesCount) {
        return {
          ...prev,
          selectedAyah: selected.versesCount,
        };
      }
      if (prev.selectedAyah < 1) {
        return {
          ...prev,
          selectedAyah: 1,
        };
      }
      return prev;
    });
  }, [preferences.selectedSurah, surahs]);

  /**
   * Group translations by language and filter based on search query.
   */
  const groupedTranslations = useMemo(() => {
    if (!translations.length) {
      return [];
    }
    const lowerQuery = translationSearch.trim().toLowerCase();
    const filtered = translations.filter((translation) => {
      if (!lowerQuery) {
        return true;
      }
      // Search in name, authorName, and languageName
      return (
        translation.name?.toLowerCase().includes(lowerQuery) ||
        translation.authorName?.toLowerCase().includes(lowerQuery) ||
        translation.languageName?.toLowerCase().includes(lowerQuery)
      );
    });

    // Group translations by language name
    const grouped: Record<string, AvailableTranslation[]> = {};
    filtered.forEach((translation) => {
      const key = translation.languageName || t('translations.otherLanguage');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(translation);
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [translations, translationSearch, t]);

  /**
   * Generate verse options based on the selected Surah.
   * Ex: If Surah Al-Baqarah is selected, generate [1, 2, 3, ..., 286]
   */
  const verseOptions = useMemo(() => {
    const selected = surahs.find((surah) => Number(surah.id) === preferences.selectedSurah);
    if (!selected) {
      return [];
    }
    return Array.from({ length: selected.versesCount }, (unused, index) => index + 1);
  }, [preferences.selectedSurah, surahs]);

  /**
   * Generate the embed snippet based on current preferences.
   */
  const embedSnippet = useMemo(() => {
    const widthValue = preferences.customSize.width?.trim() || '100%';
    const heightValue = preferences.customSize.height?.trim();
    const containerStyles: string[] = [`width: ${widthValue}`];
    if (heightValue) {
      containerStyles.push(`height: ${heightValue}`);
    }

    const attributes = [
      `src="${DEFAULT_SNIPPET_SCRIPT}"`,
      `data-quran-target="${preferences.containerId}"`,
      `data-quran-ayah="${preferences.selectedSurah}:${preferences.selectedAyah}"`,
      `data-quran-translation-ids="${translationIds}"`,
      `data-quran-reciter-id="${preferences.reciter ?? ''}"`,
      `data-quran-audio="${preferences.enableAudio}"`,
      `data-quran-word-by-word="${preferences.enableWbwTranslation}"`,
      `data-quran-theme="${preferences.theme}"`,
      `data-quran-mushaf="${preferences.mushaf}"`,
      `data-quran-show-translator-names="${preferences.showTranslatorName}"`,
      `data-quran-show-quran-link="${preferences.showQuranLink}"`,
    ];

    // Add origin attribute if set
    // (for testing purposes mainly)
    if (SNIPPET_WIDGET_ORIGIN) {
      attributes.splice(1, 0, `data-quran-origin="${SNIPPET_WIDGET_ORIGIN}"`);
    }

    attributes.push(`data-width="${widthValue}"`);
    if (heightValue) {
      attributes.push(`data-height="${heightValue}"`);
    }

    const containerStyleAttr = containerStyles.length
      ? ` style="${containerStyles.join('; ')}"`
      : '';

    // Return the complete embed snippet
    return `<div id="${preferences.containerId}"${containerStyleAttr}></div>

<script
  ${attributes.join('\n  ')}
  async>
</script>`;
  }, [
    preferences.containerId,
    preferences.customSize.height,
    preferences.customSize.width,
    preferences.enableAudio,
    preferences.enableWbwTranslation,
    preferences.reciter,
    preferences.selectedAyah,
    preferences.selectedSurah,
    preferences.showQuranLink,
    preferences.showTranslatorName,
    preferences.theme,
    preferences.mushaf,
    translationIds,
  ]);

  /**
   * Handle copying the embed snippet to clipboard.
   */
  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(embedSnippet);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), COPY_SUCCESS_DURATION_MS);
      } else {
        throw new Error(t('errors.clipboardUnavailable'));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(t('errors.clipboardFallback'), error);
    }
  }, [embedSnippet, t]);

  /**
   * Handle toggling a translation on or off.
   * @param {AvailableTranslation} translation The translation to toggle
   */
  const toggleTranslation = (translation: AvailableTranslation) => {
    setPreferences((prev) => {
      // Check if the translation is already selected
      const exists = prev.translations.some((selected) => selected.id === translation.id);
      const nextTranslations = exists
        ? prev.translations.filter((selected) => selected.id !== translation.id)
        : [...prev.translations, translation];
      return {
        ...prev,
        translations: nextTranslations,
      };
    });
  };

  /**
   * Set of selected translation IDs for quick lookup.
   */
  const selectedTranslationIds = useMemo(
    () => new Set(preferences.translations.map((translation) => translation.id)),
    [preferences.translations],
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
            <p className={styles.subtitle}>{t('header.subtitle')}</p>
          </header>

          <div className={styles.grid}>
            <BuilderConfigForm
              preferences={preferences}
              setPreferences={setPreferences}
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
