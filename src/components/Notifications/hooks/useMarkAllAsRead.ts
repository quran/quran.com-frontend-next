import { useState } from 'react';

import { IFeedId } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
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
      listener: ({ isLoading }) => {
        setIsMutating(isLoading);
      },
      onSuccess: () => {
        setError(null);

        // manually set all notifications to read instead of calling the API again
        dispatch({ type: setAllAsRead.type });
      },
      onError: (err) => {
        setError(err);
        toast(t('error.general'), { status: ToastStatus.Error });
        logErrorToSentry(err, { transactionName: 'useMarkAllAsRead', metadata: { feedId } });
      },
      feedId, // Pass the feed ID here, it can be an array or a single ID
    });
  };

  return { mutate: markAllMessagesAsRead, isMutating, error };
};

export default useMarkAllAsRead;
