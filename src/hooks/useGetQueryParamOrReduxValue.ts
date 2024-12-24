/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';

import {
  selectBackgroundColor,
  selectBorderColor,
  selectBorderSize,
  selectFontColor,
  selectOpacity,
  selectOrientation,
  selectQuranTextFontScale,
  selectQuranTextFontStyle,
  selectReciter,
  selectSurah,
  selectSurahAndVersesFromAndTo,
  selectTranslationAlignment,
  selectTranslationFontScale,
  selectTranslations,
  selectVerseAlignment,
  selectVideoId,
} from '@/redux/slices/mediaMaker';
import { selectWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import ChaptersData from '@/types/ChaptersData';
import { areArraysEqual } from '@/utils/array';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_BORDER_COLOR,
  DEFAULT_FONT_COLOR,
  DEFAULT_RECITER_ID,
  DEFAULT_SURAH,
  DEFAULT_TRANSLATION,
  DEFAULT_VERSE,
} from '@/utils/media/constants';
import { isValidHexColor, isValidVerseToOrFrom, QueryParamsData } from '@/utils/media/utils';
import {
  getQueryParamValueByType,
  isQueryParamDifferentThanReduxValue,
  QueryParamValueType,
} from '@/utils/query-params';
import {
  isValidAlignmentQueryParamValue,
  isValidBorderSizeQueryParamValue,
  isValidFontScaleQueryParamValue,
  isValidFontStyleQueryParamValue,
  isValidOpacityQueryParamValue,
  isValidOrientationQueryParamValue,
  isValidReciterId,
  isValidTranslationsQueryParamValue,
  isValidTranslationsQueryParamValueWithExistingKey,
  isValidVideoIdQueryParamValue,
} from '@/utils/queryParamValidator';
import { isValidChapterId } from '@/utils/validator';
import QueryParam from 'types/QueryParam';

export const QUERY_PARAMS_DATA = {
  [QueryParam.TRANSLATIONS]: {
    reduxValueSelector: selectSelectedTranslations,
    reduxValueEqualityFunction: areArraysEqual,
    queryParamValueType: QueryParamValueType.ArrayOfNumbers,
    isValidQueryParam: (val) => isValidTranslationsQueryParamValue(val),
  },
  [QueryParam.MEDIA_TRANSLATIONS]: {
    reduxValueSelector: selectTranslations,
    reduxValueEqualityFunction: areArraysEqual,
    queryParamValueType: QueryParamValueType.ArrayOfNumbers,
    isValidQueryParam: (val, chaptersData, query, surahAndVersesReduxValues, extraData) =>
      isValidTranslationsQueryParamValueWithExistingKey(val, extraData),
    customValueGetterWhenParamIsInvalid: () => [DEFAULT_TRANSLATION],
  },
  [QueryParam.WBW_LOCALE]: {
    reduxValueSelector: selectWordByWordLocale,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: () => true,
  },
  [QueryParam.VERSE_TO]: {
    reduxValueSelector: selectSurahAndVersesFromAndTo,
    reduxValueEqualityFunction: shallowEqual,
    reduxObjectKey: QueryParam.VERSE_TO,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (verseToQueryParamValue: string, chaptersData: ChaptersData, query) =>
      isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, query),
    customValueGetterWhenParamIsInvalid: (surahAndVersesReduxValues: any, query) =>
      query[QueryParam.VERSE_FROM],
  },
  [QueryParam.VERSE_FROM]: {
    reduxValueSelector: selectSurahAndVersesFromAndTo,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    reduxObjectKey: QueryParam.VERSE_FROM,
    isValidQueryParam: (verseFromQueryParamValue: string, chaptersData: ChaptersData, query) =>
      isValidVerseToOrFrom(QueryParam.VERSE_FROM, chaptersData, query),
    customValueGetterWhenParamIsInvalid: () => DEFAULT_VERSE,
  },
  [QueryParam.RECITER]: {
    reduxValueSelector: selectReciter,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val, chaptersData, query, surahAndVersesReduxValues, extraData) =>
      isValidReciterId(val, extraData),
    customValueGetterWhenParamIsInvalid: () => DEFAULT_RECITER_ID,
  },
  [QueryParam.QURAN_TEXT_FONT_SCALE]: {
    reduxValueSelector: selectQuranTextFontScale,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val) => isValidFontScaleQueryParamValue(val),
  },
  [QueryParam.TRANSLATION_FONT_SCALE]: {
    reduxValueSelector: selectTranslationFontScale,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val) => isValidFontScaleQueryParamValue(val),
  },
  [QueryParam.QURAN_TEXT_FONT_STYLE]: {
    reduxValueSelector: selectQuranTextFontStyle,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val) => isValidFontStyleQueryParamValue(val),
  },
  [QueryParam.VERSE_ALIGNMENT]: {
    reduxValueSelector: selectVerseAlignment,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val) => isValidAlignmentQueryParamValue(val),
  },
  [QueryParam.TRANSLATION_ALIGNMENT]: {
    reduxValueSelector: selectTranslationAlignment,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val) => isValidAlignmentQueryParamValue(val),
  },
  [QueryParam.ORIENTATION]: {
    reduxValueSelector: selectOrientation,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val) => isValidOrientationQueryParamValue(val),
  },
  [QueryParam.SURAH]: {
    reduxValueSelector: selectSurah,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val) => isValidChapterId(val),
    customValueGetterWhenParamIsInvalid: () => DEFAULT_SURAH,
  },
  [QueryParam.OPACITY]: {
    reduxValueSelector: selectOpacity,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val) => isValidOpacityQueryParamValue(val),
  },
  [QueryParam.FONT_COLOR]: {
    reduxValueSelector: selectFontColor,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val) => isValidHexColor(val),
    customValueGetterWhenParamIsInvalid: () => DEFAULT_FONT_COLOR,
  },
  [QueryParam.BACKGROUND_COLOR]: {
    reduxValueSelector: selectBackgroundColor,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val) => isValidHexColor(val),
    customValueGetterWhenParamIsInvalid: () => DEFAULT_BACKGROUND_COLOR,
  },
  [QueryParam.BORDER_COLOR]: {
    reduxValueSelector: selectBorderColor,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val) => isValidHexColor(val),
    customValueGetterWhenParamIsInvalid: () => DEFAULT_BORDER_COLOR,
  },
  [QueryParam.BORDER_SIZE]: {
    reduxValueSelector: selectBorderSize,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val) => isValidBorderSizeQueryParamValue(val),
  },
  [QueryParam.VIDEO_ID]: {
    reduxValueSelector: selectVideoId,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val) => isValidVideoIdQueryParamValue(val),
  },
} as QueryParamsData;

