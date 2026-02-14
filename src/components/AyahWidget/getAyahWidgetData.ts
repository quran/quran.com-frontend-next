/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import getT from 'next-translate/getT';

import i18nConfig from '../../../i18n.json';

import { fetcher, getChapterAudioData } from '@/api';
import { logErrorToSentry } from '@/lib/sentry';
import ThemeType from '@/redux/types/ThemeType';
import type ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { MushafType, WidgetLabels, WidgetOptions } from '@/types/Embed';
import { getQuranFontForMushaf } from '@/types/Embed';
import { MushafLines } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import {
  DEFAULT_VERSES_PARAMS,
  makeByVerseKeyUrl,
  makeChapterUrl,
  makeTranslationsInfoUrl,
  makeWordByWordTranslationsUrl,
} from '@/utils/apiPaths';
import { countQuestionsWithinRange } from '@/utils/auth/api';
import type {
  ChapterResponse,
  TranslationsResponse,
  VerseResponse,
  WordByWordTranslationsResponse,
} from 'types/ApiResponses';
import type AvailableTranslation from 'types/AvailableTranslation';
import Language from 'types/Language';
import QuestionType from 'types/QuestionsAndAnswers/QuestionType';
import type Translation from 'types/Translation';
import type Verse from 'types/Verse';

export const DEFAULT_VERSE: string = '33:56';
export const DEFAULT_RECITER: string = '7'; // Mishary Alafasy
export const MAX_RANGE_SPAN: number = 10;

const INCORRECT_SUKUN_REGEX: RegExp = /[\u06DF\u06E1\u06E2\u06E3\u06E4]/g; // Needed because of a font issue
const FOOTNOTE_REGEX: RegExp = /<sup[^>]*>.*?<\/sup>/g; // Remove footnotes from translation text

/**
 * User input error for the widget endpoint.
 * Use this to return a specific status code with a user-friendly message.
 */
export class WidgetInputError extends Error {
  status: number;

