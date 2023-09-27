import { useCallback, useState } from 'react';

import { useDispatch } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';
import useMarkNotificationAsSeen from './useMarkNotificationAsSeen';

import {
  setNotificationsLoading,
  setNotificationsPageAndFinishLoading,
} from '@/redux/slices/notifications';

const useFetchNotifications = () => {
  const { headlessService, isReady } = useHeadlessService();

  // const [pageNumber, setPageNumber] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const dispatch = useDispatch();

  const { mutate: markNotificationAsSeen } = useMarkNotificationAsSeen();

  const fetchNotifications = useCallback(
    // eslint-disable-next-line react-func/max-lines-per-function
    ({
      shouldMarkAsSeenOnSuccess = true,
      page: forcedPage,
      shouldResetOldData = false,
    }: {
      shouldMarkAsSeenOnSuccess?: boolean;
      shouldResetOldData?: boolean;
      page: number;
    }) => {
      if (isReady) {
        headlessService.fetchNotifications({
          page: forcedPage, // page number to be fetched
          query: {
            limit: 10,
          },
          listener: ({ isLoading: loading, isFetching: fetching, data, error: err, isError }) => {
            if (data) {
              dispatch({
                type: setNotificationsPageAndFinishLoading.type,
                payload: {
                  page: data.page,
                  data,
                  shouldResetOldData,
                },
              });
            } else {
              dispatch({
                type: setNotificationsLoading.type,
                payload: {
                  isLoading: loading,
                  isFetching: fetching,
                  shouldResetOldData,
                },
              });
            }

            if (isError) {
              setError(err);
            }
          },
          onSuccess: (response) => {
            setError(null);
            if (shouldMarkAsSeenOnSuccess) {
              const messageIds = response.data.map((message) => {
                // eslint-disable-next-line no-underscore-dangle
                return message._id;
              });
              markNotificationAsSeen(messageIds);
            }
          },
        });
      }
    },
    [dispatch, headlessService, isReady, markNotificationAsSeen],
  );

  return { fetch: fetchNotifications, error };
};

export default useFetchNotifications;
