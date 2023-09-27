import { useState } from 'react';

import { IFeedId } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { setAllAsRead } from '@/redux/slices/notifications';

const useMarkAllAsRead = () => {
  const { headlessService } = useHeadlessService();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const toast = useToast();

  const markAllMessagesAsRead = (feedId?: IFeedId) => {
    headlessService.markAllMessagesAsRead({
      listener: ({ isLoading, isError, error: err }) => {
        setIsMutating(isLoading);

        if (isError) {
          setError(err);
        }
      },
      onSuccess: () => {
        setError(null);

        // manually set all notifications to read instead of calling the API again
        dispatch({ type: setAllAsRead.type });
      },
      onError: () => {
        toast(t('error.general'), { status: ToastStatus.Error });
      },
      feedId, // Pass the feed ID here, it can be an array or a single ID
    });
  };

  return { mutate: markAllMessagesAsRead, isMutating, error };
};

export default useMarkAllAsRead;