  /**
   * @param {number} status - HTTP status code.
   * @param {string} message - Error message.
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Replace incorrect sukun characters that appear due to font issues.
 *
 * @param {string | null | undefined} value - Raw text.
 * @returns {string} Normalized text (or empty string).
 */
const normalizeText = (value?: string | null): string =>
  value ? value.replace(INCORRECT_SUKUN_REGEX, '\u0652') : '';

/**
 * Sanitize a verse:
 * - normalize Arabic text (incorrect sukun)
 * - normalize words text
 * - remove footnotes from translation HTML
 *
 * @param {Verse} verse - Raw verse.
 * @returns {Verse} Sanitized verse.
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
 * Build the widget options object consumed by the widget renderer.
 *
 * @param {string} ayah - Ayah key "chapter:verse".
 * @param {object} params - Widget parameters.
 * @param {boolean} params.enableAudio - Enable audio playback.
 * @param {boolean} params.enableWbw - Enable word-by-word translation.
 * @param {boolean} params.lp - Enable minimal learning plan mode (simplified header).
 * @param {number | undefined} params.rangeEnd - Optional range end verse number.
 * @param {ThemeTypeVariant} params.theme - Theme variant.
 * @param {MushafType} params.mushaf - Mushaf style.
 * @param {boolean} params.showTranslatorNames - Show translator names.
 * @param {boolean} params.showTafsirs - Show tafsirs CTA.
 * @param {boolean} params.showReflections - Show reflections CTA.
 * @param {boolean} params.showLessons - Show lessons CTA.
 * @param {boolean} params.showAnswers - Show answers CTA.
 * @param {string} params.locale - Locale code.
 * @param {WidgetLabels} params.labels - Localized widget labels.
 * @param {string | undefined} params.customWidth - Custom width.
 * @param {string | undefined} params.customHeight - Custom height.
 * @param {boolean} params.showArabic - Show Arabic text.
 * @param {boolean} params.mergeVerses - Merge verses into a single block.
 * @param {object | undefined} meta - Computed metadata.
 * @param {boolean} meta.hasAnyTranslations - Whether any translation exists for the fetched verses.
 * @param {string | undefined} meta.surahName - Resolved Surah name.
 * @param {string | undefined} meta.audioUrl - Chapter audio URL.
 * @param {number | undefined} meta.audioStart - Start second for the range.
 * @param {number | undefined} meta.audioEnd - End second for the range.
 * @returns {WidgetOptions} Widget options.
 */
const buildWidgetOptions = (
  ayah: string,
  params: {
    enableAudio: boolean;
    enableWbw: boolean;
    enableWbwTransliteration: boolean;
    rangeEnd?: number;
    theme: ThemeTypeVariant;
    mushaf: MushafType;
    showTranslatorNames: boolean;
    showTafsirs: boolean;
    showReflections: boolean;
    showLessons: boolean;
    showAnswers: boolean;
    locale: string;
    labels: WidgetLabels;
    customWidth?: string;
    customHeight?: string;
    showArabic: boolean;
    mergeVerses?: boolean;
    lp?: boolean; // minimal learning plan mode
  },
  meta?: {
    hasAnyTranslations: boolean;
    hasAnswers: boolean;
    isClarificationQuestion: boolean;
    surahName?: string;
    audioUrl?: string;
    audioStart?: number;
    audioEnd?: number;
  },
): WidgetOptions => ({
  enableAudio: params.enableAudio,
  enableWbw: params.enableWbw,
  enableWbwTransliteration: params.enableWbwTransliteration,
  theme: params.theme,
  mushaf: params.mushaf,
  showTranslatorNames: params.showTranslatorNames,
  showArabic: params.showArabic,
  showTafsirs: params.showTafsirs,
  showReflections: params.showReflections,
  showLessons: params.showLessons,
  showAnswers: params.showAnswers,
  locale: params.locale,
  labels: params.labels,
  rangeEnd: params.rangeEnd,
  ayah,
  hasAnyTranslations: meta?.hasAnyTranslations ?? false,
  hasAnswers: meta?.hasAnswers ?? false,
  isClarificationQuestion: meta?.isClarificationQuestion ?? false,
  surahName: meta?.surahName,
  customWidth: params.customWidth,
  customHeight: params.customHeight,
  audioUrl: meta?.audioUrl,
  audioStart: meta?.audioStart,
  audioEnd: meta?.audioEnd,
  mergeVerses: params.mergeVerses,
  lp: params.lp,
});

/**
 * Enrich translation objects with metadata (resource name / author) when missing.
 *
 * @param {Translation[] | undefined} translations - Verse translations.
 * @param {Map<number, AvailableTranslation>} metaById - Translation meta keyed by ID.
 * @returns {Translation[] | undefined} Enriched translations.
 */
const enrichTranslations = (
  translations: Translation[] | undefined,
  metaById: Map<number, AvailableTranslation>,
): Translation[] | undefined => {
  if (!translations?.length) return translations;

  return translations.map((translation) => {
    const meta: AvailableTranslation | undefined = translation.resourceId
      ? metaById.get(translation.resourceId)
      : undefined;

    if (!meta) return translation;

    return {
      ...translation,
      resourceName: translation.resourceName || meta.name || translation.resourceName,
      authorName: translation.authorName || meta.authorName || translation.authorName,
    };
  });
};

type VerseRangeRequest = {
  from: number;
  to: number;
  perPage: number;
};

type VerseApiParams = Record<string, unknown>;

/**
 * Tracking params for widget analytics.
 */
type WidgetTracking = {
  clientId?: string;
  referer?: string;
  isWidget?: boolean;
  embedViewId?: string;
  theme?: ThemeTypeVariant;
  enableAudio?: boolean;
  enableWbw?: boolean;
  enableWbwTransliteration?: boolean;
  showArabic?: boolean;
  showTafsirs?: boolean;
  showReflections?: boolean;
  showLessons?: boolean;
  showAnswers?: boolean;
  mergeVerses?: boolean;
  locale?: string;
  rangeStart?: number;
  rangeEnd?: number;
};

/**
 * Build parameters for the verse API request.
 *
 * @param {number[]} translationIds - Selected translation IDs.
 * @param {string} reciter - Reciter ID as string.
 * @param {MushafType} mushaf - Mushaf style.
 * @param {string} wordByWordLocale - Locale used for word-by-word translation.
 * @param {VerseRangeRequest | undefined} range - Optional range request.
 * @returns {VerseApiParams} Params object for the API call.
 */
const buildVerseParams = (
  translationIds: number[],
  reciter: string,
  mushaf: MushafType,
  wordByWordLocale: string,
  range?: VerseRangeRequest,
  tracking?: WidgetTracking,
): VerseApiParams => {
  const quranFont = getQuranFontForMushaf(mushaf);

  // Use the 16-line IndoPak mushaf so verse-end glyphs include the proper IndoPak styling.
  const mushafId =
    mushaf === 'indopak'
      ? getMushafId(quranFont, MushafLines.SixteenLines).mushaf
      : getMushafId(quranFont).mushaf;

  const params: VerseApiParams = {
    ...DEFAULT_VERSES_PARAMS,
    perPage: range?.perPage ?? 1,
    translations: translationIds.length ? translationIds.join(',') : undefined,
    reciter,
    audio: reciter,
    wordFields: getDefaultWordFields(quranFont).wordFields,
    wordTranslationLanguage: wordByWordLocale,
    translationFields: 'resource_name,language_name,author_name,language_id',
    mushaf: mushafId,
  };

  // Add extra word fields depending on mushaf type
  if (mushaf === 'indopak') (params.wordFields as string) += ',text_indopak';
  if (mushaf === 'tajweed') (params.wordFields as string) += ',text_uthmani_tajweed';
  if (mushaf === 'kfgqpc_v1' && !String(params.wordFields).includes('code_v1')) {
    (params.wordFields as string) += ',code_v1';
  }

  // Range params (not used in your current flow because you fetch verseKey by verseKey,
  // but kept here for future batch optimizations).
  if (range) {
    params.from = range.from;
    params.to = range.to;
  }

  // Add tracking params for widget analytics
  if (tracking?.clientId) params.clientId = tracking.clientId;
  if (tracking?.referer) params.referer = tracking.referer;
  if (typeof tracking?.isWidget === 'boolean') params.isWidget = tracking.isWidget;
  if (tracking?.embedViewId) params.embedViewId = tracking.embedViewId;
  if (tracking?.theme) params.theme = tracking.theme;
  if (typeof tracking?.enableAudio === 'boolean') params.enableAudio = tracking.enableAudio;
  if (typeof tracking?.enableWbw === 'boolean') params.enableWbw = tracking.enableWbw;
  if (typeof tracking?.enableWbwTransliteration === 'boolean') {
    params.enableWbwTransliteration = tracking.enableWbwTransliteration;
  }
  if (typeof tracking?.showArabic === 'boolean') params.showArabic = tracking.showArabic;
  if (typeof tracking?.showTafsirs === 'boolean') params.showTafsirs = tracking.showTafsirs;
  if (typeof tracking?.showReflections === 'boolean') {
    params.showReflections = tracking.showReflections;
  }
  if (typeof tracking?.showLessons === 'boolean') params.showLessons = tracking.showLessons;
  if (typeof tracking?.showAnswers === 'boolean') params.showAnswers = tracking.showAnswers;
  if (typeof tracking?.mergeVerses === 'boolean') params.mergeVerses = tracking.mergeVerses;
  if (tracking?.locale) params.locale = tracking.locale;
  if (typeof tracking?.rangeStart === 'number') params.rangeStart = tracking.rangeStart;
  if (typeof tracking?.rangeEnd === 'number') params.rangeEnd = tracking.rangeEnd;

  // Strip undefined keys (clean query string)
  Object.keys(params).forEach((key: string) => {
    if (params[key] === undefined) delete params[key];
  });

  return params;
};

export type AyahWidgetDataInput = {
  ayah: string;
  translationIds?: number[];
  reciter?: string;
  enableAudio?: boolean;
  enableWbw?: boolean;
  enableWbwTransliteration?: boolean;
  theme?: ThemeTypeVariant;
  mushaf?: MushafType;
  showTranslatorNames?: boolean;
  showArabic?: boolean;
  showTafsirs?: boolean;
  showReflections?: boolean;
  showLessons?: boolean;
  showAnswers?: boolean;
  locale?: string;
  rangeEnd?: number;
  mergeVerses?: boolean;
  customWidth?: string;
  customHeight?: string;
  clientId?: string; // for tracking usage
  referer?: string; // url of the page hosting the widget iframe
  embedViewId?: string; // stable id for one iframe render
  lp?: boolean; // minimal learning plan mode
};

export type AyahWidgetData = {
  verses: Verse[];
  options: WidgetOptions;
};

type ParsedAyah = {
  chapterNumber: number;
  verseNumber: number;
};

/**
 * Validate and parse "chapter:verse".
 *
 * @param {string} ayah - Ayah key.
 * @returns {ParsedAyah} Parsed numbers.
 * @throws {WidgetInputError} When invalid format or bounds.
 */
const parseAndValidateAyah = (ayah: string): ParsedAyah => {
  // Must be "chapter:verse"
  if (!/^\d+:\d+$/.test(ayah)) {
    throw new WidgetInputError(400, 'Invalid ayah format. Expected "chapter:verse" (e.g., "1:1").');
  }

  const [chapterSegment, verseSegment]: string[] = ayah.split(':');
  const chapterNumber: number = Number(chapterSegment);
  const verseNumber: number = Number(verseSegment);

  // Fast bounds check (final verse bounds is validated against chapter meta)
  if (
    !Number.isInteger(chapterNumber) ||
    chapterNumber < 1 ||
    chapterNumber > 114 ||
    !Number.isInteger(verseNumber) ||
    verseNumber < 1 ||
    verseNumber > 286
  ) {
    throw new WidgetInputError(400, 'Invalid ayah bounds.');
  }

  return { chapterNumber, verseNumber };
};

/**
 * Validate the locale param (must exist in i18nConfig locales).
 *
 * @param {string | undefined} locale - Locale code.
 * @returns {string} Valid locale.
 * @throws {WidgetInputError} When unsupported locale.
 */
const resolveLocale = (locale?: string): string => {
  const resolved: string = locale || i18nConfig.defaultLocale;

  if (locale && !i18nConfig.locales.includes(locale)) {
    throw new WidgetInputError(
      400,
      `Unsupported locale "${locale}". Supported locales: ${i18nConfig.locales.join(', ')}`,
    );
  }

  return resolved;
};

/**
 * Normalize rangeEnd with validation:
 * - must be > verseNumber
 * - must be <= min(verseNumber + MAX_RANGE_SPAN, versesCount)
 *
 * @param {number | undefined} rangeEnd - Requested range end.
 * @param {number} verseNumber - Range start.
 * @param {number} versesCount - Chapter verse count.
 * @returns {number | undefined} Normalized range end.
 * @throws {WidgetInputError} When it exceeds allowed span.
 */
const normalizeRangeEnd = (
  rangeEnd: number | undefined,
  verseNumber: number,
  versesCount: number,
): number | undefined => {
  const parsed: number | undefined = Number.isFinite(rangeEnd) ? rangeEnd : undefined;
  const maxAllowed: number = Math.min(verseNumber + MAX_RANGE_SPAN, versesCount);

  if (parsed && parsed > maxAllowed) {
    throw new WidgetInputError(
      400,
      `Requested range exceeds the maximum allowed span (up to ${maxAllowed}).`,
    );
  }

  if (!parsed) return undefined;
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed <= verseNumber) return undefined;
  if (parsed > maxAllowed) return undefined;

