import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
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
      dispatch(setReadingPreference(view));
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
