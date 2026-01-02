/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, { useEffect } from 'react';

import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import {
  DEFAULT_RECITER,
  DEFAULT_VERSE,
  WidgetInputError,
  getAyahWidgetData,
} from '@/components/AyahWidget/getAyahWidgetData';
import QuranWidget from '@/components/AyahWidget/QuranWidget';
import ThemeType from '@/redux/types/ThemeType';
import type { MushafType, WidgetOptions } from '@/types/ayah-widget';
import { isMushafType } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type EmbedProps = {
  verses?: Verse[];
  options?: WidgetOptions;
  error?: string;
};

type VerseRangeParam = {
  ayah: string;
  rangeEnd?: number;
};

const WIDGET_ROOT_SELECTOR: string = '.quran-widget';

/**
 * Parse a query param as a single string.
 *
 * @param {string | string[] | undefined} value - The raw query value.
 * @returns {string | undefined} The first value (if array) or the string.
 */
const parseString = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

/**
 * Parse a query param as a boolean ("true" -> true, everything else -> false),
 * with a default when undefined.
 *
 * @param {string | string[] | undefined} value - The raw query value.
 * @param {boolean} defaultValue - Default returned when value is undefined.
 * @returns {boolean} Parsed boolean.
 */
const parseBool = (
  value: string | string[] | undefined,
  defaultValue: boolean = false,
): boolean => {
  if (Array.isArray(value)) return parseBool(value[0], defaultValue);
  if (value === undefined) return defaultValue;
  return value === 'true';
};

/**
 * Parse a query param as a number, returning undefined when invalid.
 *
 * @param {string | undefined} value - Raw string value.
 * @returns {number | undefined} Parsed number if finite, otherwise undefined.
 */
const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const num: number = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

/**
 * Parse verses range param.
 * Supported formats:
 * - "chapter:verse"  -> { ayah: "chapter:verse" }
 * - "chapter:from-to" -> { ayah: "chapter:from", rangeEnd: to }
 *
 * @param {string} value - The raw verses param.
 * @throws {WidgetInputError} When format is invalid.
 * @returns {VerseRangeParam} Parsed ayah + optional range end.
 */
