import React, { memo } from 'react';

import useSWRImmutable from 'swr/immutable';

import Error from '@/components/Error';
import Spinner from '@/dls/Spinner/Spinner';
import { fetcher } from 'src/api';
import { BaseResponse } from 'types/ApiResponses';

interface Props {
  queryKey: string;
  render: (data: BaseResponse) => JSX.Element;
  renderError?: (error: any) => JSX.Element | undefined;
  initialData?: BaseResponse;
  loading?: () => JSX.Element;
  fetcher?: (queryKey: string) => Promise<BaseResponse>;
  showSpinnerOnRevalidate?: boolean;
  onFetchSuccess?: (data: BaseResponse) => void;
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
  renderError,
  initialData,
  loading = () => <Spinner />,
  fetcher: dataFetcher = fetcher,
  showSpinnerOnRevalidate = true,
  onFetchSuccess,
}: Props): JSX.Element => {
  const { data, error, isValidating, mutate } = useSWRImmutable(
    queryKey,
    () =>
      dataFetcher(queryKey)
        .then((res) => {
          onFetchSuccess?.(res);
          return Promise.resolve(res);
        })
        .catch((err) => Promise.reject(err)),
    {
      fallbackData: initialData,
    },
  );

  // if showSpinnerOnRevalidate is true, we should show the spinner if we are revalidating the data.
  // otherwise, we should only show the spinner on initial loads.
  if (showSpinnerOnRevalidate ? isValidating : isValidating && !data) {
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
    // if there is a custom error renderer, use it.
    if (renderError) {
      const errorComponent = renderError(error);
      // if the custom error renderer returns false, it means that it doesn't want to render anything special.
      if (typeof errorComponent !== 'undefined') {
        return errorComponent;
      }
    }
    return <Error onRetryClicked={onRetryClicked} error={error} />;
  }

  return render(data);
};

export default memo(DataFetcher);
