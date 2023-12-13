import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { setDeleteNotification } from '@/redux/slices/notifications';

const useDeleteNotification = () => {
  const { headlessService, isReady } = useHeadlessService();
  const dispatch = useDispatch();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { t } = useTranslation('common');
  const toast = useToast();

  const deleteNotification = useCallback(
    (messageId: string) => {
      if (isReady) {
        headlessService.removeNotification({
          messageId,
          listener: ({ isLoading }) => {
            setIsMutating(isLoading);
          },
          onSuccess: () => {
            setError(null);
            dispatch({ type: setDeleteNotification.type, payload: { messageId } });
          },
          onError: (err) => {
            setError(err);
            toast(t('error.general'), { status: ToastStatus.Error });
            logErrorToSentry(err, {
              transactionName: 'useDeleteNotification',
              metadata: { messageId },
            });
          },
        });
      }
    },
    [headlessService, isReady, dispatch, t, toast],
  );

  return { mutate: deleteNotification, isMutating, error };
};

export default useDeleteNotification;
