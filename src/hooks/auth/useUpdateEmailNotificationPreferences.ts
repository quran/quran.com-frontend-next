import { useState } from 'react';

import { ChannelTypeEnum, IUserPreferenceSettings } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import { useHeadlessService } from '@/components/Notifications/hooks/useHeadlessService';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { logValueChange } from '@/utils/eventLogger';

const useUpdateEmailNotificationPreferences = () => {
  const { headlessService } = useHeadlessService();
  const toast = useToast();
  const { t } = useTranslation('common');
  const [mutatingTemplateId, setMutatingTemplateId] = useState<string | null>(null);

  const handleError = (err: unknown, templateId: string, isChecked: boolean) => {
    toast(t('error.general'), { status: ToastStatus.Error });
    logErrorToSentry(err, {
      transactionName: 'updateEmailNotificationPreferences',
      metadata: {
        templateId,
        checked: isChecked,
        channelType: ChannelTypeEnum.EMAIL,
      },
    });
  };

  const handleSuccess = (
    templateId: string,
    isChecked: boolean,
    onSuccess?: (templateId: string, isChecked: boolean) => void,
  ) => {
    toast(t('profile:success.notifications'), {
      status: ToastStatus.Success,
    });
    if (onSuccess) {
      onSuccess(templateId, isChecked);
    }
  };

  const updatePreference = (
    preference: IUserPreferenceSettings,
    isChecked: boolean,
    onSuccess?: (templateId: string, isChecked: boolean) => void,
  ) => {
    const { template } = preference;
    // eslint-disable-next-line no-underscore-dangle
    const templateId = template._id;
    setMutatingTemplateId(templateId);

    logValueChange('email_notification_settings', !isChecked, isChecked, {
      templateName: template.name,
    });

    headlessService.updateUserPreferences({
      templateId,
      checked: isChecked,
      channelType: ChannelTypeEnum.EMAIL,
      listener: ({ isLoading }) => {
        if (!isLoading) {
          setMutatingTemplateId(null);
        }
      },
      onSuccess: () => handleSuccess(templateId, isChecked, onSuccess),
      onError: (err) => handleError(err, templateId, isChecked),
    });
  };

  return { updatePreference, mutatingTemplateId };
};

export default useUpdateEmailNotificationPreferences;
