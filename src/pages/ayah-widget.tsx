/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import { getAvailableReciters, getAvailableTranslations } from '@/api';
import type { Preferences } from '@/components/AyahWidget/builder/types';
import BuilderConfigForm from '@/components/AyahWidget/BuilderConfigForm';
import BuilderPreview from '@/components/AyahWidget/BuilderPreview';
import ThemeType from '@/redux/types/ThemeType';
import styles from '@/styles/ayah-widget.module.scss';
import Chapter from '@/types/Chapter';
import { getAllChaptersData } from '@/utils/chapter';
import type AvailableTranslation from 'types/AvailableTranslation';
import type Reciter from 'types/Reciter';

// All default values for the Ayah Widget Builder
const DEFAULT_CONTAINER_ID = 'quran-embed-1';
const DEFAULT_SURAH = 33;
const DEFAULT_AYAH = 56;
const DEFAULT_RECITER = 7;
const DEFAULT_SNIPPET_SCRIPT =
  process.env.NEXT_PUBLIC_AYAH_WIDGET_SCRIPT_URL || 'https://quran.com/embed/quran-embed.js';
const PREVIEW_SCRIPT_SRC = '/embed/quran-embed.js';
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
  hasCustomSize: false,
  customSize: {
    width: '100%',
    height: '400px',
  },
};

// The Ayah Widget Builder Page
const AyahWidgetBuilderPage = () => {
  const { t } = useTranslation('ayah-widget');
  const [preferences, setPreferences] = useState<Preferences>(INITIAL_PREFERENCES);
  const [surahs, setSurahs] = useState<Chapter[]>([]);
  const [translations, setTranslations] = useState<AvailableTranslation[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [translationSearch, setTranslationSearch] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewOrigin, setPreviewOrigin] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  /**
   * Set the preview origin from the window location.
   * Required for cross-origin preview iframe communication in the widget builder.
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPreviewOrigin(window.location.origin);
    }
  }, [t]);

  // Memoized comma-separated translation IDs for the selected translations
  const translationIds = useMemo(
    () =>
      preferences.translations
        .map((translation) => translation.id)
        .filter((id): id is number => typeof id === 'number')
        .join(','),
    [preferences.translations],
  );

  /**
   * Load the list of Surahs on component mount.
   */
  useEffect(() => {
    let cancelled = false;
    const loadSurahs = async () => {
      try {
        const chaptersData = await getAllChaptersData('en');
        if (!cancelled) {
          const mapped = Object.entries(chaptersData)
            .map(([chapterId, chapter]) => ({
              ...chapter,
              id: Number(chapterId),
            }))
            .filter((chapter) => Number.isFinite(Number(chapter.id)))
            .sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0)) as Chapter[];
          setSurahs(mapped);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(t('errors.loadChapters'), error);
      }
    };

    loadSurahs();
    return () => {
      cancelled = true;
    };
  }, [t]);

  /**
   * Load the list of available translations on component mount.
   */
  useEffect(() => {
    let cancelled = false;
    const loadTranslations = async () => {
      try {
        const response = await getAvailableTranslations('en');
        if (!cancelled) {
          const list =
            response.translations?.filter(
              (translation): translation is AvailableTranslation =>
                Boolean(translation?.id) && Boolean(translation?.name),
            ) ?? [];
          setTranslations(list);
        }
      } catch (error) {
        console.error(t('errors.loadTranslations'), error);
      }
    };
    loadTranslations();
    return () => {
      cancelled = true;
    };
  }, [t]);

  /**
   * Load the list of available reciters on component mount.
   */
  useEffect(() => {
    let cancelled = false;
    const loadReciters = async () => {
      try {
        const response = await getAvailableReciters('en');
        if (!cancelled) {
          setReciters(response.reciters ?? []);
        }
      } catch (error) {
        console.error(t('errors.loadReciters'), error);
        if (!cancelled) {
          setReciters([
            {
              id: DEFAULT_RECITER,
              reciterId: DEFAULT_RECITER,
              name: t('reciters.fallback'),
              recitationStyle: '',
              relativePath: '',
            } as Reciter,
          ]);
        }
      }
    };
    loadReciters();
    return () => {
      cancelled = true;
    };
  }, [t]);

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
      const defaultTranslation = translations.find((translation) => translation.id === 131);
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
   * Update the preview iframe whenever preferences change.
   */
  useEffect(() => {
    // Clear previous preview
    if (typeof window === 'undefined' || !previewRef.current) {
      return undefined;
    }

    // Create the container div
    const container = previewRef.current;
    container.innerHTML = `<div id="${preferences.containerId}"></div>`;

    // Set container size styles
    const target = container.querySelector<HTMLDivElement>(`#${preferences.containerId}`);
    if (target) {
      target.style.width = preferences.hasCustomSize ? preferences.customSize.width : '100%';
      if (preferences.hasCustomSize) {
        target.style.height = preferences.customSize.height;
      }
      target.style.maxWidth = '100%';
      target.style.display = 'block';
    }

    // Create and append the script element
    const script = document.createElement('script');
    script.src = PREVIEW_SCRIPT_SRC;
    script.async = true;
    if (previewOrigin) {
      script.setAttribute('data-quran-origin', previewOrigin);
    }
    script.setAttribute('data-quran-target', preferences.containerId);
    script.setAttribute(
      'data-quran-ayah',
      `${preferences.selectedSurah}:${preferences.selectedAyah}`,
    );
    script.setAttribute('data-quran-translation-ids', translationIds);
    script.setAttribute(
      'data-quran-reciter-id',
      preferences.reciter ? String(preferences.reciter) : '',
    );
    script.setAttribute('data-quran-audio', String(preferences.enableAudio));
    script.setAttribute('data-quran-word-by-word', String(preferences.enableWbwTranslation));
    script.setAttribute('data-quran-theme', preferences.theme);
    script.setAttribute('data-quran-show-translator-names', String(preferences.showTranslatorName));
    script.setAttribute('data-quran-show-quran-link', String(preferences.showQuranLink));
    script.setAttribute('data-quran-mushaf', preferences.mushaf);
    if (preferences.hasCustomSize) {
      script.setAttribute('data-width', preferences.customSize.width);
      script.setAttribute('data-height', preferences.customSize.height);
    }

    // Append the script to the document body
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [
    previewOrigin,
    preferences.containerId,
    preferences.customSize.height,
    preferences.customSize.width,
    preferences.enableAudio,
    preferences.enableWbwTranslation,
    preferences.hasCustomSize,
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
   * Generate the embed snippet based on current preferences.
   */
  const embedSnippet = useMemo(() => {
    const containerStyles: string[] = ['width: 100%'];
    if (preferences.hasCustomSize) {
      containerStyles[0] = `width: ${preferences.customSize.width}`;
      containerStyles.push(`height: ${preferences.customSize.height}`);
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

    // Add custom size attributes if enabled
    if (preferences.hasCustomSize) {
      attributes.push(`data-width="${preferences.customSize.width}"`);
      attributes.push(`data-height="${preferences.customSize.height}"`);
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
    preferences.hasCustomSize,
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
        setTimeout(() => setCopySuccess(false), 2000);
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
