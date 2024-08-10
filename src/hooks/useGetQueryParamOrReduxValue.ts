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
  selectTranslationAlignment,
  selectTranslationFontScale,
  selectVerseAlignment,
  selectVerseFrom,
  selectVerseTo,
  selectVideoId,
} from '@/redux/slices/mediaMaker';
import { selectWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import ChaptersData from '@/types/ChaptersData';
import { areArraysEqual } from '@/utils/array';
import { getVerseValue, QueryParamsData } from '@/utils/media/utils';
import {
  isQueryParamDifferentThanReduxValue,
  getQueryParamValueByType,
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
  isValidVideoIdQueryParamValue,
} from '@/utils/queryParamValidator';
import { isValidChapterId, isValidVerseKey } from '@/utils/validator';
import QueryParam from 'types/QueryParam';

export const QUERY_PARAMS_DATA = {
  [QueryParam.TRANSLATIONS]: {
    reduxValueSelector: selectSelectedTranslations,
    reduxValueEqualityFunction: areArraysEqual,
    queryParamValueType: QueryParamValueType.ArrayOfNumbers,
    isValidQueryParam: (val) => isValidTranslationsQueryParamValue(val),
  },
  [QueryParam.WBW_LOCALE]: {
    reduxValueSelector: selectWordByWordLocale,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: () => true,
  },
  [QueryParam.VERSE_TO]: {
    reduxValueSelector: selectVerseTo,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val, chaptersData) => isValidVerseKey(chaptersData, val),
    paramValueGetter: (query, queryParam, chaptersData, surahReduxValue) => {
      return getVerseValue(query, queryParam, chaptersData, QUERY_PARAMS_DATA, surahReduxValue);
    },
  },
  [QueryParam.VERSE_FROM]: {
    reduxValueSelector: selectVerseFrom,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: (val, chaptersData) => isValidVerseKey(chaptersData, val),
    paramValueGetter: (query, queryParam, chaptersData, surahReduxValue) => {
      return getVerseValue(query, queryParam, chaptersData, QUERY_PARAMS_DATA, surahReduxValue);
    },
  },
  [QueryParam.RECITER]: {
    reduxValueSelector: selectReciter,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.Number,
    isValidQueryParam: (val) => isValidReciterId(val),
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
    isValidQueryParam: () => true,
  },
  [QueryParam.BACKGROUND_COLOR]: {
    reduxValueSelector: selectBackgroundColor,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: () => true,
  },
  [QueryParam.BORDER_COLOR]: {
    reduxValueSelector: selectBorderColor,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: () => true,
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
  // @ts-ignore
  const paramReduxValue = useSelector(...reduxValueSelectorWithOrWithoutEqualityFunction);
  const surahReduxValue = useSelector(
    QUERY_PARAMS_DATA[QueryParam.SURAH].reduxValueSelector,
    QUERY_PARAMS_DATA[QueryParam.SURAH].reduxValueEqualityFunction,
  );
  // if the param exists in the url
  if (isReady && query[queryParam] !== undefined) {
    const { queryParamValueType, isValidQueryParam, paramValueGetter } =
      QUERY_PARAMS_DATA[queryParam];
    const queryParamStringValue = String(query[queryParam]);
    const isQueryParamDifferent = isQueryParamDifferentThanReduxValue(
      queryParamStringValue,
      queryParamValueType,
      paramReduxValue,
    );

    if (paramValueGetter) {
      return {
        value: paramValueGetter(query, queryParam, chaptersData, surahReduxValue),
        isQueryParamDifferent,
      };
    }

    const isValidValue = isValidQueryParam(queryParamStringValue, chaptersData, query);
    const parsedQueryParamValue = getQueryParamValueByType(
      queryParamStringValue,
      queryParamValueType,
    );

    // if the url param is not valid, return the redux value
    if (!isValidValue) {
      return { isQueryParamDifferent: false, value: paramReduxValue };
    }

    return {
      value: parsedQueryParamValue,
      isQueryParamDifferent,
    };
  }

  return {
    value: paramReduxValue,
    isQueryParamDifferent: false,
  };
};

export default useGetQueryParamOrReduxValue;
