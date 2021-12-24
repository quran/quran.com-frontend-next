import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch from 'src/components/dls/Switch/Switch';
import {
  selectReadingPreference,
  setReadingPreference,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { logValueChange } from 'src/utils/eventLogger';
import { ReadingPreference } from 'types/QuranReader';

const ReadingPreferenceSwitcher = () => {
  const { t } = useTranslation('common');
  const readingPreference = useSelector(selectReadingPreference);
  const dispatch = useDispatch();
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
  return (
    <div className={styles.container}>
      <Switch
        items={readingPreferencesOptions}
        selected={readingPreference}
        onSelect={(view) => {
          logValueChange('reading_preference', readingPreference, view);
          dispatch(setReadingPreference(view as ReadingPreference));
        }}
      />
    </div>
  );
};
export default ReadingPreferenceSwitcher;
