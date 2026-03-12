import { ParsedUrlQuery } from 'querystring';

import { getReadingModeQueryParamValue } from '@/utils/readingPreference';
import { getQueryParamValueFromAsPath, normalizeQueryParam } from '@/utils/url';
import QueryParam from 'types/QueryParam';
import { ReadingPreference } from 'types/QuranReader';

const SCROLL_TOP_THRESHOLD = 100;

export enum SwitcherContext {
  SurahHeader = 'surah_header',
  ContextMenu = 'context_menu',
  MobileTabs = 'mobile_tabs',
}

interface GetUpdatedQueryParamsInput {
  newPreference: ReadingPreference;
  query: ParsedUrlQuery;
  asPath: string;
  context: SwitcherContext;
  lastReadVerse?: string;
  lastReadVerseKey?: string;
  selectedTranslations: number[];
  scrollY?: number;
}

const syncTranslationsQueryParam = (
  newPreference: ReadingPreference,
  query: ParsedUrlQuery,
  selectedTranslations: number[],
): ParsedUrlQuery => {
  const nextQuery = { ...query };
  if (newPreference === ReadingPreference.Reading) {
    delete nextQuery[QueryParam.TRANSLATIONS];
    return nextQuery;
  }

  if (selectedTranslations.length > 0) {
    nextQuery[QueryParam.TRANSLATIONS] = selectedTranslations.join(',');
  }

  return nextQuery;
};

export const getUpdatedQueryParams = ({
  newPreference,
  query,
  asPath,
  context,
  lastReadVerse,
  lastReadVerseKey,
  selectedTranslations,
  scrollY,
}: GetUpdatedQueryParamsInput) => {
  const previousQueryParams = { ...query };
  const currentReadingModeFromAsPath = getQueryParamValueFromAsPath(
    asPath,
    QueryParam.READING_MODE,
  );
  if (currentReadingModeFromAsPath !== undefined) {
    previousQueryParams[QueryParam.READING_MODE] = currentReadingModeFromAsPath;
  } else {
    delete previousQueryParams[QueryParam.READING_MODE];
  }

  let newQueryParams = { ...previousQueryParams };
  const isAtTop = scrollY !== undefined && scrollY <= SCROLL_TOP_THRESHOLD;

  if (context === SwitcherContext.SurahHeader || isAtTop) {
    delete newQueryParams.startingVerse;
  } else {
    const chapterId = normalizeQueryParam(query.chapterId);
    const isChapterScopedRoute = !!chapterId && !String(chapterId).includes(':');

    newQueryParams.startingVerse = isChapterScopedRoute
      ? lastReadVerse || '1'
      : lastReadVerseKey || '1:1';
  }

  newQueryParams[QueryParam.READING_MODE] = getReadingModeQueryParamValue(newPreference);
  newQueryParams = syncTranslationsQueryParam(newPreference, newQueryParams, selectedTranslations);

  return {
    previousQueryParams,
    newQueryParams,
  };
};
