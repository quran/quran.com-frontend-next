/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useSelector, shallowEqual } from 'react-redux';

import { RootState } from 'src/redux/RootState';
import { selectWordByWordLocale } from 'src/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import {
  equalityCheckerByType,
  getQueryParamValueByType,
  QueryParamValueType,
} from 'src/utils/query-params';
import { isValidTranslationsQueryParamValue } from 'src/utils/queryParamValidator';
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate: (val) => true,
  },
} as Record<
  QueryParam,
  {
    reduxSelector: (state: RootState) => any;
    valueType: QueryParamValueType;
    reduxEqualityFunction?: (left: any, right: any) => boolean;
    validate: (val: any) => boolean;
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
  const [valueDetails, setValueDetails] = useState({
    value: selectedValue,
    isQueryParamDifferent: false,
  });

  useEffect(() => {
    // if the param exists in the url
    if (isReady && query[queryParam]) {
      const { validate, valueType } = QUERY_PARAMS_DATA[queryParam];

      const paramStringValue = String(query[queryParam]);
      const isValidValue = validate(paramStringValue);
      if (!isValidValue) {
        setValueDetails({ isQueryParamDifferent: false, value: selectedValue });
        return;
      }

      const parsedQueryParamValue = getQueryParamValueByType(paramStringValue, valueType);
      const checkEquality = equalityCheckerByType[valueType];
      const isQueryParamDifferent = checkEquality(parsedQueryParamValue, selectedValue);

      setValueDetails({
        value: parsedQueryParamValue,
        isQueryParamDifferent,
      });
    }
  }, [isReady, query, queryParam, selectedValue]);
  return valueDetails;
};

export default useGetQueryParamOrReduxValue;
