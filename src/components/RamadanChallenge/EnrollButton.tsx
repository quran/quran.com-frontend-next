/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
import { useEffect, useState } from 'react';

import { ChannelTypeEnum } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import { useHeadlessService } from '../Notifications/hooks/useHeadlessService';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useEmailNotificationSettings from '@/hooks/auth/useEmailNotificationSettings';
import { logErrorToSentry } from '@/lib/sentry';
import styles from '@/pages/contentPage.module.scss';
import { addReadingGoal } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';
import { GoalCategory } from 'types/auth/Goal';

const DAILY_RAMADAN_CHALLENGE_TAG = 'DAILY-RAMADAN-CHALLENGE';

interface Props {
  section: string;
  isEnrolled: boolean;
  mutate: () => Promise<void>;
  isLoading: boolean;
  ctaText;
}

const EnrollButton = ({ section, isEnrolled, mutate, isLoading, ctaText }: Props) => {
  const { headlessService } = useHeadlessService();
  const { preferences, isSaving } = useEmailNotificationSettings();
  const { t } = useTranslation('ramadan-activities');
  const toast = useToast();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);

  const ramadanChallengePreference = preferences.find((preference) =>
    preference.template.tags.includes(DAILY_RAMADAN_CHALLENGE_TAG),
  );

  const isDisabled = (isEnrolled || isEnrollLoading || isLoading) && notificationEnabled;

  const isSubscribed = isDisabled && notificationEnabled;

  const handleEnableNotification = async () => {
    // eslint-disable-next-line no-underscore-dangle
    if (isSaving || notificationEnabled || !ramadanChallengePreference?.template?._id) {
      return;
    }
    setIsEnrollLoading(true);
    logButtonClick(`ramadan_challenge_enable_notification_${section}`);
    headlessService.updateUserPreferences({
      // eslint-disable-next-line no-underscore-dangle
      templateId: ramadanChallengePreference?.template._id,
      checked: true,
      channelType: ChannelTypeEnum.EMAIL,
      listener: () => {},
      onSuccess: () => {
        toast('Enrolled successfully!.', {
          status: ToastStatus.Success,
        });
        setIsEnrollLoading(false);
        setNotificationEnabled(true);
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

  const handleEnroll = async () => {
    logButtonClick(`ramadan_challenge_enroll_${section}`);
    setIsEnrollLoading(true);
    try {
      await addReadingGoal({ category: GoalCategory.RAMADAN_CHALLENGE });
      await mutate();
      toast('Enrolled successfully! You may see a welcome email in your inbox.', {
        status: ToastStatus.Success,
      });
      setNotificationEnabled(true);
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'ramadan_challenge_enroll',
        metadata: { section },
      });
      toast('Failed to enroll, please try again later.', { status: ToastStatus.Error });
    } finally {
      setIsEnrollLoading(false);
    }
  };

  const handleButton = async () => {
    if (isEnrolled) {
      await handleEnableNotification();
      return;
    }

    if (isDisabled) {
      return;
    }

    await handleEnroll();
  };

  useEffect(() => {
    if (ramadanChallengePreference) {
      setNotificationEnabled(ramadanChallengePreference.preference.channels.email);
    }
  }, [ramadanChallengePreference]);

  if (isLoading || !ramadanChallengePreference) {
    return <Spinner />;
  }

  return (
    <Button
      onClick={handleButton}
      variant={isSubscribed ? ButtonVariant.Ghost : ButtonVariant.Shadow}
      className={styles.button}
      isLoading={isEnrollLoading}
      isDisabled={isDisabled}
      aria-label={isSubscribed ? t('enrolled') : t('join-challenge')}
      aria-live="polite"
    >
      {isDisabled ? 'Subscribed!' : ctaText}
    </Button>
  );
};

export default EnrollButton;
