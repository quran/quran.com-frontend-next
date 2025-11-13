import { useEffect, useMemo, useState } from 'react';

import { IUserPreferenceSettings } from '@novu/headless';
import { groupBy } from 'lodash';
import useTranslation from 'next-translate/useTranslation';

import styles from '../../pages/profile/profile.module.scss';
import useFetchUserPreferences from '../Notifications/hooks/useFetchUserPreferences';
import { HeadlessServiceStatus } from '../Notifications/hooks/useHeadlessService';

import Section from './Section';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useAuthData from '@/hooks/auth/useAuthData';
import Error from '@/pages/_error';

const MARKETING_TAG = 'marketing';

const EmailNotificationSettingsForm: React.FC = () => {
  const { t } = useTranslation('profile');
  const { userData } = useAuthData();
  const {
    mutate,
    isMutating: isFetchingUserPreferences,
    error,
    userPreferences,
    status,
  } = useFetchUserPreferences();
  const [preferences, setPreferences] = useState<IUserPreferenceSettings[]>(
    userPreferences as IUserPreferenceSettings[],
  );

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
  const hasError = status === HeadlessServiceStatus.ERROR || error;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.loadingContainer}>
        <Error statusCode={500} />
      </div>
    );
  }

  if (!preferences || preferences.length === 0) {
    return null;
  }

  return (
    <Section title={t('email-notification-settings')}>
      <Checkbox
        id="streaks-notification"
        label={t('streaks-notification-description')}
        onChange={() => {}}
        defaultChecked={userData?.consents.streaksNotification}
      />
      <Checkbox
        id="quran-in-a-year-notification"
        label={t('quran-in-a-year-notification-description')}
        onChange={() => {}}
        defaultChecked={userData?.consents.quranInAYearNotification}
      />
      <div>
        <Button className={styles.button} size={ButtonSize.Small} variant={ButtonVariant.Accent}>
          {t('save-changes')}
        </Button>
      </div>
    </Section>
  );
};

export default EmailNotificationSettingsForm;
