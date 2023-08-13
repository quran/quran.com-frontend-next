import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import LoadingSwitcher from './ReadingPreferenceOption';
import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch, { SwitchSize } from '@/dls/Switch/Switch';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { ReadingPreference } from 'types/QuranReader';

interface Props {
  size?: SwitchSize;
}

const ReadingPreferenceSwitcher: React.FC<Props> = ({ size }) => {
  const readingPreferences = useSelector(selectReadingPreferences);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const lastReadVerse = lastReadVerseKey.verseKey?.split(':')[1];
  const { readingPreference } = readingPreferences;
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const router = useRouter();

  const readingPreferencesOptions = [
    {
      name: (
        <LoadingSwitcher
          readingPreference={readingPreference}
          selectedReadingPreference={ReadingPreference.Translation}
          isLoading={isLoading}
        />
      ),
      value: ReadingPreference.Translation,
    },
    {
      name: (
        <LoadingSwitcher
          readingPreference={readingPreference}
          selectedReadingPreference={ReadingPreference.Reading}
          isLoading={isLoading}
        />
      ),
      value: ReadingPreference.Reading,
    },
  ];

  const onViewSwitched = (view: ReadingPreference) => {
    logValueChange('reading_preference', readingPreference, view);

    // drop `startingVerse` from query params
    const newQueryParams = { ...router.query, startingVerse: lastReadVerse };
    const newUrlObject = {
      pathname: router.pathname,
      query: newQueryParams,
    };

    router.replace(newUrlObject, null, { shallow: true }).then(() => {
      onSettingsChange(
        'readingPreference',
        view,
        setReadingPreference(view),
        setReadingPreference(readingPreference),
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
        size={size}
      />
    </div>
  );
};
export default ReadingPreferenceSwitcher;
