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
  getIsQueryParamDifferent,
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
    reduxSelector: selectSelectedTranslations,
    reduxEqualityFunction: areArraysEqual,
    valueType: QueryParamValueType.ArrayOfNumbers,
    validate: (val) => isValidTranslationsQueryParamValue(val),
  },
  [QueryParam.WBW_LOCALE]: {
    reduxSelector: selectWordByWordLocale,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: () => true,
  },
  [QueryParam.VERSE_TO]: {
    reduxSelector: selectVerseTo,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val, chaptersData) => isValidVerseKey(chaptersData, val),
    customHandler: (query, queryParam, chaptersData, surahReduxValue) => {
      return getVerseValue(query, queryParam, chaptersData, QUERY_PARAMS_DATA, surahReduxValue);
    },
  },
  [QueryParam.VERSE_FROM]: {
    reduxSelector: selectVerseFrom,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val, chaptersData) => isValidVerseKey(chaptersData, val),
    customHandler: (query, queryParam, chaptersData, surahReduxValue) => {
      return getVerseValue(query, queryParam, chaptersData, QUERY_PARAMS_DATA, surahReduxValue);
    },
  },
  [QueryParam.RECITER]: {
    reduxSelector: selectReciter,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidReciterId(val),
  },
  [QueryParam.QURAN_TEXT_FONT_SCALE]: {
    reduxSelector: selectQuranTextFontScale,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidFontScaleQueryParamValue(val),
  },
  [QueryParam.TRANSLATION_FONT_SCALE]: {
    reduxSelector: selectTranslationFontScale,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidFontScaleQueryParamValue(val),
  },
  [QueryParam.QURAN_TEXT_FONT_STYLE]: {
    reduxSelector: selectQuranTextFontStyle,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val) => isValidFontStyleQueryParamValue(val),
  },
  [QueryParam.VERSE_ALIGNMENT]: {
    reduxSelector: selectVerseAlignment,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val) => isValidAlignmentQueryParamValue(val),
  },
  [QueryParam.TRANSLATION_ALIGNMENT]: {
    reduxSelector: selectTranslationAlignment,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val) => isValidAlignmentQueryParamValue(val),
  },
  [QueryParam.ORIENTATION]: {
    reduxSelector: selectOrientation,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val) => isValidOrientationQueryParamValue(val),
  },
  [QueryParam.SURAH]: {
    reduxSelector: selectSurah,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidChapterId(val),
  },
  [QueryParam.OPACITY]: {
    reduxSelector: selectOpacity,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidOpacityQueryParamValue(val),
  },
  [QueryParam.FONT_COLOR]: {
    reduxSelector: selectFontColor,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: () => true,
  },
  [QueryParam.BACKGROUND_COLOR]: {
    reduxSelector: selectBackgroundColor,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: () => true,
  },
  [QueryParam.BORDER_COLOR]: {
    reduxSelector: selectBorderColor,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: () => true,
  },
  [QueryParam.BORDER_SIZE]: {
    reduxSelector: selectBorderSize,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidBorderSizeQueryParamValue(val),
  },
  [QueryParam.VIDEO_ID]: {
    reduxSelector: selectVideoId,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidVideoIdQueryParamValue(val),
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

  let useSelectorArguments = [QUERY_PARAMS_DATA[queryParam].reduxSelector];
  if (QUERY_PARAMS_DATA[queryParam].reduxEqualityFunction) {
    useSelectorArguments = [
      QUERY_PARAMS_DATA[queryParam].reduxSelector,
      // @ts-ignore
      QUERY_PARAMS_DATA[queryParam].reduxEqualityFunction,
    ];
  }
  // @ts-ignore
  const reduxValue = useSelector(...useSelectorArguments);
  const surahReduxValue = useSelector(
    QUERY_PARAMS_DATA[QueryParam.SURAH].reduxSelector,
    QUERY_PARAMS_DATA[QueryParam.SURAH].reduxEqualityFunction,
  );
  // if the param exists in the url
  if (isReady && query[queryParam] !== undefined) {
    const { valueType, validate, customHandler } = QUERY_PARAMS_DATA[queryParam];
    const paramStringValue = String(query[queryParam]);
    const isQueryParamDifferent = getIsQueryParamDifferent(paramStringValue, valueType, reduxValue);

    if (customHandler) {
      return {
        value: customHandler(query, queryParam, chaptersData, surahReduxValue),
        isQueryParamDifferent,
      };
    }

    const isValidValue = validate(paramStringValue, chaptersData, query);
    const parsedQueryParamValue = getQueryParamValueByType(paramStringValue, valueType);

    // if the url param is not valid, return the redux value
    if (!isValidValue) {
      return { isQueryParamDifferent: false, value: reduxValue };
    }

    return {
      value: parsedQueryParamValue,
      isQueryParamDifferent,
    };
  }

  return {
    value: reduxValue,
    isQueryParamDifferent: false,
  };
};

export default useGetQueryParamOrReduxValue;
