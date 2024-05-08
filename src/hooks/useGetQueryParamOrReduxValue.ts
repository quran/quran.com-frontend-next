/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/router';
import { useSelector, shallowEqual } from 'react-redux';

import { RootState } from '@/redux/RootState';
import {
  selectBackgroundColorId,
  selectFontColor,
  selectOpacity,
  selectOrientation,
  selectQuranTextFontScale,
  selectReciter,
  selectShouldHaveBorder,
  selectSurah,
  selectTranslationAlignment,
  selectTranslationFontScale,
  selectTranslations,
  selectVerseAlignment,
  selectVerseFrom,
  selectVerseTo,
  selectVideoId,
} from '@/redux/slices/mediaMaker';
import { selectWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import ChaptersData from '@/types/ChaptersData';
import { areArraysEqual } from '@/utils/array';
import {
  equalityCheckerByType,
  getQueryParamValueByType,
  QueryParamValueType,
} from '@/utils/query-params';
import {
  isValidAlignmentQueryParamValue,
  isValidBackgroundColorIdQueryParamValue,
  isValidBooleanQueryParamValue,
  isValidFontScaleQueryParamValue,
  isValidOpacityQueryParamValue,
  isValidOrientationQueryParamValue,
  isValidReciterId,
  isValidTranslationsQueryParamValue,
  isValidVideoIdQueryParamValue,
} from '@/utils/queryParamValidator';
import { isValidVerseKey, isValidChapterId } from '@/utils/validator';
import QueryParam from 'types/QueryParam';

const QUERY_PARAMS_DATA = {
  [QueryParam.Translations]: {
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
  },
  [QueryParam.VERSE_FROM]: {
    reduxSelector: selectVerseFrom,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val, chaptersData) => isValidVerseKey(chaptersData, val),
  },
  [QueryParam.MEDIA_TRANSLATIONS]: {
    reduxSelector: selectTranslations,
    reduxEqualityFunction: areArraysEqual,
    valueType: QueryParamValueType.ArrayOfNumbers,
    validate: (val) => isValidTranslationsQueryParamValue(val),
  },
  [QueryParam.SHOULD_HAVE_BORDER]: {
    reduxSelector: selectShouldHaveBorder,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    validate: (val) => isValidBooleanQueryParamValue(val),
  },
  [QueryParam.BACKGROUND_COLOR_ID]: {
    reduxSelector: selectBackgroundColorId,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidBackgroundColorIdQueryParamValue(val),
  },
  [QueryParam.MEDIA_RECITER]: {
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
    valueType: QueryParamValueType.String,
    validate: (val) => isValidOpacityQueryParamValue(val),
  },
  [QueryParam.FONT_COLOR]: {
    reduxSelector: selectFontColor,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.String,
    // TODO: here
    validate: () => true,
  },
  [QueryParam.VIDEO_ID]: {
    reduxSelector: selectVideoId,
    reduxEqualityFunction: shallowEqual,
    valueType: QueryParamValueType.Number,
    validate: (val) => isValidVideoIdQueryParamValue(val),
  },
} as Record<
  QueryParam,
  {
    reduxSelector: (state: RootState) => any;
    valueType: QueryParamValueType;
    reduxEqualityFunction?: (left: any, right: any) => boolean;
    validate: (val?: any, chaptersData?: ChaptersData) => boolean;
  }
>;

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
  const selectedValue = useSelector(...useSelectorArguments);
  const valueDetails = {
    value: selectedValue,
    isQueryParamDifferent: false,
  };

  // TODO: this bit is identical to the one in useGetQueryParamOrXstateValue.ts, keep it DRY
  // if the param exists in the url
  if (isReady && query[queryParam]) {
    const { validate, valueType } = QUERY_PARAMS_DATA[queryParam];

    const paramStringValue = String(query[queryParam]);
    const isValidValue = validate(paramStringValue, chaptersData);
    if (!isValidValue) {
      return { isQueryParamDifferent: false, value: selectedValue };
    }

    const parsedQueryParamValue = getQueryParamValueByType(paramStringValue, valueType);
    const checkEquality = equalityCheckerByType[valueType];
    const isQueryParamDifferent = !checkEquality(parsedQueryParamValue, selectedValue);

    return {
      value: parsedQueryParamValue,
      isQueryParamDifferent,
    };
  }

  return valueDetails;
};

export default useGetQueryParamOrReduxValue;
