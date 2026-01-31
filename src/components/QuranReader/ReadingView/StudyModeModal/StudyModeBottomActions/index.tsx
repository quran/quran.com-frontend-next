import React from 'react';

import classNames from 'classnames';

import styles from './StudyModeBottomActions.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';

export enum StudyModeTabId {
  TAFSIR = 'tafsir',
  LESSONS = 'lessons',
  REFLECTIONS = 'reflections',
  ANSWERS = 'answers',
  RELATED_VERSES = 'related_verses',
}

export interface StudyModeTabConfig {
  id: StudyModeTabId;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  condition: boolean;
}

interface StudyModeBottomActionsProps {
  tabs: StudyModeTabConfig[];
  activeTab?: StudyModeTabId | null;
}

const StudyModeBottomActions: React.FC<StudyModeBottomActionsProps> = ({ tabs, activeTab }) => {
  const handleTabClick = (onClick: () => void) => {
    onClick();
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, onClick: () => void) => {
    // Only trigger on Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className={styles.tabsContainer}>
      {tabs
        .filter((tab) => tab.condition !== false)
        .map((tab, index, filteredTabs) => (
          <React.Fragment key={tab.id}>
            <div
              className={classNames(styles.tabItem, {
                [styles.tabItemActive]: activeTab === tab.id,
              })}
              data-testid={`study-mode-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.onClick)}
              onKeyDown={(e) => handleTabKeyDown(e, tab.onClick)}
              role="button"
              tabIndex={0}
              aria-label={tab.label}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </div>
            {index < filteredTabs.length - 1 && (
              <div className={styles.separatorContainer}>
                <Separator isVertical weight={SeparatorWeight.SemiBold} />
              </div>
            )}
          </React.Fragment>
        ))}
    </div>
  );
};

export default StudyModeBottomActions;
