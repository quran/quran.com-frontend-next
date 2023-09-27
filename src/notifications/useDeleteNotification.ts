import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
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
          listener: ({ isLoading, isError, error: err }) => {
            setIsMutating(isLoading);

            if (isError) {
              setError(err);
            }
          },
          onSuccess: () => {
            setError(null);
            dispatch({ type: setDeleteNotification.type, payload: { messageId } });
          },
          onError: () => {
            toast(t('error.general'), { status: ToastStatus.Error });
          },
        });
      }
    },
    [headlessService, isReady, dispatch, t, toast],
  );

  return { mutate: deleteNotification, isMutating, error };
};

export default useDeleteNotification;