export const getQueryParamsData = () => {
  return QUERY_PARAMS_DATA;
};

/**
 * A hook that searches the query params of the url for specific values,
 * parses them if found and if not, falls back to the Redux value and detects
 * when there is a mismatch between the query param value and the Redux value.
 *
 * @param {QueryParam} queryParam
 * @returns {{value: any, isQueryParamDifferent: boolean}}
 */
const useGetQueryParamOrReduxValue = (
  queryParam: QueryParam,
  chaptersData?: ChaptersData,
  extraData?: any,
): { value: any; isQueryParamDifferent: boolean } => {
  const { query, isReady } = useRouter();

  // either pass the redux selector or the redux selector and the equality function as well
  let reduxValueSelectorWithOrWithoutEqualityFunction = [
    QUERY_PARAMS_DATA[queryParam].reduxValueSelector,
  ];
  if (QUERY_PARAMS_DATA[queryParam].reduxValueEqualityFunction) {
    reduxValueSelectorWithOrWithoutEqualityFunction = [
      QUERY_PARAMS_DATA[queryParam].reduxValueSelector,
      // @ts-ignore
      QUERY_PARAMS_DATA[queryParam].reduxValueEqualityFunction,
    ];
  }
  const reduxSelectorValueOrValues = useSelector(
    // @ts-ignore
    ...reduxValueSelectorWithOrWithoutEqualityFunction,
  );
  const {
    queryParamValueType,
    isValidQueryParam,
    reduxObjectKey,
    customValueGetterWhenParamIsInvalid,
  } = QUERY_PARAMS_DATA[queryParam];
  const reduxParamValue = reduxObjectKey
    ? reduxSelectorValueOrValues[reduxObjectKey]
    : reduxSelectorValueOrValues;
  // if the param exists in the url
  if (isReady && query[queryParam] !== undefined) {
    const queryParamStringValue = String(query[queryParam]);
    const isQueryParamDifferent = isQueryParamDifferentThanReduxValue(
      queryParamStringValue,
      queryParamValueType,
      reduxParamValue,
    );

    const isValidValue = isValidQueryParam(
      queryParamStringValue,
      chaptersData,
      query,
      reduxSelectorValueOrValues,
      extraData,
    );
    const parsedQueryParamValue = getQueryParamValueByType(
      queryParamStringValue,
      queryParamValueType,
    );

    // if the url param is not valid, return the redux value
    if (!isValidValue) {
      if (customValueGetterWhenParamIsInvalid) {
        return {
          isQueryParamDifferent: false,
          value: customValueGetterWhenParamIsInvalid(reduxSelectorValueOrValues, query),
        };
      }
      return { isQueryParamDifferent: false, value: reduxParamValue };
    }

    return {
      value: parsedQueryParamValue,
      isQueryParamDifferent,
    };
  }

  return {
    value: reduxParamValue,
    isQueryParamDifferent: false,
  };
};

export default useGetQueryParamOrReduxValue;