const parseVersesParam = (value: string): VerseRangeParam => {
  const match: RegExpMatchArray | null = value.match(/^(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    throw new WidgetInputError(
      400,
      'Invalid verses format. Expected "chapter:verse" or "chapter:from-to".',
    );
  }

  const chapter: string = match[1];
  const from: string = match[2];
  const toRaw: string | undefined = match[3];

  const ayah: string = `${chapter}:${from}`;
  const rangeEnd: number | undefined = toRaw ? Number(toRaw) : undefined;

  if (rangeEnd !== undefined && (!Number.isFinite(rangeEnd) || rangeEnd <= Number(from))) {
    throw new WidgetInputError(400, 'Invalid range end. It must be a number greater than start.');
  }

  return { ayah, rangeEnd };
};

/**
 * Resolve mushaf type from query params.
 *
 * Back-compat:
 * - "font=v1|v2|indopak|tajweed|uthmani" maps to mushaf types
 * - "mushaf=..." (preferred) supports direct MushafType values
 *
 * @param {string | undefined} fontParam - Legacy font param.
 * @param {string | undefined} mushafParam - Mushaf type param.
 * @returns {MushafType} Resolved mushaf.
 */
const resolveMushaf = (fontParam?: string, mushafParam?: string): MushafType => {
  // Prefer explicit mushaf selection when provided.
  if (isMushafType(mushafParam)) return mushafParam;

  if (fontParam) {
    switch (fontParam) {
      case 'v1':
        return 'kfgqpc_v1';
      case 'v2':
        return 'kfgqpc_v2';
      case 'indopak':
        return 'indopak';
      case 'tajweed':
        return 'tajweed';
      case 'uthmani':
        return 'qpc';
      default:
        break;
    }
  }

  return 'qpc';
};

/**
 * Build quran.com URL for this widget configuration.
 *
 * @param {WidgetOptions} options - Widget options.
 * @returns {string} Canonical quran.com URL for the ayah or range.
 */
const buildVerseUrl = (options: WidgetOptions): string => {
  const [chapterId, verseId] = options.ayah.split(':');
  const verseLabel: string = options.rangeEnd ? `${verseId}-${options.rangeEnd}` : verseId;

  // Keep current behavior: only add locale prefix when not English.
  const localePrefix: string = options.locale === 'en' ? '' : `/${options.locale}`;

  // NOTE: existing route format in the original code used ":" in the path.
  // If quran.com expects "/chapter/verse" you can swap to that later.
  return `https://quran.com${localePrefix}/${chapterId}:${verseLabel}`;
};

/**
 * Build the text that should be copied when clicking "Copy".
 *
 * This extracts:
 * - header (surah name + range caption if available)
 * - Arabic text (when enabled)
 * - Translation text (and translator name when enabled)
 * - URL
 *
 * @param {HTMLElement} root - Widget root element.
 * @param {WidgetOptions} options - Widget options.
 * @returns {string} Copy-ready multi-line text.
 */
const buildCopyText = (root: HTMLElement, options: WidgetOptions): string => {
  const [chapterId, verseId] = options.ayah.split(':');
  const verseLabel: string = options.rangeEnd ? `${verseId}-${options.rangeEnd}` : verseId;
  const rangeCaption: string = `${chapterId}:${verseLabel}`;
  const header: string = options.surahName
    ? `${options.surahName} (${rangeCaption})`
    : rangeCaption;

  const verseBlocks: HTMLElement[] = Array.from(
    root.querySelectorAll('[data-verse-block]'),
  ) as HTMLElement[];

  const blocks: string[] = [];

  verseBlocks.forEach((block: HTMLElement) => {
    const lines: string[] = [];

    // Arabic line (optional)
    const arabicNode: HTMLElement | null = block.querySelector('[data-verse-text]');
    const arabicText: string | undefined = arabicNode?.dataset?.arabicVerse?.trim();
    if (options.showArabic && arabicText) lines.push(arabicText);

    // Translations
    const translationNodes: Element[] = Array.from(
      block.querySelectorAll('[data-translation-text]'),
    );
    translationNodes.forEach((node: Element) => {
      const text: string = (node.textContent || '').trim();
      if (!text) return;

      lines.push(text);

      if (options.showTranslatorNames) {
        const name: string | null = node.getAttribute('data-translator-name');
        if (name) lines.push(`- ${name}`);
      }
    });

    if (lines.length) blocks.push(lines.join('\n'));
  });

  // Fallback: if no verse blocks exist, copy translation-only nodes
  if (!blocks.length) {
    const translationNodes: Element[] = Array.from(
      root.querySelectorAll('[data-translation-text]'),
    );
    translationNodes.forEach((node: Element) => {
      const text: string = (node.textContent || '').trim();
      if (!text) return;

      const lines: string[] = [text];

      if (options.showTranslatorNames) {
        const name: string | null = node.getAttribute('data-translator-name');
        if (name) lines.push(`- ${name}`);
      }

      blocks.push(lines.join('\n'));
    });
  }

  const verseUrl: string = buildVerseUrl(options);

  return [header, ...blocks, verseUrl].filter(Boolean).join('\n\n');
};

/**
 * Hook: wire widget interactions on the client.
 *
 * Current behaviors:
 * - Copy: copies a formatted text block (arabic + translations + url depending on options).
 * - Share: copies the quran.com URL.
 * - Audio: toggle play/pause and clamp playback by start/end times from data attrs.
 *
 * Notes:
 * - This is intentionally lightweight: clipboard/playback errors are ignored.
 * - The widget root is queried by `.quran-widget`. If you later render multiple widgets
 *   per page, pass an explicit root element/ref instead.
 *
 * @param {WidgetOptions | undefined} options - Widget options once loaded.
 * @returns {void} No return value.
 */
const useWidgetInteractions = (options?: WidgetOptions): void => {
  useEffect(() => {
    if (!options) return undefined;

    const widgetRoot: HTMLElement | null = document.querySelector(WIDGET_ROOT_SELECTOR);
    if (!widgetRoot) return undefined;

    const copyButton: HTMLButtonElement | null = widgetRoot.querySelector('[data-copy-verse]');
    const shareButton: HTMLButtonElement | null = widgetRoot.querySelector('[data-share-verse]');
    const audioButton: HTMLButtonElement | null = widgetRoot.querySelector('[data-audio-button]');
    const audioElement: HTMLAudioElement | null = widgetRoot.querySelector('[data-audio-element]');

    const writeClipboard = async (text: string): Promise<void> => {
      // navigator.clipboard might be blocked in some contexts (http, permissions, etc.)
      if (!navigator.clipboard?.writeText) return;
      await navigator.clipboard.writeText(text);
    };

    const handleCopy = async (): Promise<void> => {
      try {
        const text: string = buildCopyText(widgetRoot, options);
        await writeClipboard(text);
      } catch (error) {
        // ignore
      }
    };

    const handleShare = async (): Promise<void> => {
      try {
        await writeClipboard(buildVerseUrl(options));
      } catch (error) {
        // ignore
      }
    };

    copyButton?.addEventListener('click', handleCopy);
    shareButton?.addEventListener('click', handleShare);

    let cleanupAudio: (() => void) | null = null;

    // Audio wiring
    if (audioButton && audioElement) {
      const playIcon: HTMLElement | null = audioButton.querySelector('[data-play-icon]');
      const pauseIcon: HTMLElement | null = audioButton.querySelector('[data-pause-icon]');

      const audioStart: number = Number(audioElement.dataset.audioStart || 0);
      const audioEnd: number = Number(audioElement.dataset.audioEnd || 0);

      const setPlayingUi = (isPlaying: boolean): void => {
        if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'inline-flex';
        if (pauseIcon) pauseIcon.style.display = isPlaying ? 'inline-flex' : 'none';
      };

      const resetToStart = (): void => {
        audioElement.currentTime = audioStart || 0;
      };

      const handleToggle = async (): Promise<void> => {
        if (audioElement.paused) {
          // Ensure we start at the correct segment start
          if (audioStart) resetToStart();
          try {
            await audioElement.play();
          } catch (error) {
            // ignore (autoplay restrictions etc.)
          }
        } else {
          audioElement.pause();
        }
      };

      const handleTimeUpdate = (): void => {
        if (!audioEnd) return;
        if (audioElement.currentTime >= audioEnd) {
          audioElement.pause();
          resetToStart();
        }
      };

      const handlePlay = (): void => setPlayingUi(true);
      const handlePause = (): void => setPlayingUi(false);

      audioButton.addEventListener('click', handleToggle);
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handlePause);

      setPlayingUi(!audioElement.paused);

      cleanupAudio = (): void => {
        audioButton.removeEventListener('click', handleToggle);
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handlePause);
      };
    }

    return () => {
      copyButton?.removeEventListener('click', handleCopy);
      shareButton?.removeEventListener('click', handleShare);
      cleanupAudio?.();
    };
  }, [options]);
};

