import { useState } from 'react';

import { ChannelTypeEnum, IUserPreferenceSettings } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import { useHeadlessService } from '@/components/Notifications/hooks/useHeadlessService';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { addSentryBreadcrumb, logErrorToSentry } from '@/lib/sentry';
import { logValueChange } from '@/utils/eventLogger';

interface UseUpdateEmailNotificationPreferencesReturn {
  updatePreference: (
    preference: IUserPreferenceSettings,
    isChecked: boolean,
    onSuccess?: (templateId: string, isChecked: boolean) => void,
  ) => void;
  mutatingTemplateId: string | null;
}

const enum NotificationPreferencesTelemetry {
  TransactionName = 'updateEmailNotificationPreferences',
  BreadcrumbCategory = 'email-notification-preferences.update',
}

/**
 * Custom hook for updating user email notification preferences via Novu
 * Handles the preference update logic, loading states, event logging, and toast notifications
 * @returns {UseUpdateEmailNotificationPreferencesReturn} Object containing:
 *   - updatePreference: Function to update a specific email notification preference.
 *     Accepts three parameters:
 *     - preference: IUserPreferenceSettings - Novu user preference settings object containing template information
 *     - isChecked: boolean - Whether the notification should be enabled (true) or disabled (false)
 *     - onSuccess?: (templateId: string, isChecked: boolean) => void - Optional callback executed after successful update
 *     The function logs the preference change, updates via Novu headless service, shows toast notifications,
 *     and handles errors by logging to Sentry
 *   - mutatingTemplateId: string | null - ID of the notification template currently being updated, or null if no update is in progress.
 *     Used to show loading states in the UI for the specific preference being modified
 */
const useUpdateEmailNotificationPreferences = (): UseUpdateEmailNotificationPreferencesReturn => {
  const { headlessService } = useHeadlessService();
  const toast = useToast();
  const { t } = useTranslation('common');
  const [mutatingTemplateId, setMutatingTemplateId] = useState<string | null>(null);

  const handleError = (
    err: unknown,
    templateId: string,
    isChecked: boolean,
    templateName: string,
  ) => {
    toast(t('error.general'), { status: ToastStatus.Error });
    logErrorToSentry(err, {
      transactionName: NotificationPreferencesTelemetry.TransactionName,
      metadata: {
        templateId,
        templateName,
        checked: isChecked,
        channelType: ChannelTypeEnum.EMAIL,
      },
    });
    addSentryBreadcrumb(
      NotificationPreferencesTelemetry.BreadcrumbCategory,
      'Update email notification preference failed',
      {
        templateId,
        templateName,
        checked: isChecked,
        error: String(err),
      },
    );
  };

  const handleSuccess = (
    templateId: string,
    isChecked: boolean,
    templateName: string,
    onSuccess?: (templateId: string, isChecked: boolean) => void,
  ) => {
    toast(t('profile:success.notifications'), {
      status: ToastStatus.Success,
    });
    addSentryBreadcrumb(
      NotificationPreferencesTelemetry.BreadcrumbCategory,
      'Update email notification preference succeeded',
      {
        templateId,
        templateName,
        checked: isChecked,
      },
    );
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
    const templateName = template.name;

    addSentryBreadcrumb(
      NotificationPreferencesTelemetry.BreadcrumbCategory,
      'Update email notification preference started',
      {
        templateId,
        templateName,
        checked: isChecked,
      },
    );

    setMutatingTemplateId(templateId);

    logValueChange('email_notification_settings', !isChecked, isChecked, {
      templateName,
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
      onSuccess: () => handleSuccess(templateId, isChecked, templateName, onSuccess),
      onError: (err) => handleError(err, templateId, isChecked, templateName),
    });
  };

  return { updatePreference, mutatingTemplateId };
};

export default useUpdateEmailNotificationPreferences;