  return parsed;
};

/**
 * Determine word-by-word translation locale.
 * We only use the requested locale if WBW translations exist for that locale.
 *
 * @param {boolean} enableWbw - Whether WBW is enabled.
 * @param {string} locale - Requested locale.
 * @returns {Promise<string>} Resolved WBW locale to use.
 */
const resolveWordByWordLocale = async (enableWbw: boolean, locale: string): Promise<string> => {
  let wordByWordLocale: string = 'en';
  if (!enableWbw) return wordByWordLocale;

  // If locale is English, it is always safe.
  if (locale === 'en') return 'en';

  try {
    const wbwResponse: WordByWordTranslationsResponse =
      await fetcher<WordByWordTranslationsResponse>(makeWordByWordTranslationsUrl(locale));

    const isoCodes: Set<string> = new Set(
      (wbwResponse.wordByWordTranslations ?? [])
        .map((translation) => translation.isoCode)
        .filter(Boolean) as string[],
    );

    if (isoCodes.has(locale)) {
      wordByWordLocale = locale;
    }
  } catch (error) {
    logErrorToSentry('Ayah widget: Failed to load word-by-word translations', error);
  }

  return wordByWordLocale;
};

/**
 * Resolve whether the selected verse has any answers.
 *
 * @param {string} verseKey - Ayah key "chapter:verse".
 * @param {string} locale - Locale code.
 * @param {boolean} showAnswers - Whether answers are enabled by config.
 * @returns {Promise<{ hasAnswers: boolean; isClarificationQuestion: boolean }>} Answers metadata.
 */
