import { useCallback, useMemo, useState } from 'react';

import { IUserGlobalPreferenceSettings, IUserPreferenceSettings } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import { useHeadlessService } from '@/components/Notifications/hooks/useHeadlessService';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';

const useFetchUserPreferences = () => {
  const { headlessService, isReady, status } = useHeadlessService();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { t } = useTranslation('common');
  const toast = useToast();
  const [userPreferences, setUserPreferences] = useState<
    IUserPreferenceSettings[] | IUserGlobalPreferenceSettings[]
  >(null);

  const handlers = useMemo(
    () => ({
      listener: ({ isLoading }) => {
        setIsMutating(isLoading);
      },
      onSuccess: (response) => {
        setError(null);
        setUserPreferences(response);
      },
      onError: (err) => {
        setError(err);
        toast(t('error.general'), { status: ToastStatus.Error });
        logErrorToSentry(err, {
          transactionName: 'useFetchUserPreferences',
        });
      },
    }),
    [t, toast],
  );

  const fetchGetUserPreferences = useCallback(
    (fetchGlobalSettings = false) => {
      if (isReady) {
        if (fetchGlobalSettings) {
          headlessService.fetchUserGlobalPreferences(handlers);
        } else {
          headlessService.fetchUserPreferences(handlers);
        }
      }
    },
    [handlers, headlessService, isReady],
  );

  return {
    mutate: fetchGetUserPreferences,
    isMutating,
    error,
    userPreferences,
    status,
  };
};

export default useFetchUserPreferences;
