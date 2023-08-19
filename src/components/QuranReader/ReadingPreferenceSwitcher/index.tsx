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
  iconsOnly?: boolean;
}

const ReadingPreferenceSwitcher: React.FC<Props> = ({ size, iconsOnly = false }) => {
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
          iconsOnly={iconsOnly}
        />
      ),
      value: ReadingPreference.Translation,
    },
    {
      name: (
        <LoadingSwitcher
          readingPreference={readingPreference}
          selectedReadingPreference={ReadingPreference.Reading}
          iconsOnly={iconsOnly}
        />
      ),
      value: ReadingPreference.Reading,
    },
  ];

  const onViewSwitched = (view: ReadingPreference) => {
    logValueChange('reading_preference', readingPreference, view);

    const newQueryParams = { ...router.query };

    // Track `startingVerse` once we're past the start of the page so we can 
    // continue from the same ayah when switching views. Without the > 1 check,
    // switching views at the start of the page causes unnecessary scrolls
    if (parseInt(lastReadVerse) > 1) {
      newQueryParams.startingVerse = lastReadVerse 
    }

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
