import { useState } from 'react';

import { IUpdateUserPreferencesVariables } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import { useHeadlessService } from './useHeadlessService';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';

const useUpdateUserPreferences = (templateId: string) => {
  const { headlessService } = useHeadlessService();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { t } = useTranslation('common');
  const toast = useToast();

  const updateUserPreferences = (
    enabled: IUpdateUserPreferencesVariables['checked'],
    channel: IUpdateUserPreferencesVariables['channelType'],
    onSuccess?: () => void,
  ) => {
    headlessService.updateUserPreferences({
      templateId,
      checked: enabled,
      channelType: channel,
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
          transactionName: 'updateUserPreferences',
          metadata: {
            templateId,
            checked: enabled,
            channelType: channel,
          },
        });
      },
    });
  };

  return { mutate: updateUserPreferences, isMutating, error };
};

export default useUpdateUserPreferences;
