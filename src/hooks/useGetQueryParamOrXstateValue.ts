/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import { useRouter } from 'next/router';

import {
  equalityCheckerByType,
  getQueryParamValueByType,
  QueryParamValueType,
} from 'src/utils/query-params';
import { isValidReciterId } from 'src/utils/queryParamValidator';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import QueryParam from 'types/QueryParam';

const QUERY_PARAMS_DATA = {
  [QueryParam.Reciter]: {
    selector: (state: any) => state.context.reciterId,
    valueType: QueryParamValueType.Number,
    validate: isValidReciterId,
  },
} as Record<
  QueryParam,
  {
    selector: (state) => any;
    valueType: QueryParamValueType;
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
const useGetQueryParamOrXstateValue = (
  queryParam: QueryParam,
): { value: any; isQueryParamDifferent: boolean } => {
  const { query, isReady } = useRouter();
  const audioService = useContext(AudioPlayerMachineContext);
  const { selector } = QUERY_PARAMS_DATA[queryParam];

  const selectedValue = useXstateSelector(audioService, selector);
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

export default useGetQueryParamOrXstateValue;
