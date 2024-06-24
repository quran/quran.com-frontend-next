import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import LoadingSwitcher from './ReadingPreferenceOption';
import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch, { SwitchSize } from '@/dls/Switch/Switch';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGetMushaf from '@/hooks/useGetMushaf';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { Mushaf, ReadingPreference } from 'types/QuranReader';

export enum ReadingPreferenceSwitcherType {
  SurahHeader = 'surah_header',
  ContextMenu = 'context_menu',
}

interface Props {
  size?: SwitchSize;
  isIconsOnly?: boolean;
  type?: ReadingPreferenceSwitcherType;
}

const ReadingPreferenceSwitcher: React.FC<Props> = ({
  size,
  isIconsOnly = false,
  type = ReadingPreferenceSwitcherType.SurahHeader,
}) => {
  const readingPreferences = useSelector(selectReadingPreferences);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const lastReadVerse = lastReadVerseKey.verseKey?.split(':')[1];
  const { readingPreference } = readingPreferences;
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const router = useRouter();
  const mushaf = useGetMushaf();

  const readingPreferencesOptions = [
    {
      name: (
        <LoadingSwitcher
          readingPreference={readingPreference}
          selectedReadingPreference={ReadingPreference.Translation}
          isLoading={isLoading}
          isIconsOnly={isIconsOnly}
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
          isIconsOnly={isIconsOnly}
        />
      ),
      value: ReadingPreference.Reading,
    },
  ];

  const onViewSwitched = (view: ReadingPreference) => {
    logValueChange(`${type}_reading_preference`, readingPreference, view);

    const newQueryParams = { ...router.query };

    // Track `startingVerse` once we're past the start of the page so we can
    // continue from the same ayah when switching views. Without the > 1 check,
    // switching views at the start of the page causes unnecessary scrolls

    if (type === ReadingPreferenceSwitcherType.SurahHeader) {
      delete newQueryParams.startingVerse;
    } else if (parseInt(lastReadVerse, 10) > 1) {
      newQueryParams.startingVerse = lastReadVerse;
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
    <div
      className={classNames(styles.container, {
        [styles.surahHeaderContainer]: type === ReadingPreferenceSwitcherType.SurahHeader,
        [styles.contextMenuContainer]: type === ReadingPreferenceSwitcherType.ContextMenu,
        [styles.tajweedMushaf]:
          mushaf === Mushaf.QCFTajweedV4 && type === ReadingPreferenceSwitcherType.SurahHeader,
      })}
      id="reading-preference-switcher"
    >
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
