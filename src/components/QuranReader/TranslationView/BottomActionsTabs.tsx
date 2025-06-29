import React from 'react';

import classNames from 'classnames';

import styles from './TranslationViewCell.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';

export enum TabId {
  TAFSIR = 'tafsir',
  REFLECTIONS = 'reflections',
  ANSWERS = 'answers',
}

export interface TabConfig {
  id: TabId;
  label: string;
  icon: JSX.Element;
  onClick: (e: React.MouseEvent | React.KeyboardEvent) => void;
  condition: boolean | undefined;
}

interface BottomActionsTabsProps {
  tabs: TabConfig[];
  isTranslationView: boolean;
}

const BottomActionsTabs: React.FC<BottomActionsTabsProps> = ({ tabs, isTranslationView }) => {
  const handleTabClick = (
    e: React.MouseEvent,
    onClick: (e: React.MouseEvent | React.KeyboardEvent) => void,
  ) => {
    onClick(e);
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent,
    onClick: (e: React.MouseEvent | React.KeyboardEvent) => void,
  ) => {
    onClick(e);
  };

  return (
    <div className={styles.bottomActionsContainer}>
      <div className={classNames(styles.tabsContainer, { [styles.center]: !isTranslationView })}>
        {tabs
          .filter((tab) => tab.condition !== false) // Only show tabs that meet their condition
          .map((tab, index, filteredTabs) => (
            <React.Fragment key={tab.id}>
              <div
                className={styles.tabItem}
                onClick={(e) => handleTabClick(e, tab.onClick)}
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

export default BottomActionsTabs;
