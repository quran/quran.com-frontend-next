import React from 'react';

import classNames from 'classnames';

import ReadingPreferenceOption from './ReadingPreferenceOption';
import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch, { SwitchSize, SwitchVariant } from '@/dls/Switch/Switch';
import useGetMushaf from '@/hooks/useGetMushaf';
import useReadingPreferenceSwitcher, {
  SwitcherContext,
} from '@/hooks/useReadingPreferenceSwitcher';
import { logValueChange } from '@/utils/eventLogger';
import { Mushaf, ReadingPreference } from 'types/QuranReader';

export { SwitcherContext as ReadingPreferenceSwitcherType };

type Props = {
  type: SwitcherContext;
  isIconsOnly?: boolean;
  size?: SwitchSize;
  variant?: SwitchVariant;
};

/**
 * Component for switching between different reading preferences (Translation/Reading).
 *
 * @returns {JSX.Element} React component for switching reading preferences
 */
const ReadingPreferenceSwitcher = ({
  type,
  isIconsOnly = false,
  size = SwitchSize.Normal,
  variant = SwitchVariant.Default,
}: Props) => {
  const mushaf = useGetMushaf();
  const { readingPreference, switchReadingPreference, isLoading } = useReadingPreferenceSwitcher({
    context: type,
  });

  const readingPreferencesOptions = (): Array<{ name: JSX.Element; value: ReadingPreference }> => [
    {
      name: (
        <ReadingPreferenceOption
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
        <ReadingPreferenceOption
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
    switchReadingPreference(view);
  };

  const containerClassNames = classNames(styles.container, {
    [styles.surahHeaderContainer]: type === SwitcherContext.SurahHeader,
    [styles.contextMenuContainer]: type === SwitcherContext.ContextMenu && !isIconsOnly,
    [styles.contextMenuIconOnlyContainer]: type === SwitcherContext.ContextMenu && isIconsOnly,
    [styles.tajweedMushaf]: mushaf === Mushaf.QCFTajweedV4 && type === SwitcherContext.SurahHeader,
  });

  return (
    <div className={containerClassNames} id="reading-preference-switcher">
      <Switch
        items={readingPreferencesOptions()}
        selected={readingPreference}
        onSelect={onViewSwitched}
        size={size}
        variant={variant}
      />
    </div>
  );
};

export default ReadingPreferenceSwitcher;
