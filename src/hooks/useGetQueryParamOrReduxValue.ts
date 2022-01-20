import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useSelector, shallowEqual } from 'react-redux';

import { RootState } from 'src/redux/RootState';
import { selectReciterId } from 'src/redux/slices/AudioPlayer/state';
import { selectWordByWordLocale } from 'src/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import {
  isValidReciterId,
  isValidTranslationsQueryParamValue,
} from 'src/utils/queryParamValidator';
import QueryParam from 'types/QueryParam';

enum ValueType {
  String = 'String',
  Number = 'Number',
  ArrayOfNumbers = 'ArrayOfNumbers',
  ArrayOfStrings = 'ArrayOfStrings',
}

const QUERY_PARAMS_DATA = {
  [QueryParam.Translations]: {
    reduxSelector: selectSelectedTranslations,
    reduxEqualityFunction: areArraysEqual,
    valueType: ValueType.ArrayOfNumbers,
  },
  [QueryParam.Reciter]: {
    reduxSelector: selectReciterId,
    reduxEqualityFunction: shallowEqual,
    valueType: ValueType.Number,
  },
  [QueryParam.WBW_LOCALE]: {
    reduxSelector: selectWordByWordLocale,
    reduxEqualityFunction: shallowEqual,
    valueType: ValueType.String,
  },
} as Record<
  QueryParam,
  {
    reduxSelector: (state: RootState) => unknown;
    valueType: ValueType;
    reduxEqualityFunction?: (left: unknown, right: unknown) => boolean;
  }
>;

/**
 * A hook that searches the query params of the url for specific values,
 * parses them if found and if not, falls back to the Redux value.
 *
 * @param {QueryParam} queryParam
 * @returns {unknown}
 */
const useGetQueryParamOrReduxValue = (queryParam: QueryParam): unknown => {
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
  const [value, setValue] = useState(selectedValue);
  useEffect(() => {
    // if the param exists in the url
    if (isReady && query[queryParam]) {
      const paramStringValue = String(query[queryParam]);
      let isValidValue = true;
      if (queryParam === QueryParam.Translations) {
        isValidValue = isValidTranslationsQueryParamValue(paramStringValue);
      } else if (queryParam === QueryParam.Reciter) {
        isValidValue = isValidReciterId(paramStringValue);
      }
      if (isValidValue) {
        // return an array of numbers instead of a string
        if (QUERY_PARAMS_DATA[queryParam].valueType === ValueType.ArrayOfNumbers) {
          setValue(paramStringValue.split(',').map((stringValue) => Number(stringValue)));
        } else if (QUERY_PARAMS_DATA[queryParam].valueType === ValueType.Number) {
          setValue(Number(query[queryParam]));
        } else {
          setValue(query[queryParam]);
        }
      }
    } else {
      setValue(selectedValue);
    }
  }, [isReady, query, queryParam, selectedValue]);
  return value;
};

export default useGetQueryParamOrReduxValue;
