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
    theme: ThemeTypeVariant;
    mushaf: MushafType;
    showTranslatorNames: boolean;
    showQuranLink: boolean;
    customWidth?: string;
    customHeight?: string;
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
const buildVerseParams = (translationIds: number[], reciter: string, mushaf: MushafType) => {
  const quranFont = getQuranFontForMushaf(mushaf);
  const mushafId = getMushafId(quranFont).mushaf;

  const params: Record<string, unknown> = {
    ...DEFAULT_VERSES_PARAMS,
    perPage: 1,
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

  // Remove undefined parameters
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) delete params[key];
  });

  return params;
};

/**
 * Handle the API request for the Ayah widget.
 * @returns {Promise<void>} The API response.
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
  const customWidth = parseString(req.query.width) || undefined;
  const customHeight = parseString(req.query.height) || undefined;
  const reciterId = Number(reciter) || Number(DEFAULT_RECITER);

  // Parse translation IDs
  const translationIdList = translationIdsQuery
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id));

  try {
    // Fetch the verse data
    const verseResponse = await fetcher<VerseResponse>(
      makeByVerseKeyUrl(ayah, buildVerseParams(translationIdList, reciter, mushaf)),
    );
    // Sanitize the verse data
    const verse = sanitizeVerse(verseResponse.verse);

    // Enrich translations with metadata to get the author and translation names
    const translationResourceIds = (verse.translations ?? [])
      .map((translation) => translation.resourceId)
      .filter((resourceId): resourceId is number => typeof resourceId === 'number');

    if (translationResourceIds.length && verse.translations?.length) {
      try {
        const translationsMeta = await fetcher<TranslationsResponse>(
          makeTranslationsInfoUrl('en', translationResourceIds),
        );
        const metaById = new Map<number, AvailableTranslation>();
        translationsMeta.translations?.forEach((translation) => {
          if (translation.id) {
            metaById.set(translation.id, translation);
          }
        });
        verse.translations = enrichTranslations(verse.translations, metaById);
      } catch (error) {
        // Log error if translation metadata fails to load
        logDebug('Ayah widget: Failed to load translation metadata', {
          error,
          translationResourceIds,
          ayah,
        });
      }
    }

    // Fetch chapter info for Surah name and audio timings if needed
    const surahCandidate = verse.chapterId || Number.parseInt(ayah.split(':')[0] || '0', 10);
    let surahName: string | undefined;
    let audioUrl: string | undefined;
    let audioStartSeconds: number | undefined;
    let audioEndSeconds: number | undefined;

    // Turn the chapter number to the Surah name
    const numericChapterId = Number(surahCandidate);
    if (Number.isFinite(numericChapterId) && numericChapterId > 0) {
      try {
        const chapterResponse = await fetcher<ChapterResponse>(
          makeChapterUrl(String(numericChapterId), 'en'),
        );
        const chapterData = chapterResponse.chapter;
        surahName = chapterData?.nameSimple;
      } catch (error) {
        // Log error if chapter info fails to load
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
          const timing = verseTimings?.find(
            (verseTiming) => verseTiming.verseKey === verse.verseKey,
          );
          if (timing) {
            audioStartSeconds = timing.timestampFrom / 1000;
            audioEndSeconds = timing.timestampTo / 1000;
          }
        } catch (error) {
          logDebug('Ayah widget audio data load error', {
            error,
            reciterId,
            chapterId: numericChapterId,
          });
        }
      }
    }

    // Build widget options to render the widget
    const widgetOptions = buildWidgetOptions(
      ayah,
      {
        enableAudio,
        enableWbw,
        theme,
        mushaf,
        showTranslatorNames,
        showQuranLink,
        customWidth,
        customHeight,
      },
      {
        hasAnyTranslations:
          translationResourceIds.length > 0 || (verse.translations?.length ?? 0) > 0,
        surahName,
        audioUrl,
        audioStart: audioStartSeconds,
        audioEnd: audioEndSeconds,
      },
    );

    // Create the widget component and then render it to static HTML
    const html = renderToStaticMarkup(<QuranWidget verse={verse} options={widgetOptions} />);

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
