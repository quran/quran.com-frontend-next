import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { setNotificationAsRead } from '@/redux/slices/notifications';

const useMarkNotificationAsRead = () => {
  const { headlessService, isReady } = useHeadlessService();
  const dispatch = useDispatch();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { t } = useTranslation('common');
  const toast = useToast();

  const markNotificationsAsRead = useCallback(
    (messageId: string) => {
      if (isReady) {
        headlessService.markNotificationsAsRead({
          messageId,
          listener: ({ isLoading }) => {
            setIsMutating(isLoading);
          },
          onSuccess: () => {
            setError(null);

            // manually update the read state of the notification instead of calling the API again
            dispatch({ type: setNotificationAsRead.type, payload: { messageId } });
          },
          onError: (err) => {
            setError(err);
            toast(t('error.general'), { status: ToastStatus.Error });
            logErrorToSentry(err, {
              transactionName: 'useMarkNotificationAsRead',
              metadata: { messageId },
            });
          },
        });
      }
    },
    [headlessService, isReady, dispatch, t, toast],
  );

  return { isMutating, error, mutate: markNotificationsAsRead };
};

export default useMarkNotificationAsRead;
