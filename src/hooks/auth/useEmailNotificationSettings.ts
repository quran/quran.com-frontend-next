/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
import { useEffect, useMemo, useState } from 'react';

import { ChannelTypeEnum, IUserPreferenceSettings } from '@novu/headless';
import { groupBy } from 'lodash';

import useUpdateEmailNotificationPreferences from './useUpdateEmailNotificationPreferences';

import useFetchUserPreferences from '@/components/Notifications/hooks/useFetchUserPreferences';
import { HeadlessServiceStatus } from '@/components/Notifications/hooks/useHeadlessService';

const QDC_TAG = 'QDC';
const QR_TAG = 'QR';
const MARKETING_TAG_NAME = 'marketing';

const useEmailNotificationSettings = () => {
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
            !preference.template.tags.includes(MARKETING_TAG_NAME) &&
            preference.template.tags.includes(QDC_TAG),
        ),
        // Group by category tags, excluding QDC/QR marker tags
        (preference) => {
          const categoryTags = preference.template.tags.filter(
            (tag) => tag !== QDC_TAG && tag !== QR_TAG,
          );
          // Take the first category tag; workflows should have exactly one category tag
          return categoryTags[0] || 'uncategorized';
        },
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

  const flattenedPreferences = Object.values(groupByTags).flat();

  return {
    isLoading,
    hasError,
    handleToggle,
    handleSave,
    hasChanges,
    isSaving,
    preferences: flattenedPreferences,
  };
};

export default useEmailNotificationSettings;
