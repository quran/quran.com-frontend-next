/* eslint-disable max-lines */
import React from 'react';

import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToStaticMarkup } from 'react-dom/server';

import { fetcher, getChapterAudioData } from '@/api';
import { getQuranFontForMushaf } from '@/components/AyahWidget/mushaf-fonts';
import QuranWidget from '@/components/AyahWidget/QuranWidget';
import { logDebug } from '@/lib/newrelic';
import ThemeType from '@/redux/types/ThemeType';
import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { WidgetOptions, MushafType } from '@/types/ayah-widget';
import { isMushafType } from '@/types/ayah-widget';
import { getMushafId, getDefaultWordFields } from '@/utils/api';
import {
  DEFAULT_VERSES_PARAMS,
  makeByVerseKeyUrl,
  makeChapterUrl,
  makeTranslationsInfoUrl,
} from '@/utils/apiPaths';
import type { ChapterResponse, TranslationsResponse, VerseResponse } from 'types/ApiResponses';
import type AvailableTranslation from 'types/AvailableTranslation';
import type Translation from 'types/Translation';
import type Verse from 'types/Verse';

// Default values
const DEFAULT_VERSE = '33:56';
const DEFAULT_RECITER = '7'; // Mishary Alafasy
const INCORRECT_SUKUN_REGEX = /[\u06DF\u06E1\u06E2\u06E3\u06E4]/g; // Needed because of a font issue
const FOOTNOTE_REGEX = /<sup[^>]*>.*?<\/sup>/g; // Needed to remove footnotes from translation text

/**
 * The response type for the Ayah Widget API.
 */
type WidgetResponse =
  | {
      success: true;
      html: string;
    }
  | {
      success: false;
      error: string;
      html: string;
    };

/**
 * Normalize the text by replacing incorrect sukun characters.
 * @param {string | null | undefined} value The arabic text to normalize.
 * @returns {string} The normalized text.
 */
const normalizeText = (value?: string | null) =>
  value ? value.replace(INCORRECT_SUKUN_REGEX, '\u0652') : '';

/**
 * Sanitize the verse by normalizing the text and removing footnotes.
 * Replaces incorrect sukun characters in the Quranic text and strips HTML footnote tags from translations.
 * @param {Verse} verse The verse to sanitize.
 * @returns {Verse} The sanitized verse.
 */
const sanitizeVerse = (verse: Verse): Verse => ({
  ...verse,
  textUthmani: normalizeText(verse.textUthmani),
  words:
    verse.words?.map((word) => ({
      ...word,
      textUthmani: normalizeText(word.textUthmani),
    })) ?? [],
  translations: verse.translations?.map((translation) => ({
    ...translation,
    text: translation.text?.replace(FOOTNOTE_REGEX, '') ?? '',
  })),
});

/**
 * Parse a boolean value from a string or array of strings.
 * @param {string | string[] | undefined} value The value to parse.
 * @param {boolean} defaultValue The default value to return if parsing fails.
 * @returns {boolean} The parsed boolean value.
 */
const parseBool = (value: string | string[] | undefined, defaultValue = false): boolean => {
  if (Array.isArray(value)) return parseBool(value[0], defaultValue);
  if (value === undefined) return defaultValue;
  return value === 'true';
};

/**
 * Parse a string value from a string or array of strings.
 * @param {string | string[] | undefined} value The value to parse.
 * @returns {string | undefined} The parsed string value.
 */
const parseString = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

/**
 * Build the widget options for the Ayah Widget.
 * @returns {WidgetOptions} The widget options.
 */
const buildWidgetOptions = (
  ayah: string,
  params: {
    enableAudio: boolean;
    enableWbw: boolean;
    rangeEnd?: number;
    theme: ThemeTypeVariant;
    mushaf: MushafType;
    showTranslatorNames: boolean;
    showQuranLink: boolean;
    showTafsirs: boolean;
    showReflections: boolean;
    showAnswers: boolean;
    customWidth?: string;
    customHeight?: string;
    showArabic: boolean;
  },
  meta?: {
    hasAnyTranslations: boolean;
    surahName?: string;
    audioUrl?: string;
    audioStart?: number;
    audioEnd?: number;
  },
): WidgetOptions => ({
  enableAudio: params.enableAudio,
  enableWbw: params.enableWbw,
  theme: params.theme,
  mushaf: params.mushaf,
  showTranslatorNames: params.showTranslatorNames,
  showQuranLink: params.showQuranLink,
  showArabic: params.showArabic,
  showTafsirs: params.showTafsirs,
  showReflections: params.showReflections,
  showAnswers: params.showAnswers,
  rangeEnd: params.rangeEnd,
  ayah,
  hasAnyTranslations: meta?.hasAnyTranslations ?? false,
  surahName: meta?.surahName,
  customWidth: params.customWidth,
  customHeight: params.customHeight,
  audioUrl: meta?.audioUrl,
  audioStart: meta?.audioStart,
  audioEnd: meta?.audioEnd,
});

