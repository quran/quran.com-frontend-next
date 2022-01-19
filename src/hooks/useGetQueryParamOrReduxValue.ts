import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { RootState } from 'src/redux/RootState';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { isValidTranslationsQueryParamValue } from 'src/utils/queryParamValidator';
import QueryParam from 'types/QueryParam';

enum ValueType {
  String = 'String',
  ArrayOfNumbers = 'ArrayOfNumbers',
  ArrayOfStrings = 'ArrayOfStrings',
}

const QUERY_PARAMS_DATA = {
  [QueryParam.Translations]: {
    reduxSelector: selectSelectedTranslations,
    reduxEqualityFunction: areArraysEqual,
    valueType: ValueType.ArrayOfNumbers,
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
      }
      if (isValidValue) {
        // return an array of numbers instead of a string
        if (QUERY_PARAMS_DATA[queryParam].valueType === ValueType.ArrayOfNumbers) {
          setValue(paramStringValue.split(',').map((stringValue) => Number(stringValue)));
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