/**
 * EmbedPage
 *
 * A lightweight SSR embed page intended to be rendered inside an iframe or served as HTML.
 * It fetches widget data server-side and hydrates a minimal interactive layer client-side.
 *
 * @param {EmbedProps} props - SSR props.
 * @returns {JSX.Element} Embed page markup.
 */
const EmbedPage = ({ verses, options, error }: EmbedProps): JSX.Element => {
  const { t } = useTranslation('common');

  // Only wire interactions if we have a successful widget render.
  useWidgetInteractions(options);

  if (!verses?.length || !options) {
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>{error || t('error.general')}</div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('quran-com')}</title>
      </Head>

      {/* Keep the embed transparent and remove default margins */}
      <style>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          overflow-x: hidden;
          overflow-y: auto;
        }
      `}</style>

      <QuranWidget verses={verses} options={options} />
    </>
  );
};

/**
 * getServerSideProps
 *
 * Parses query params and fetches ayah widget data server-side.
 * Supports both legacy params and the current embed builder params.
 *
 * @param {GetServerSidePropsContext} context - Next.js SSR context.
 * @returns {Promise<GetServerSidePropsResult<EmbedProps>>} SSR props result.
 */
export const getServerSideProps: GetServerSideProps<EmbedProps> = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EmbedProps>> => {
  const { query, res } = context;

  try {
    // Legacy: "verses=33:56-57"
    const versesParam: string | undefined = parseString(query.verses);
    // Current: "ayah=33:56"
    const ayahParam: string | undefined = parseString(query.ayah);

    let ayah: string = ayahParam || DEFAULT_VERSE;
    let rangeEnd: number | undefined;

    if (versesParam) {
      const { ayah: parsedAyah, rangeEnd: parsedRangeEnd } = parseVersesParam(versesParam);
      ayah = parsedAyah;
      rangeEnd = parsedRangeEnd;
    } else {
      // Alternative range param: "rangeEnd=57"
      rangeEnd = parseNumber(parseString(query.rangeEnd));
    }

    // Translations: "131,20,17"
    const translationIdsQuery: string = parseString(query.translations) ?? '';
    const translationIds: number[] = translationIdsQuery
      .split(',')
      .map((id: string) => Number(id.trim()))
      .filter((id: number) => Number.isFinite(id));

    // Keep unique ids (avoid duplicates)
    const uniqueTranslationIds: number[] = Array.from(new Set<number>(translationIds));

    // Reciter/audio/wbw
    const reciter: string = parseString(query.reciter) || DEFAULT_RECITER;
    const enableAudio: boolean = parseBool(query.audio, true);
    const enableWbw: boolean = parseBool(query.wbw);

    // Theme
    const themeParam: string | undefined = parseString(query.theme);
    const theme: WidgetOptions['theme'] =
      themeParam === ThemeType.Dark || themeParam === ThemeType.Sepia
        ? themeParam
        : ThemeType.Light;

    // Mushaf font (legacy "font") + current "mushaf"
    const fontParam: string | undefined = parseString(query.font);
    const mushafParam: string | undefined = parseString(query.mushaf);
    const mushaf: MushafType = resolveMushaf(fontParam, mushafParam);

    // Display toggles (support legacy keys too)
    const showTranslatorNames: boolean = parseBool(
      (query.showTranslationName ?? query.showTranslatorNames) as any,
      false,
    );
    const showArabic: boolean = parseBool(query.showArabic as any, true);
    const showTafsirs: boolean = parseBool((query.tafsir ?? query.showTafsirs) as any, true);
    const showReflections: boolean = parseBool(
      (query.reflections ?? query.showReflections) as any,
      true,
    );
    const showAnswers: boolean = parseBool((query.answers ?? query.showAnswers) as any, true);

    // Locale + sizing
    const locale: string | undefined = parseString(query.locale);
    const customWidth: string | undefined = parseString(query.width) || undefined;
    const customHeight: string | undefined = parseString(query.height) || undefined;

    const data = await getAyahWidgetData({
      ayah,
      translationIds: uniqueTranslationIds,
      reciter,
      enableAudio,
      enableWbw,
      theme,
      mushaf,
      showTranslatorNames,
      showArabic,
      showTafsirs,
      showReflections,
      showAnswers,
      locale: locale || undefined,
      rangeEnd,
      customWidth,
      customHeight,
    });

    const { verses } = data;
    const { options } = data;

    // Ensure props are JSON-serializable for Next.js (strip undefined values).
    const serializable: { verses: Verse[]; options: WidgetOptions } = JSON.parse(
      JSON.stringify({ verses, options }),
    ) as { verses: Verse[]; options: WidgetOptions };

    return {
      props: {
        verses: serializable.verses,
        options: serializable.options,
      },
    };
  } catch (error) {
    if (error instanceof WidgetInputError) {
      if (res) res.statusCode = error.status;
      return { props: { error: error.message } };
    }

    if (res) res.statusCode = 500;
    return { props: {} };
  }
};

export default EmbedPage;