/**
 * Enrich the translation objects with additional metadata.
 * Fills in missing translation names and author names by looking them up in the provided metadata map.
 * @param {Translation[]} translations The translations to enrich.
 * @param {Map<number, AvailableTranslation>} metaById A map of metadata by resource ID.
 * @returns {Translation[]} The enriched translations.
 */
const enrichTranslations = (
  translations: Translation[] | undefined,
  metaById: Map<number, AvailableTranslation>,
): Translation[] | undefined => {
  if (!translations?.length) return translations;
  return translations.map((translation) => {
    const meta = translation.resourceId ? metaById.get(translation.resourceId) : undefined;
    if (!meta) return translation;
    return {
      ...translation,
      resourceName: translation.resourceName || meta.name || translation.resourceName,
      authorName: translation.authorName || meta.authorName || translation.authorName,
    };
  });
};

/**
 * Build the parameters for the verse API request.
 * @param {number[]} translationIds The IDs of the translations to include.
 * @param {string} reciter The ID of the reciter to use.
 * @param {MushafType} mushaf The type of Mushaf to use.
 * @returns {Record<string, unknown>} The built parameters.
 */
const buildVerseParams = (
  translationIds: number[],
  reciter: string,
  mushaf: MushafType,
  range?: { from: number; to: number; perPage: number },
) => {
  const quranFont = getQuranFontForMushaf(mushaf);
  const mushafId = getMushafId(quranFont).mushaf;

  const params: Record<string, unknown> = {
    ...DEFAULT_VERSES_PARAMS,
    perPage: range?.perPage ?? 1,
    translations: translationIds.length ? translationIds.join(',') : undefined,
    reciter,
    audio: reciter,
    wordFields: getDefaultWordFields(quranFont).wordFields,
    wordTranslationLanguage: 'en',
    translationFields: 'resource_name,language_name,author_name',
    mushaf: mushafId,
  };

  // Add mushaf-specific word fields
  if (mushaf === 'indopak') params.wordFields += ',text_indopak';
  if (mushaf === 'tajweed') params.wordFields += ',text_uthmani_tajweed';
  if (mushaf === 'kfgqpc_v1' && !String(params.wordFields).includes('code_v1')) {
    params.wordFields += ',code_v1';
  }

  if (range) {
    params.from = range.from;
    params.to = range.to;
  }

  // Remove undefined parameters
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) delete params[key];
  });

  return params;
};

