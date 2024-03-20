/* eslint-disable no-underscore-dangle */
import React, { useEffect, useMemo, useState } from 'react';

import { IUserPreferenceSettings } from '@novu/headless';
import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';

import parentStyles from '../Tabs.module.scss';

import CollapsibleWorkflowSettings from './CollapsibleWorkflowSettings';

import useFetchUserPreferences from '@/components/Notifications/hooks/useFetchUserPreferences';
import { HeadlessServiceStatus } from '@/components/Notifications/hooks/useHeadlessService';
import FieldsetContainer from '@/components/Notifications/NotificationSettings/Tabs/FieldsetContainer';
import Pill, { PillSize } from '@/dls/Pill';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Error from '@/pages/_error';

const MARKETING_TAG = 'marketing';

const CategoriesSettingsTab = () => {
  const { t } = useTranslation('notification-settings');
  const {
    mutate,
    isMutating: isFetchingUserPreferences,
    error,
    userPreferences,
    status,
  } = useFetchUserPreferences();
  // we need a local state to handle UI updates when the user changes one of the settings since the toggles are controlled
  const [preferences, setPreferences] = useState<IUserPreferenceSettings[]>(
    userPreferences as IUserPreferenceSettings[],
  );

  /**
   * Group the preferences by tags. We filter out:
   *
   * 1. critical workflows since they are cannot be skipped.
   * 2. preferences that don't have tags since they cannot be categorized.
   * 3. non-marketing emails
   */
  const groupByTags = useMemo(
    () =>
      groupBy(
        preferences?.filter(
          (preference) =>
            preference.template.critical === false &&
            !!preference.template.tags.length &&
            !preference.template.tags.includes(MARKETING_TAG),
        ),
        (preference) => preference.template.tags,
      ),
    [preferences],
  );

  useEffect(() => {
    setPreferences(userPreferences as IUserPreferenceSettings[]);
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
      {Object.keys(groupByTags).map((tag) => {
        const tagPreferences = groupByTags[tag];
        return (
          <div key={tag}>
            <FieldsetContainer title={<Pill size={PillSize.SMALL}>{t(`tags.${tag}`)}</Pill>}>
              {tagPreferences.map((preference) => {
                return (
                  <CollapsibleWorkflowSettings
                    key={preference.template._id}
                    preference={preference}
                  />
                );
              })}
            </FieldsetContainer>
          </div>
        );
      })}
    </>
  );
};

export default CategoriesSettingsTab;
