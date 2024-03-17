/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';

import { IUserPreferenceSettings } from '@novu/headless';

import parentStyles from '../Tabs.module.scss';

import CollapsibleWorkflowSettings from './CollapsibleWorkflowSettings';

import useFetchUserPreferences from '@/components/Notifications/hooks/useFetchUserPreferences';
import { HeadlessServiceStatus } from '@/components/Notifications/hooks/useHeadlessService';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Error from '@/pages/_error';

const CategoriesSettingsTab = () => {
  const {
    mutate,
    isMutating: isFetchingUserPreferences,
    error,
    userPreferences,
    status,
  } = useFetchUserPreferences();
  // we need a local state to handle UI updates when the user changes one of the settings since the toggles are controlled
  const [preferences, setPreferences] = useState<IUserPreferenceSettings[]>(userPreferences);

  useEffect(() => {
    setPreferences(userPreferences);
  }, [userPreferences]);

  useEffect(() => {
    mutate(false);
  }, [mutate]);

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
    <>
      {preferences
        .filter((preference) => preference.template.critical === false)
        .map((preference) => {
          return (
            <CollapsibleWorkflowSettings key={preference.template._id} preference={preference} />
          );
        })}
    </>
  );
};

export default CategoriesSettingsTab;
