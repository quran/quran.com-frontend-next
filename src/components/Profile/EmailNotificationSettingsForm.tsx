/* eslint-disable no-underscore-dangle */
import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import EmailNotificationSettingsSkeleton from './EmailNotificationSettingsSkeleton';
import NotificationCheckbox from './NotificationCheckbox';
import Section from './Section';
import sharedStyles from './SharedProfileStyles.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useEmailNotificationSettings from '@/hooks/auth/useEmailNotificationSettings';
import useRamadanChallengeStatus from '@/hooks/useGetRamadanChallengeStatus';
import { TestId } from '@/tests/test-ids';

const DAILY_RAMADAN_CHALLENGE_TAG = 'DAILY-RAMADAN-CHALLENGE';

const EmailNotificationSettingsForm: FC = () => {
  const { isEnrolled: isEnrolledRamadanChallenge } = useRamadanChallengeStatus();
  const { t } = useTranslation('profile');
  const { isLoading, hasError, handleToggle, handleSave, hasChanges, isSaving, preferences } =
    useEmailNotificationSettings();

  if (isLoading) {
    return <EmailNotificationSettingsSkeleton />;
  }

  if (hasError || !preferences || preferences.length === 0) {
    return null;
  }

  return (
    <Section
      title={t('email-notification-settings')}
      dataTestId={TestId.AUTH_UPDATE_PROFILE_EMAIL_NOTIFICATION_SETTINGS_SECTION}
    >
      {preferences.map((preference) => (
        <NotificationCheckbox
          key={preference.template._id}
          preference={preference}
          onToggle={handleToggle}
          disabled={
            isSaving ||
            (!isEnrolledRamadanChallenge &&
              preference.template.tags.includes(DAILY_RAMADAN_CHALLENGE_TAG))
          }
          t={t}
        />
      ))}
      <div>
        <Button
          className={sharedStyles.button}
          size={ButtonSize.Small}
          variant={ButtonVariant.Accent}
          onClick={handleSave}
          isDisabled={!hasChanges || isSaving}
          isLoading={isSaving}
        >
          {t('save-changes')}
        </Button>
      </div>
    </Section>
  );
};

export default EmailNotificationSettingsForm;