const resolveAnswersMeta = async (
  verseKey: string,
  locale: string,
  showAnswers: boolean,
): Promise<{ hasAnswers: boolean; isClarificationQuestion: boolean }> => {
  if (!showAnswers) return { hasAnswers: false, isClarificationQuestion: false };

  const language = (Object.values(Language) as string[]).includes(locale)
    ? (locale as Language)
    : Language.EN;

  try {
    const questionsByVerse = await countQuestionsWithinRange(verseKey, verseKey, language);
    const verseQuestions = questionsByVerse?.[verseKey];
    return {
      hasAnswers: (verseQuestions?.total ?? 0) > 0,
      isClarificationQuestion: Boolean(verseQuestions?.types?.[QuestionType.CLARIFICATION]),
    };
  } catch (error) {
    logErrorToSentry('Ayah widget: Failed to load answers count', error);
    return { hasAnswers: false, isClarificationQuestion: false };
  }
};

/**
 * Load widget labels in the requested locale.
 *
 * @param {string} locale - Locale code.
 * @returns {Promise<WidgetLabels>} Localized labels.
 */
const loadWidgetLabels = async (locale: string): Promise<WidgetLabels> => {
  const tCommon = await getT(locale, 'common');
  const tQuranReader = await getT(locale, 'quran-reader');
  const tEmbed = await getT(locale, 'embed');

  return {
    quran: tQuranReader('q-and-a.quran'),
    readOnQuran: tEmbed('widget.readOnQuran'),
    surah: tCommon('surah'),
    verse: tCommon('verse'),
    tafsirs: tQuranReader('tafsirs'),
    reflections: tCommon('reflections'),
    lessons: tCommon('lessons'),
    answers: tCommon('answers'),
  };
};