/**
 * Handle the API request for the Ayah widget.
 * @param {NextApiRequest} req The API request.
 * @param {NextApiResponse<WidgetResponse>} res The API response.
 * @returns {Promise<void>}
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<WidgetResponse>) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      html: '<div>Method not allowed</div>',
    });
  }

  // Parse query parameters
  const ayah = parseString(req.query.ayah) || DEFAULT_VERSE;
  // Validate ayah format: must be "chapter:verse" where both are positive integers
  if (!/^\d+:\d+$/.test(ayah)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ayah format. Expected "chapter:verse" (e.g., "1:1").',
      html: '<div>Invalid ayah format. Expected "chapter:verse" (e.g., "1:1").</div>',
    });
  }

  // Parse translation IDs, reciter, and other options
  const translationIdsQuery = parseString(req.query.translations) ?? '';
  const reciter = parseString(req.query.reciter) || DEFAULT_RECITER;
  const enableAudio = parseBool(req.query.audio, true);
  const enableWbw = parseBool(req.query.wbw);
  const themeParam = parseString(req.query.theme);
  const theme: WidgetOptions['theme'] =
    themeParam === ThemeType.Dark || themeParam === ThemeType.Sepia ? themeParam : ThemeType.Light;
  const mushafParam = parseString(req.query.mushaf);
  const mushaf: MushafType = isMushafType(mushafParam) ? mushafParam : 'qpc';
  const showTranslatorNames = parseBool(req.query.showTranslatorNames);
  const showQuranLink = parseBool(req.query.showQuranLink, true);
  const showArabic = parseBool(req.query.showArabic, true);
  const showTafsirs = parseBool(req.query.showTafsirs, true);
  const showReflections = parseBool(req.query.showReflections, true);
  const showAnswers = parseBool(req.query.showAnswers, true);

  // Parse range end if provided
  const rangeEndParam = parseString(req.query.rangeEnd);
  const [chapterSegment, verseSegment] = ayah.split(':');
  const chapterNumber = Number(chapterSegment);
  const verseNumber = Number(verseSegment);
  const parsedRangeEnd = rangeEndParam ? Number(rangeEndParam) : undefined;
  const normalizedRangeEnd =
    parsedRangeEnd &&
    Number.isFinite(parsedRangeEnd) &&
    parsedRangeEnd > verseNumber &&
    parsedRangeEnd <= verseNumber + 10 // Limit range to max 10 verses
      ? parsedRangeEnd
      : undefined;

  // Parse custom dimensions
  const customWidth = parseString(req.query.width) || undefined;
  const customHeight = parseString(req.query.height) || undefined;
  const reciterId = Number(reciter) || Number(DEFAULT_RECITER);

  // Parse translation IDs
  const translationIdList = translationIdsQuery
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id));

  try {
    // Build each verse key that needs to be requested; range produces multiple keys, otherwise a single verse.
    const verseKeys = normalizedRangeEnd
      ? Array.from(
          { length: normalizedRangeEnd - verseNumber + 1 },
          (unused, idx) => `${chapterNumber}:${verseNumber + idx}`,
        )
      : [ayah];
    const verseResponses = await Promise.all(
      verseKeys.map((verseKey) =>
        fetcher<VerseResponse>(
          makeByVerseKeyUrl(verseKey, buildVerseParams(translationIdList, reciter, mushaf)),
        ),
      ),
    );

    const verses = verseResponses.map((response) => response.verse).filter(Boolean) as Verse[];
    if (!verses.length) {
      throw new Error('No verses returned for the requested range.');
    }

    // Sanitize verses
    const sanitizedVerses = verses.map(sanitizeVerse);
    const translationResourceIds = new Set<number>();
    sanitizedVerses.forEach((verseItem) => {
      verseItem.translations?.forEach((translation) => {
        if (translation.resourceId) {
          translationResourceIds.add(translation.resourceId);
        }
      });
    });

    if (translationResourceIds.size) {
      try {
        const translationsMeta = await fetcher<TranslationsResponse>(
          makeTranslationsInfoUrl('en', Array.from(translationResourceIds)),
        );
        const metaById = new Map<number, AvailableTranslation>();
        translationsMeta.translations?.forEach((translation) => {
          if (translation.id) {
            metaById.set(translation.id, translation);
          }
        });
        sanitizedVerses.forEach((verseItem, index) => {
          const enrichedTranslations = enrichTranslations(verseItem.translations, metaById);
          sanitizedVerses[index] = {
            ...verseItem,
            translations: enrichedTranslations,
          };
        });
      } catch (error) {
        logDebug('Ayah widget: Failed to load translation metadata', {
          error,
          translationResourceIds: Array.from(translationResourceIds),
          ayah,
        });
      }
    }

    // Fetch Surah name and audio data if needed
    const chapterCandidate = sanitizedVerses[0].chapterId || chapterNumber;
    let surahName: string | undefined;
    let audioUrl: string | undefined;
    let audioStartSeconds: number | undefined;
    let audioEndSeconds: number | undefined;

    // Turn the chapter number into its transliterated name
    const numericChapterId = Number(chapterCandidate);
    if (Number.isFinite(numericChapterId) && numericChapterId > 0) {
      try {
        const chapterResponse = await fetcher<ChapterResponse>(
          makeChapterUrl(String(numericChapterId), 'en'),
        );
        const chapterData = chapterResponse.chapter;
        surahName = chapterData?.nameSimple;
      } catch (error) {
        logDebug('Failed to fetch chapter info for Surah name', { numericChapterId, error });
      }

      // Fetch audio data if audio is enabled
      if (enableAudio) {
        try {
          const { audioUrl: fetchedAudioUrl, verseTimings } = await getChapterAudioData(
            reciterId,
            numericChapterId,
            true,
          );
          audioUrl = fetchedAudioUrl;
          // Find start and end timings for the requested verse(s)
          const firstVerse = sanitizedVerses[0];
          const lastVerse = sanitizedVerses[sanitizedVerses.length - 1];
          const startTiming = verseTimings?.find(
            (verseTiming) => verseTiming.verseKey === firstVerse.verseKey,
          );
          const endTiming = verseTimings?.find(
            (verseTiming) => verseTiming.verseKey === lastVerse.verseKey,
          );
          if (startTiming) audioStartSeconds = startTiming.timestampFrom / 1000;
          if (endTiming) audioEndSeconds = endTiming.timestampTo / 1000;
        } catch (error) {
          logDebug('Ayah widget audio data load error', {
            error,
            reciterId,
            chapterId: numericChapterId,
          });
        }
      }
    }

    // Determine if any translations exist for the current ayah
    const hasTranslations = sanitizedVerses.some(
      (verseItem) => (verseItem.translations?.length ?? 0) > 0,
    );

    const widgetOptions = buildWidgetOptions(
      ayah,
      {
        enableAudio,
        enableWbw,
        theme,
        mushaf,
        showTranslatorNames,
        showQuranLink,
        showArabic,
        showTafsirs,
        showReflections,
        showAnswers,
        rangeEnd: normalizedRangeEnd,
        customWidth,
        customHeight,
      },
      {
        hasAnyTranslations: hasTranslations,
        surahName,
        audioUrl,
        audioStart: audioStartSeconds,
        audioEnd: audioEndSeconds,
      },
    );

    // Create the widget component and then render it to static HTML
    const html = renderToStaticMarkup(
      <QuranWidget verses={sanitizedVerses} options={widgetOptions} />,
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Return the rendered HTML
    return res.status(200).json({ success: true, html });
  } catch (error) {
    logDebug('Ayah widget error', { error });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      html: '<div style="color:red;padding:20px;">Error loading verse. Please try again.</div>',
    });
  }
};

export default handler;
