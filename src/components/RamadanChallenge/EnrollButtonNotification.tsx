import { useEffect, useState } from 'react';

import { ChannelTypeEnum } from '@novu/headless';

import { useHeadlessService } from '../Notifications/hooks/useHeadlessService';

import EnrollButton from './EnrollButton';
import styles from './EnrollButton.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useEmailNotificationSettings from '@/hooks/auth/useEmailNotificationSettings';
import { logErrorToSentry } from '@/lib/sentry';
import { TestId } from '@/tests/test-ids';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  section: string;
  subscribedText: string;
  enrollText: string;
  isEnrolled: boolean;
  isLoading: boolean;
  mutate: () => Promise<unknown>;
}

const DAILY_RAMADAN_CHALLENGE_TAG = 'DAILY-RAMADAN-CHALLENGE';

const EnrollButtonNotification = ({
  section,
  subscribedText,
  enrollText,
  isEnrolled,
  isLoading,
  mutate,
}: Props) => {
  const { headlessService } = useHeadlessService();
  const {
    preferences,
    isSaving,
    isLoading: isEmailNotificationSettingsLoading,
  } = useEmailNotificationSettings();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);
  const toast = useToast();

  const notification = preferences.find((preference) =>
    preference.template.tags.includes(DAILY_RAMADAN_CHALLENGE_TAG),
  );

  const handleEnableNotification = async () => {
    if (isLoading || isSaving || isEnabled || isEmailNotificationSettingsLoading) {
      return;
    }

    setIsEnrollLoading(true);
    logButtonClick(`ramadan_challenge_enable_notification_${section}`);
    headlessService.updateUserPreferences({
      // eslint-disable-next-line no-underscore-dangle
      templateId: notification?.template._id,
      checked: true,
      channelType: ChannelTypeEnum.EMAIL,
      listener: () => {},
      onSuccess: () => {
        toast('Enrolled successfully!.', {
          status: ToastStatus.Success,
        });
        setIsEnrollLoading(false);
        setIsEnabled(true);
      },
      onError: (err) => {
        logErrorToSentry(err, {
          transactionName: 'ramadan_challenge_enable_notification',
          metadata: { section },
        });
        toast('Failed to enroll, please try again later.', { status: ToastStatus.Error });
        setIsEnrollLoading(false);
      },
    });
  };

  useEffect(() => {
    if (notification) {
      setIsEnabled(notification.preference.channels.email);
    }
  }, [notification]);

  if (!notification || isLoading || isEmailNotificationSettingsLoading) {
    return <Spinner dataTestId={TestId.RAMADAN_CHALLENGE_ENROLL_BUTTON_NOTIFICATION_SPINNER} />;
  }

  if (isEnabled || !isEnrolled) {
    return (
      <EnrollButton
        isEnrolled={isEnrolled}
        isLoading={isLoading}
        mutate={mutate}
        section={section}
        subscribedText={subscribedText}
        enrollText={enrollText}
      />
    );
  }

  return (
    <Button
      onClick={handleEnableNotification}
      variant={isEnabled ? ButtonVariant.Ghost : ButtonVariant.Shadow}
      isLoading={isEnrollLoading}
      isDisabled={isEnabled || isEnrollLoading}
      aria-live="polite"
      className={styles.button}
    >
      {isEnabled ? subscribedText : enrollText}
    </Button>
  );
};

export default EnrollButtonNotification;
