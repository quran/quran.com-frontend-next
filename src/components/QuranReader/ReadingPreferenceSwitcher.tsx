import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch from 'src/components/dls/Switch/Switch';
import usePersistPreferenceGroup from 'src/hooks/usePersistPreferenceGroup';
import {
  selectReadingPreferences,
  setReadingPreference,
} from 'src/redux/slices/QuranReader/readingPreferences';
import SliceName from 'src/redux/types/SliceName';
import { logValueChange } from 'src/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { ReadingPreference } from 'types/QuranReader';

const ReadingPreferenceSwitcher = () => {
  const { t } = useTranslation('common');
  const readingPreferences = useSelector(selectReadingPreferences);
  const { readingPreference } = readingPreferences;
  const { onSettingsChange } = usePersistPreferenceGroup();
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
      onSettingsChange(
        'readingPreference',
        view,
        setReadingPreference(view),
        readingPreferences,
        setReadingPreference(readingPreference),
        SliceName.READING_PREFERENCES,
        PreferenceGroup.READING,
      );
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
