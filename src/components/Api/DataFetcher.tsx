import React from 'react';

import useSWRImmutable from 'swr/immutable';

import ErrorMessage from './ErrorMessage';

import { fetcher, OFFLINE_ERROR } from 'src/api';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { BaseResponse } from 'types/ApiResponses';

interface Props {
  queryKey: string;
  render: (data: BaseResponse) => JSX.Element;
  initialData?: BaseResponse;
}

const DataFetcher: React.FC<Props> = ({ queryKey, render, initialData }) => {
  const { data, error, isValidating, mutate } = useSWRImmutable(
    queryKey,
    () =>
      fetcher(queryKey)
        .then((res) => Promise.resolve(res))
        .catch((err) => Promise.reject(err)),
    {
      fallbackData: initialData,
    },
  );

  if (isValidating) {
    return <Spinner />;
  }

  const onRetryClicked = () => {
    mutate();
  };

  /**
   * if we haven't fetched the data yet and the device is not online (because we don't want to show an offline message if the data already exists).
   * or if we had an error when calling the API.
   */
  if (error) {
    const isOffline = error.message === OFFLINE_ERROR;
    return <ErrorMessage onRetryClicked={onRetryClicked} isError={!isOffline} />;
  }

  return render(data);
};

export default DataFetcher;