/**
 * Build verse keys for a range.
 *
 * @param {number} chapterNumber - Chapter number.
 * @param {number} verseNumber - Start verse number.
 * @param {number | undefined} rangeEnd - Optional range end verse number.
 * @returns {string[]} Verse keys.
 */
const buildVerseKeys = (
  chapterNumber: number,
  verseNumber: number,
  rangeEnd?: number,
): string[] => {
  if (!rangeEnd) return [`${chapterNumber}:${verseNumber}`];

  return Array.from(
    { length: rangeEnd - verseNumber + 1 },
    (unused: unknown, idx: number) => `${chapterNumber}:${verseNumber + idx}`,
  );
};

/**
 * Fetch verses for the given verse keys.
 *
 * @param {string[]} verseKeys - Verse keys.
 * @param {object} params - Param bag for API params.
 * @param {number[]} params.translationIds - Translation IDs.
 * @param {string} params.reciter - Reciter ID.
 * @param {MushafType} params.mushaf - Mushaf style.
 * @param {string} params.wordByWordLocale - WBW locale.
 * @param {WidgetTracking} params.tracking - Tracking params.
 * @returns {Promise<Verse[]>} Raw verses.
 */
const fetchVersesByKeys = async (
  verseKeys: string[],
  params: {
    translationIds: number[];
    reciter: string;
    mushaf: MushafType;
    wordByWordLocale: string;
    tracking?: WidgetTracking;
  },
): Promise<Verse[]> => {
  const verseResponses: VerseResponse[] = await Promise.all(
    verseKeys.map((verseKey: string) =>
      fetcher<VerseResponse>(
        makeByVerseKeyUrl(
          verseKey,
          buildVerseParams(
            params.translationIds,
            params.reciter,
            params.mushaf,
            params.wordByWordLocale,
            undefined, // range
            params.tracking, // add clientId + referer to track usage
          ),
        ),
      ),
    ),
  );

  const verses: Verse[] = verseResponses
    .map((response: VerseResponse) => response.verse)
    .filter(Boolean) as Verse[];

  return verses;
};

/**
 * Fetch chapter metadata and validate verse bounds.
 *
 * @param {number} chapterNumber - Chapter number.
 * @param {string} locale - Locale.
 * @returns {Promise<ChapterResponse['chapter']>} Chapter data.
 * @throws {WidgetInputError} When chapter is invalid.
 */
const fetchAndValidateChapter = async (
  chapterNumber: number,
  locale: string,
): Promise<ChapterResponse['chapter']> => {
  try {
    const chapterResponse: ChapterResponse = await fetcher<ChapterResponse>(
      makeChapterUrl(String(chapterNumber), locale),
    );

    if (!chapterResponse.chapter) {
      throw new WidgetInputError(400, 'Invalid chapter requested.');
    }

    return chapterResponse.chapter;
  } catch (error) {
    throw new WidgetInputError(400, 'Invalid chapter requested.');
  }
};

