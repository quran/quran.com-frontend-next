import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationViewCell.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';
import { isRTLLocale } from '@/utils/locale';

export enum TabId {
  TAFSIR = 'tafsir',
  REFLECTIONS = 'reflections',
  LESSONS = 'lessons',
  ANSWERS = 'answers',
  QIRAAT = 'qiraat',
  RELATED_VERSES = 'related-verses',
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
  className?: string;
}

const BottomActionsTabs: React.FC<BottomActionsTabsProps> = ({
  tabs,
  isTranslationView,
  className,
}) => {
  const { lang } = useTranslation();
  const isRTL = isRTLLocale(lang);

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

  const filteredTabs = tabs.filter((tab) => tab.condition !== false); // Only show tabs that meet their condition

  return (
    <div className={styles.bottomActionsContainer}>
      <div
        className={classNames(styles.tabsContainer, className, {
          [styles.center]: !isTranslationView,
          [styles.tabsContainerRTL]: isRTL && isTranslationView,
        })}
      >
        {filteredTabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <div
              className={classNames(styles.tabItem, { [styles.tabItemRTL]: isRTL })}
              data-testid={`bottom-action-tab-${tab.id}`}
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
