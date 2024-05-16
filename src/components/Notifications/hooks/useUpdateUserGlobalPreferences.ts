import { useState } from 'react';

import { IUpdateUserGlobalPreferencesVariables } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import { useHeadlessService } from './useHeadlessService';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';

const useUpdateUserGlobalPreferences = () => {
  const { headlessService } = useHeadlessService();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { t } = useTranslation('common');
  const toast = useToast();

  const updateUserGlobalPreferences = (
    enabled?: IUpdateUserGlobalPreferencesVariables['enabled'],
    preferences?: IUpdateUserGlobalPreferencesVariables['preferences'],
    onSuccess?: () => void,
  ) => {
    headlessService.updateUserGlobalPreferences({
      enabled,
      preferences: preferences || [],
      listener: ({ isLoading }) => {
        setIsMutating(isLoading);
      },
      onSuccess: () => {
        setError(null);
        toast(t('notification-settings:notif-update-success'), { status: ToastStatus.Success });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (err) => {
        setError(err);
        toast(t('error.general'), { status: ToastStatus.Error });
        logErrorToSentry(err, {
          transactionName: 'useUpdateUserGlobalSettings',
          metadata: { enabled, preferences },
        });
      },
    });
  };

  return { mutate: updateUserGlobalPreferences, isMutating, error };
};

export default useUpdateUserGlobalPreferences;
