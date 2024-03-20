import React, { useEffect, useState } from 'react';

import { ChannelTypeEnum, IUserGlobalPreferenceSettings } from '@novu/headless';

import parentStyles from '../Tabs.module.scss';

import useFetchUserPreferences from '@/components/Notifications/hooks/useFetchUserPreferences';
import { HeadlessServiceStatus } from '@/components/Notifications/hooks/useHeadlessService';
import useUpdateUserGlobalPreferences from '@/components/Notifications/hooks/useUpdateUserGlobalPreferences';
import PreferenceSettingsToggles from '@/components/Notifications/NotificationSettings/Tabs/PreferenceSettingsToggles';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Error from '@/pages/_error';
import { logValueChange } from '@/utils/eventLogger';

const GlobalSettingsTab = () => {
  const {
    mutate,
    isMutating: isFetchingUserPreferences,
    error,
    userPreferences,
    status,
  } = useFetchUserPreferences();
  const { mutate: updateUserGlobalSettings, isMutating } = useUpdateUserGlobalPreferences();
  // we need a local state to handle UI updates when the user changes one of the settings since the toggles are controlled
  const [preferences, setPreferences] = useState<IUserGlobalPreferenceSettings[]>(userPreferences);

  useEffect(() => {
    setPreferences(userPreferences);
  }, [userPreferences]);

  useEffect(() => {
    mutate(true);
  }, [mutate]);

  const onToggle = (isChecked: boolean, channel?: ChannelTypeEnum) => {
    logValueChange('notif_global_settings', !isChecked, isChecked, {
      channel,
    });
    // if the user is updating the global preference
    if (!channel) {
      updateUserGlobalSettings(isChecked, undefined, () => {
        setPreferences((prev) => {
          const newState = [...prev];
          newState[0].preference.enabled = isChecked;
          return newState;
        });
      });
    } else {
      updateUserGlobalSettings(
        undefined,
        [
          {
            channelType: channel,
            enabled: isChecked,
          },
        ],
        () => {
          setPreferences((prev) => {
            const newState = [...prev];
            newState[0].preference.channels[channel] = isChecked;
            return newState;
          });
        },
      );
    }
  };

  const isLoading = status === HeadlessServiceStatus.INITIALIZING || isFetchingUserPreferences;
  if (isLoading) {
    return (
      <div className={parentStyles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }
  const hasError = status === HeadlessServiceStatus.ERROR || error;
  if (hasError) {
    return (
      <div className={parentStyles.loadingContainer}>
        <Error statusCode={500} />
      </div>
    );
  }

  // if it's loading or there's an error, we don't want to render anything
  if (!preferences || preferences.length === 0) {
    return null;
  }

  return (
    <PreferenceSettingsToggles
      preference={preferences[0]}
      isMutating={isMutating}
      onToggle={onToggle}
    />
  );
};

export default GlobalSettingsTab;
