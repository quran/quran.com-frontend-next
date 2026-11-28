/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import { makeAvailableRecitersUrl } from '@/utils/apiPaths';
import {
  equalityCheckerByType,
  getQueryParamValueByType,
  QueryParamValueType,
} from '@/utils/query-params';
import { isValidReciterId } from '@/utils/queryParamValidator';
import { fetcher } from 'src/api';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { RecitersResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';

const QUERY_PARAMS_DATA = {
  [QueryParam.RECITER]: {
    selector: (state: any) => state.context.reciterId,
    valueType: QueryParamValueType.Number,
    validate: isValidReciterId,
  },
} as Record<
  QueryParam,
  {
    selector: (state) => any;
    valueType: QueryParamValueType;
    validate: (val: any, extraData?: any) => boolean;
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
  const { lang } = useTranslation();
  const audioService = useContext(AudioPlayerMachineContext);
  const { selector } = QUERY_PARAMS_DATA[queryParam];

  const selectedValue = useXstateSelector(audioService, selector);
  const defaultValueDetails = {
    value: selectedValue,
    isQueryParamDifferent: false,
  };

  // the reciter id is validated against the list of available reciters, so the
  // list is needed before the param can be accepted. The key is null unless the
  // param is actually in the url, which keeps the request off every other page,
  // and it is the same key the reciter menu uses so both share one response.
  const needsReciters = isReady && queryParam === QueryParam.RECITER && !!query[queryParam];
  const { data: recitersData } = useSWRImmutable<RecitersResponse>(
    needsReciters ? makeAvailableRecitersUrl(lang) : null,
    () => fetcher(makeAvailableRecitersUrl(lang)),
  );

  // if the param exists in the url
  if (isReady && query[queryParam]) {
    const { validate, valueType } = QUERY_PARAMS_DATA[queryParam];

    const paramStringValue = String(query[queryParam]);
    const isValidValue = validate(paramStringValue, recitersData?.reciters);
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
  return defaultValueDetails;
};

export default useGetQueryParamOrXstateValue;
