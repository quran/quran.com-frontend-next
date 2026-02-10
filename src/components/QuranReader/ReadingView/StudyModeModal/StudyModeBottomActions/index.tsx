import React, { useEffect, useMemo, useRef } from 'react';

import classNames from 'classnames';

import styles from './StudyModeBottomActions.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';

export enum StudyModeTabId {
  TAFSIR = 'tafsir',
  LESSONS = 'lessons',
  REFLECTIONS = 'reflections',
  ANSWERS = 'answers',
  QIRAAT = 'qiraat',
  RELATED_VERSES = 'related_verses',
  HADITH = 'hadith',
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
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab]) {
      tabRefs.current[activeTab]?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

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

  const filteredTabs = useMemo(() => tabs.filter((tab) => tab.condition !== false), [tabs]);

  return (
    <div
      className={classNames(styles.bottomActionsContainer, {
        [styles.noBorder]: !activeTab,
      })}
    >
      <div className={styles.tabsContainer}>
        {filteredTabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <div
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
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
    </div>
  );
};

export default StudyModeBottomActions;
