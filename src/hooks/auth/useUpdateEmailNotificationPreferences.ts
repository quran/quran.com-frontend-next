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
  ): Promise<void> => {
    const { template } = preference;
    // eslint-disable-next-line no-underscore-dangle
    const templateId = template._id;

    logValueChange('email_notification_settings', !isChecked, isChecked, {
      templateName: template.name,
    });

    return new Promise<void>((resolve, reject) => {
      headlessService.updateUserPreferences({
        templateId,
        checked: isChecked,
        channelType: ChannelTypeEnum.EMAIL,
        listener: () => {},
        onSuccess: () => {
          handleSuccess(templateId, isChecked, onSuccess);
          resolve();
        },
        onError: (err) => {
          handleError(err, templateId, isChecked);
          reject(err);
        },
      });
    });
  };

  return { updatePreference };
};

export default useUpdateEmailNotificationPreferences;