/**
 * Try to enrich translations with metadata via translations info endpoint.
 *
 * @param {Verse[]} verses - Sanitized verses.
 * @returns {Promise<Verse[]>} Verses with enriched translation metadata (best-effort).
 */
const enrichVerseTranslations = async (verses: Verse[]): Promise<Verse[]> => {
  const translationResourceIds: Set<number> = new Set<number>();

  verses.forEach((verseItem: Verse) => {
    verseItem.translations?.forEach((translation: Translation) => {
      if (translation.resourceId) translationResourceIds.add(translation.resourceId);
    });
  });

  if (!translationResourceIds.size) return verses;

  try {
    const translationsMeta: TranslationsResponse = await fetcher<TranslationsResponse>(
      makeTranslationsInfoUrl('en', Array.from(translationResourceIds)),
    );

    const metaById: Map<number, AvailableTranslation> = new Map<number, AvailableTranslation>();
    translationsMeta.translations?.forEach((translation: AvailableTranslation) => {
      if (translation.id) metaById.set(translation.id, translation);
    });

    return verses.map((verseItem: Verse) => ({
      ...verseItem,
      translations: enrichTranslations(verseItem.translations, metaById),
    }));
  } catch (error) {
    logErrorToSentry('Ayah widget: Failed to load translation metadata', error);
    return verses;
  }
};

/**
 * Resolve surah name and audio segment bounds (best-effort).
 *
 * @param {object} params - Param bag.
 * @param {Verse[]} params.verses - Sanitized verses.
 * @param {number} params.chapterNumber - Chapter number.
 * @param {string} params.locale - Locale.
 * @param {boolean} params.enableAudio - Enable audio.
 * @param {number} params.reciterId - Numeric reciter id.
 * @param {ChapterResponse['chapter']} params.chapterData - Chapter data.
 * @returns {Promise<{ surahName?: string; audioUrl?: string; audioStart?: number; audioEnd?: number }>} Meta.
 */
const resolveWidgetMeta = async (params: {
  verses: Verse[];
  chapterNumber: number;
  locale: string;
  enableAudio: boolean;
  reciterId: number;
  chapterData: ChapterResponse['chapter'];
}): Promise<{ surahName?: string; audioUrl?: string; audioStart?: number; audioEnd?: number }> => {
  const firstVerse: Verse = params.verses[0];
  const lastVerse: Verse = params.verses[params.verses.length - 1];

  const surahName: string | undefined =
    params.locale === 'ar' ? params.chapterData?.nameArabic : params.chapterData?.nameSimple;

  // Audio is best-effort. If it fails, the widget can still render.
  if (!params.enableAudio) return { surahName };

  try {
    const audioData = await getChapterAudioData(params.reciterId, params.chapterNumber, true);
    const { audioUrl } = audioData;
    const { verseTimings } = audioData;

    const startTiming = verseTimings?.find((t) => t.verseKey === firstVerse.verseKey);
    const endTiming = verseTimings?.find((t) => t.verseKey === lastVerse.verseKey);

    const audioStart: number | undefined = startTiming
      ? startTiming.timestampFrom / 1000
      : undefined;
    const audioEnd: number | undefined = endTiming ? endTiming.timestampTo / 1000 : undefined;

    return { surahName, audioUrl, audioStart, audioEnd };
  } catch (error) {
    logErrorToSentry('Ayah widget audio data load error', error);
    return { surahName };
  }
};

/**
 * Fetch and prepare data required to render the Ayah widget.
 *
 * @param {AyahWidgetDataInput} input - Widget input config.
 * @returns {Promise<AyahWidgetData>} Verses + widget options.
 * @throws {WidgetInputError} When input is invalid.
 */
