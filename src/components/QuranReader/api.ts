/* eslint-disable react-func/max-lines-per-function */
import { QuranReaderDataType } from './types';

import { fetcher } from 'src/api';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getDefaultWordFields } from 'src/utils/api';
import { makeJuzVersesUrl, makePageVersesUrl, makeVersesUrl } from 'src/utils/apiPaths';
import { VersesResponse } from 'types/ApiResponses';
import Verse from 'types/Verse';

interface RequestKeyInput {
  quranReaderDataType: QuranReaderDataType;
  index: number;
  initialData: VersesResponse;
  quranReaderStyles: QuranReaderStyles;
  selectedTranslations: number[];
  selectedTafsirs: number[];
  isVerseData: boolean;
  isTafsirData: boolean;
  id: string | number;
  reciter: number;
}
/**
 * Generate the request key (the API url based on the params)
 * which will be used by useSwr to determine whether to call BE
 * again or return the cached response.
 *
 * @returns {string}
 */
export const getRequestKey = ({
  id,
  isVerseData,
  isTafsirData,
  initialData,
  index,
  quranReaderStyles,
  quranReaderDataType,
  selectedTranslations,
  selectedTafsirs,
  reciter,
}: RequestKeyInput): string => {
  // if the response has only 1 verse it means we should set the page to that verse this will be combined with perPage which will be set to only 1.
  const page = isVerseData || isTafsirData ? initialData.verses[0].verseNumber : index + 1;
  if (quranReaderDataType === QuranReaderDataType.Juz) {
    return makeJuzVersesUrl(id, {
      page,
      reciter,
      translations: selectedTranslations.join(', '),
      ...getDefaultWordFields(quranReaderStyles.quranFont),
    });
  }
  if (quranReaderDataType === QuranReaderDataType.Page) {
    return makePageVersesUrl(id, {
      page,
      reciter,
      translations: selectedTranslations.join(', '),
      ...getDefaultWordFields(quranReaderStyles.quranFont),
    });
  }

  if (isTafsirData) {
    return makeVersesUrl(id, {
      page,
      perPage: 1,
      translations: null,
      tafsirs: selectedTafsirs.join(','),
      wordFields: `location, verse_key, ${quranReaderStyles.quranFont}`,
      tafsirFields: 'resource_name',
    });
  }

  if (quranReaderDataType === QuranReaderDataType.Range) {
    return makeVersesUrl(id, {
      reciter,
      page,
      from: initialData.metaData.from,
      to: initialData.metaData.to,
      translations: selectedTranslations.join(', '),
      ...getDefaultWordFields(quranReaderStyles.quranFont),
    });
  }

  return makeVersesUrl(id, {
    reciter,
    page,
    translations: selectedTranslations.join(', '),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...(isVerseData && { perPage: 1 }), // the idea is that when it's a verse view, we want to fetch only 1 verse starting from the verse's number and we can do that by passing per_page option to the API.
  });
};

/**
 * A custom fetcher that returns the verses array from the api result.
 * We need this workaround as useSWRInfinite requires the data from the api
 * to be an array, while the result we get is formatted as {meta: {}, verses: Verse[]}
 *
 * @returns {Promise<Verse>}
 */
export const verseFetcher = async (input: RequestInfo, init?: RequestInit): Promise<Verse> => {
  const res = await fetcher<VersesResponse>(input, init);
  // @ts-ignore ignore this typing for now, we'll get back into this when we fix the "initial data not being used" issue
  return res.verses;
};

/**
 * Get the page limit by checking:
 *
 * 1. if it's tafsir data or a verse data, the limit is 1.
 * 2. otherwise, return the initial data's totalPages.
 *
 *
 * @param {boolean} isVerseData
 * @param {boolean} isTafsirData
 * @param {VersesResponse} initialData
 * @returns {number}
 */
export const getPageLimit = (
  isVerseData: boolean,
  isTafsirData: boolean,
  initialData: VersesResponse,
): number => {
  if (isVerseData || isTafsirData) {
    return 1;
  }

  return initialData.pagination.totalPages;
};
