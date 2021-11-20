import React, { memo } from 'react';

import useSWRImmutable from 'swr/immutable';

import { fetcher } from 'src/api';
import Spinner from 'src/components/dls/Spinner/Spinner';
import Error from 'src/components/Error';
import { BaseResponse } from 'types/ApiResponses';

interface Props {
  queryKey: string;
  render: (data: BaseResponse) => JSX.Element;
  initialData?: BaseResponse;
  loading?: () => JSX.Element;
}

/**
 * Data fetcher is a dynamic component that serves as a container for a component
 * that depends on data from a remote API to render. This component handles:
 * 1. Calling the API.
 * 2. Caching the response (due to using useSwr).
 * 3. Handling errors if any by showing an error message.
 * 4. Handling when the user is offline while trying to fetch the API response.
 * 5. Dynamically passing the response data through render-props to the parent.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const DataFetcher: React.FC<Props> = ({
  queryKey,
  render,
  initialData,
  loading = () => <Spinner />,
}: Props): JSX.Element => {
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
    return loading();
  }

  const onRetryClicked = () => {
    mutate();
  };

  /**
   * if we haven't fetched the data yet and the device is not online (because we don't want to show an offline message if the data already exists).
   * or if we had an error when calling the API.
   */
  if (error) {
    return <Error onRetryClicked={onRetryClicked} error={error} />;
  }

  return render(data);
};

export default memo(DataFetcher);
