import { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';
import useMarkNotificationAsSeen from './useMarkNotificationAsSeen';

import { logErrorToSentry } from '@/lib/sentry';
import {
  selectLoadedNotificationsPages,
  selectNotificationsIsFetching,
  setNotificationsLoading,
  setNotificationsPageAndFinishLoading,
} from '@/redux/slices/notifications';
import { areArraysEqual } from '@/utils/array';

const NOTIFICATIONS_PAGE_SIZE = 10;

const useFetchNotifications = () => {
  const { headlessService, isReady } = useHeadlessService();
  const [error, setError] = useState<unknown | null>(null);
  const dispatch = useDispatch();

  const { mutate: markNotificationAsSeen } = useMarkNotificationAsSeen();
  const loadedPages = useSelector(selectLoadedNotificationsPages, areArraysEqual);
  const isFetchingNotifications = useSelector(selectNotificationsIsFetching);

  const fetchNotifications = useCallback(
    // eslint-disable-next-line react-func/max-lines-per-function
    ({
      shouldMarkAsSeenOnSuccess = true,
      page,
      shouldResetOldData = false,
    }: {
      shouldMarkAsSeenOnSuccess?: boolean;
      shouldResetOldData?: boolean;
      page: number;
    }) => {
      if (isReady) {
        if (isFetchingNotifications || loadedPages.includes(page)) {
          return;
        }

        headlessService.fetchNotifications({
          page,
          query: {
            limit: NOTIFICATIONS_PAGE_SIZE,
          },
          listener: ({ isLoading: loading, isFetching: fetching, data }) => {
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
          onError: (err) => {
            setError(err);
            logErrorToSentry(err, {
              transactionName: 'useFetchNotifications',
              metadata: {
                page,
                shouldMarkAsSeenOnSuccess,
                shouldResetOldData,
              },
            });
          },
        });
      }
    },
    [
      dispatch,
      headlessService,
      isReady,
      markNotificationAsSeen,
      loadedPages,
      isFetchingNotifications,
    ],
  );

  return { fetch: fetchNotifications, error };
};

export default useFetchNotifications;
