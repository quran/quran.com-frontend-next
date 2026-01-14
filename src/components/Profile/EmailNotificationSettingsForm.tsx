/* eslint-disable no-underscore-dangle */
// Novu's IUserPreferenceSettings uses _id convention which violates our naming rules
import { FC, useEffect, useMemo, useState } from 'react';

import { ChannelTypeEnum, IUserPreferenceSettings } from '@novu/headless';
import { groupBy } from 'lodash';
import useTranslation from 'next-translate/useTranslation';

import useUpdateEmailNotificationPreferences from '../../hooks/auth/useUpdateEmailNotificationPreferences';
import useFetchUserPreferences from '../Notifications/hooks/useFetchUserPreferences';
import { HeadlessServiceStatus } from '../Notifications/hooks/useHeadlessService';

import EmailNotificationSettingsSkeleton from './EmailNotificationSettingsSkeleton';
import NotificationCheckbox from './NotificationCheckbox';
import Section from './Section';
import sharedStyles from './SharedProfileStyles.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { TestId } from '@/tests/test-ids';

const MARKETING_TAG = 'marketing';
const QDC_TAG = 'QDC';

const EmailNotificationSettingsForm: FC = () => {
  const { t } = useTranslation('profile');
  const {
    mutate,
    isMutating: isFetchingUserPreferences,
    error,
    userPreferences,
    status,
  } = useFetchUserPreferences();
  const [preferences, setPreferences] = useState<IUserPreferenceSettings[]>(
    userPreferences as IUserPreferenceSettings[] | [],
  );
  const [localPreferences, setLocalPreferences] = useState<IUserPreferenceSettings[]>(
    userPreferences as IUserPreferenceSettings[] | [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const { updatePreference } = useUpdateEmailNotificationPreferences();

  const groupByTags = useMemo(
    () =>
      groupBy(
        localPreferences?.filter(
          (preference) =>
            preference.template.critical === false &&
            !!preference.template.tags.length &&
            !preference.template.tags.includes(MARKETING_TAG) &&
            preference.template.tags.includes(QDC_TAG),
        ),
        (preference) => preference.template.tags,
      ),
    [localPreferences],
  );

  useEffect(() => {
    setPreferences(userPreferences as IUserPreferenceSettings[]);
    setLocalPreferences(userPreferences as IUserPreferenceSettings[]);
  }, [userPreferences]);

  useEffect(() => {
    mutate(false);
  }, [mutate]);

  const handleToggle = (preference: IUserPreferenceSettings, isChecked: boolean): void => {
    const templateId = preference.template._id;
    setLocalPreferences((prevPreferences) =>
      prevPreferences.map((pref) =>
        pref.template._id === templateId
          ? {
              ...pref,
              preference: {
                ...pref.preference,
                channels: { ...pref.preference.channels, [ChannelTypeEnum.EMAIL]: isChecked },
              },
            }
          : pref,
      ),
    );
  };

  const hasChanges = useMemo(
    () =>
      preferences?.some((pref) => {
        const localPref = localPreferences.find((lp) => lp.template._id === pref.template._id);
        if (!localPref) return false;
        const originalEmail = pref.preference.channels[ChannelTypeEnum.EMAIL] ?? false;
        const localEmail = localPref.preference.channels[ChannelTypeEnum.EMAIL] ?? false;
        return originalEmail !== localEmail;
      }) ?? false,
    [preferences, localPreferences],
  );

  const handleSave = async (): Promise<void> => {
    if (!hasChanges) return;

    setIsSaving(true);
    const changedPreferences = localPreferences.filter((localPref) => {
      const originalPref = preferences.find((pref) => pref.template._id === localPref.template._id);
      if (!originalPref) return false;
      const originalEmail = originalPref.preference.channels[ChannelTypeEnum.EMAIL] ?? false;
      const localEmail = localPref.preference.channels[ChannelTypeEnum.EMAIL] ?? false;
      return originalEmail !== localEmail;
    });

    try {
      const updatePromises = changedPreferences.map(async (preference) => {
        const isChecked = preference.preference.channels[ChannelTypeEnum.EMAIL] ?? false;
        return updatePreference(preference, isChecked);
      });

      await Promise.all(updatePromises);
      setPreferences(localPreferences);
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = status === HeadlessServiceStatus.INITIALIZING || isFetchingUserPreferences;
  const hasError = status === HeadlessServiceStatus.ERROR || error;

  if (isLoading) {
    return <EmailNotificationSettingsSkeleton />;
  }

  if (hasError) {
    return null;
  }

  if (!preferences || preferences.length === 0) return null;

  const flattenedPreferences = Object.values(groupByTags).flat();

  return (
    <Section
      title={t('email-notification-settings')}
      dataTestId={TestId.AUTH_UPDATE_PROFILE_EMAIL_NOTIFICATION_SETTINGS_SECTION}
    >
      {flattenedPreferences.map((preference) => (
        <NotificationCheckbox
          key={preference.template._id}
          preference={preference}
          onToggle={handleToggle}
          disabled={isSaving}
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
