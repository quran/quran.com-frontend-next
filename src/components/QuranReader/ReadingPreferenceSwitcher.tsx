import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch from 'src/components/dls/Switch/Switch';
import {
  selectReadingPreferences,
  setReadingPreference,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
import { logValueChange } from 'src/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { ReadingPreference } from 'types/QuranReader';

const ReadingPreferenceSwitcher = () => {
  const { t } = useTranslation('common');
  const readingPreferences = useSelector(selectReadingPreferences);
  const { readingPreference } = readingPreferences;
  const dispatch = useDispatch();
  const router = useRouter();
  const readingPreferencesOptions = useMemo(
    () => [
      {
        name: t(`reading-preference.${ReadingPreference.Translation}`),
        value: ReadingPreference.Translation,
      },
      {
        name: t(`reading-preference.${ReadingPreference.Reading}`),
        value: ReadingPreference.Reading,
      },
    ],
    [t],
  );

  const onViewSwitched = (view: ReadingPreference) => {
    logValueChange('reading_preference', readingPreference, view);

    // drop `startingVerse` from query params
    const newQueryParams = { ...router.query };
    delete newQueryParams.startingVerse;
    const newUrlObject = {
      pathname: router.pathname,
      query: newQueryParams,
    };

    router.replace(newUrlObject, null, { shallow: true }).then(() => {
      if (isLoggedIn()) {
        const newReadingPreferences = { ...readingPreferences };
        // no need to persist this since it's calculated and only used internally
        delete newReadingPreferences.isUsingDefaultWordByWordLocale;
        newReadingPreferences.readingPreference = view;
        addOrUpdateUserPreference(newReadingPreferences, PreferenceGroup.READING)
          .then(() => {
            dispatch(setReadingPreference(view));
          })
          .catch(() => {
            // TODO: show an error
          });
      } else {
        dispatch(setReadingPreference(view));
      }
    });
  };

  return (
    <div className={styles.container}>
      <Switch
        items={readingPreferencesOptions}
        selected={readingPreference}
        onSelect={onViewSwitched}
      />
    </div>
  );
};
export default ReadingPreferenceSwitcher;