export const getAyahWidgetData = async (input: AyahWidgetDataInput): Promise<AyahWidgetData> => {
  const ayah: string = input.ayah || DEFAULT_VERSE;

  const translationIds: number[] = input.translationIds ?? [];
  const reciter: string = input.reciter || DEFAULT_RECITER;

  const enableAudio: boolean = input.enableAudio ?? true;
  const enableWbw: boolean = input.enableWbw ?? false;
  const enableWbwTransliteration: boolean = input.enableWbwTransliteration ?? false;

  const theme: ThemeTypeVariant = input.theme ?? ThemeType.Light;
  const mushaf: MushafType = input.mushaf ?? 'qpc';

  const showTranslatorNames: boolean = input.showTranslatorNames ?? false;
  const showArabic: boolean = input.showArabic ?? true;
  const showTafsirs: boolean = input.showTafsirs ?? true;
  const showReflections: boolean = input.showReflections ?? true;
  const showLessons: boolean = input.showLessons ?? true;
  const showAnswers: boolean = input.showAnswers ?? true;
  const mergeVerses: boolean = input.mergeVerses ?? false;

  const locale: string = resolveLocale(input.locale);

  const { chapterNumber, verseNumber }: ParsedAyah = parseAndValidateAyah(ayah);

  // Fetch chapter metadata once to validate verse bounds.
  const chapterData: ChapterResponse['chapter'] = await fetchAndValidateChapter(
    chapterNumber,
    locale,
  );

  const versesCount: number | undefined = chapterData?.versesCount;
  if (!versesCount || verseNumber > versesCount) {
    throw new WidgetInputError(400, 'Verse number is out of range for the selected chapter.');
  }

  const normalizedRangeEnd: number | undefined = normalizeRangeEnd(
    input.rangeEnd,
    verseNumber,
    versesCount,
  );

  const customWidth: string | undefined = input.customWidth || undefined;
  const customHeight: string | undefined = input.customHeight || undefined;

  const reciterId: number = Number(reciter) || Number(DEFAULT_RECITER);

  // Localized labels.
  const labels: WidgetLabels = await loadWidgetLabels(locale);

  // Word-by-word locale.
  const wordByWordLocale: string = await resolveWordByWordLocale(enableWbw, locale);

  const startVerseKey = `${chapterNumber}:${verseNumber}`;
  const { hasAnswers, isClarificationQuestion } = await resolveAnswersMeta(
    startVerseKey,
    locale,
    showAnswers,
  );

  // Verse keys & verses fetch.
  const verseKeys: string[] = buildVerseKeys(chapterNumber, verseNumber, normalizedRangeEnd);
  const tracking: WidgetTracking = {
    clientId: input.clientId,
    referer: input.referer,
    isWidget: true,
    embedViewId: input.embedViewId,
    theme,
    enableAudio,
    enableWbw,
    enableWbwTransliteration,
    showArabic,
    showTafsirs,
    showReflections,
    showLessons,
    showAnswers,
    mergeVerses,
    locale,
    rangeStart: verseNumber,
    rangeEnd: normalizedRangeEnd,
  };
  const rawVerses: Verse[] = await fetchVersesByKeys(verseKeys, {
    translationIds,
    reciter,
    mushaf,
    wordByWordLocale,
    tracking,
  });

  if (!rawVerses.length) {
    throw new Error('No verses returned for the requested range.');
  }

  // Sanitize verses
  const sanitizedVerses: Verse[] = rawVerses.map(sanitizeVerse);

  // Enrich translation metadata (best-effort)
  const enrichedVerses: Verse[] = await enrichVerseTranslations(sanitizedVerses);

  const hasAnyTranslations: boolean = enrichedVerses.some(
    (verseItem: Verse) => (verseItem.translations?.length ?? 0) > 0,
  );

  // Resolve Surah name + audio (best-effort)
  const meta = await resolveWidgetMeta({
    verses: enrichedVerses,
    chapterNumber,
    locale,
    enableAudio,
    reciterId,
    chapterData,
  });

  const options: WidgetOptions = buildWidgetOptions(
    ayah,
    {
      enableAudio,
      enableWbw,
      enableWbwTransliteration,
      theme,
      mushaf,
      showTranslatorNames,
      showArabic,
      showTafsirs,
      showReflections,
      showLessons,
      showAnswers,
      locale,
      labels,
      rangeEnd: normalizedRangeEnd,
      customWidth,
      customHeight,
      mergeVerses,
      lp: input.lp,
    },
    {
      hasAnyTranslations,
      hasAnswers,
      isClarificationQuestion,
      surahName: meta.surahName,
      audioUrl: meta.audioUrl,
      audioStart: meta.audioStart,
      audioEnd: meta.audioEnd,
    },
  );

  return {
    verses: enrichedVerses,
    options,
  };
};
