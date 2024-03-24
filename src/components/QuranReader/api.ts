/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import {
  makeHizbVersesUrl,
  makeJuzVersesUrl,
  makePageVersesUrl,
  makeVersesUrl,
  makeRubVersesUrl,
  makeByRangeVersesUrl,
} from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { PagesLookUpRequest } from 'types/ApiRequests';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

interface TranslationViewRequestKeyInput {
  quranReaderDataType: QuranReaderDataType;
  pageNumber: number;
  initialData: VersesResponse;
  quranReaderStyles: QuranReaderStyles;
  selectedTranslations: number[];
  isVerseData: boolean;
  id: string | number;
  reciter: number;
  locale: string;
  wordByWordLocale: string;
}

interface ReadingViewRequestKeyInput {
  pageNumber: number;
  quranReaderStyles: QuranReaderStyles;
  reciter: number;
  locale: string;
  wordByWordLocale: string;
  pageVersesRange?: LookupRecord;
}

/**
 * Generate the request key (the API url based on the params)
 * which will be used by useSwr to determine whether to call BE
 * again or return the cached response.
 *
 * @returns {string}
 */
export const getTranslationViewRequestKey = ({
  id,
  isVerseData,
  initialData,
  pageNumber,
  quranReaderStyles,
  quranReaderDataType,
  selectedTranslations,
  reciter,
  locale,
  wordByWordLocale,
}: TranslationViewRequestKeyInput): string => {
  // if the response has only 1 verse it means we should set the page to that verse this will be combined with perPage which will be set to only 1.
  const page = isVerseData ? initialData.verses[0].verseNumber : pageNumber;
  const commonParams = {
    page,
    reciter,
    wordTranslationLanguage: wordByWordLocale,
    translations: selectedTranslations.join(','),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
  };
  if (quranReaderDataType === QuranReaderDataType.Juz) {
    return makeJuzVersesUrl(id, locale, {
      ...commonParams,
      perPage: initialData.pagination.perPage,
    });
  }
  if (quranReaderDataType === QuranReaderDataType.Hizb) {
    return makeHizbVersesUrl(id, locale, {
      ...commonParams,
      perPage: initialData.pagination.perPage,
    });
  }
  if (quranReaderDataType === QuranReaderDataType.Page) {
    return makePageVersesUrl(id, locale, {
      perPage: 'all',
      ...commonParams,
    });
  }
  if (quranReaderDataType === QuranReaderDataType.Rub) {
    return makeRubVersesUrl(id, locale, {
      from: initialData.metaData.from,
      perPage: initialData.pagination.perPage,
      to: initialData.metaData.to,
      ...commonParams,
    });
  }
  if (quranReaderDataType === QuranReaderDataType.ChapterVerseRanges) {
    return makeVersesUrl(id, locale, {
      from: initialData.metaData.from,
      perPage: initialData.pagination.perPage,
      to: initialData.metaData.to,
      ...commonParams,
    });
  }
  if (quranReaderDataType === QuranReaderDataType.Ranges) {
    return makeByRangeVersesUrl(locale, {
      from: initialData.pagesLookup.lookupRange.from,
      perPage: initialData.pagination.perPage,
      to: initialData.pagesLookup.lookupRange.to,
      ...commonParams,
    });
  }

  return makeVersesUrl(id, locale, {
    perPage: isVerseData ? 1 : initialData.pagination.perPage, // the idea is that when it's a verse view, we want to fetch only 1 verse starting from the verse's number and we can do that by passing per_page option to the API.
    ...commonParams,
  });
};

export const getReaderViewRequestKey = ({
  pageNumber,
  locale,
  quranReaderStyles,
  reciter,
  wordByWordLocale,
  pageVersesRange,
}: ReadingViewRequestKeyInput): string => {
  return makePageVersesUrl(
    pageNumber,
    locale,
    {
      ...getDefaultWordFields(quranReaderStyles.quranFont),
      ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
      reciter,
      perPage: 'all',
      wordTranslationLanguage: wordByWordLocale,
      filterPageWords: true,
      ...(pageVersesRange && { ...pageVersesRange }), // add the from and to verse range of the current page
    },
    false,
  );
};

export const getPagesLookupParams = (
  resourceId: number | string,
  quranReaderDataType: QuranReaderDataType,
  mushafId: number,
  initialData: VersesResponse,
) => {
  const params: PagesLookUpRequest = { mushaf: mushafId };
  const resourceIdNumber = Number(resourceId);
  switch (quranReaderDataType) {
    case QuranReaderDataType.Chapter:
      params.chapterNumber = resourceIdNumber;
      break;
    case QuranReaderDataType.Hizb:
      params.hizbNumber = resourceIdNumber;
      break;
    case QuranReaderDataType.Juz:
      params.juzNumber = resourceIdNumber;
      break;
    case QuranReaderDataType.Page:
      params.pageNumber = resourceIdNumber;
      break;
    case QuranReaderDataType.Rub:
      params.rubElHizbNumber = resourceIdNumber;
      break;
    case QuranReaderDataType.Verse:
      params.chapterNumber = resourceIdNumber;
      params.from = initialData.verses[0].verseKey;
      params.to = initialData.verses[0].verseKey;
      break;
    case QuranReaderDataType.ChapterVerseRanges:
      params.chapterNumber = resourceIdNumber;
      params.from = initialData.metaData.from;
      params.to = initialData.metaData.to;
      break;
    case QuranReaderDataType.Ranges:
      params.from = initialData.pagesLookup.lookupRange.from;
      params.to = initialData.pagesLookup.lookupRange.to;
      break;
    default:
      break;
  }
  return params;
};

/**
 * A custom fetcher that returns the verses array from the api result.
 * We need this workaround as useSWRInfinite requires the data from the api
 * to be an array, while the result we get is formatted as {meta: {}, verses: Verse[]}
 *
 * @returns {Promise<Verse[]>}
 */
export const verseFetcher = async (input: RequestInfo, init?: RequestInit): Promise<Verse[]> => {
  const res = await fetcher<VersesResponse>(input, init);
  // @ts-ignore ignore this typing for now, we'll get back into this when we fix the "initial data not being used" issue
  return res.verses;
};
