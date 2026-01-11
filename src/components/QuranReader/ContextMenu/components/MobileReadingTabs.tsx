import React from 'react';

import classNames from 'classnames';

import readingPreferenceStyles from '../../ReadingPreferenceSwitcher/ReadingPreference.module.scss';
import styles from '../styles/MobileReadingTabs.module.scss';

import { Tab } from '@/components/dls/Tabs/Tabs';
import { getReadingPreferenceIcon } from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingPreferenceIcon';
import useReadingPreferenceSwitcher, {
  SwitcherContext,
} from '@/hooks/useReadingPreferenceSwitcher';
import { logValueChange } from '@/utils/eventLogger';
import { ReadingPreference } from 'types/QuranReader';

interface MobileReadingTabsProps {
  t: (key: string) => string;
}

/**
 * Mobile-specific tabs for switching between reading preferences.
 * Appears only on mobile breakpoints when the navbar is visible.
 *
 * @returns {JSX.Element} React component for mobile reading preference tabs
 */
const MobileReadingTabs: React.FC<MobileReadingTabsProps> = ({ t }) => {
  const { readingPreference, switchReadingPreference } = useReadingPreferenceSwitcher({
    context: SwitcherContext.MobileTabs,
  });

  const tabs: Tab[] = [
    {
      title: t('reading-preference.translation'),
      value: ReadingPreference.Translation,
      id: 'translation-tab',
    },
    {
      title: t('reading-preference.reading'),
      value: ReadingPreference.Reading,
      id: 'reading-tab',
    },
  ];

  const onViewSwitched = (view: ReadingPreference) => {
    logValueChange('mobile_tabs_reading_preference', readingPreference, view);
    switchReadingPreference(view);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabsContainer} role="tablist">
        {tabs.map((tab) => (
          <div
            className={classNames(
              styles.tab,
              readingPreference === tab.value && styles.selectedTab,
            )}
            key={tab.value}
            role="tab"
            tabIndex={0}
            id={tab.id}
            data-testid={tab.id}
            onClick={() => onViewSwitched(tab.value as ReadingPreference)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                onViewSwitched(tab.value as ReadingPreference);
              }
            }}
          >
            <span className={readingPreferenceStyles.iconContainer}>
              {getReadingPreferenceIcon({
                currentReadingPreference: readingPreference,
                optionReadingPreference: tab.value as ReadingPreference,
                useSuccessVariant: true,
              })}
            </span>
            <span>{tab.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileReadingTabs;
