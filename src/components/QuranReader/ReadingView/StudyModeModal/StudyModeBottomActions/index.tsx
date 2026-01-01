import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeBottomActions.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';
import { isRTLLocale } from '@/utils/locale';

export enum StudyModeTabId {
  TAFSIR = 'tafsir',
  REFLECTIONS = 'reflections',
  ANSWERS = 'answers',
  HADITH = 'hadith',
  QIRAAT = 'qiraat',
  RELATED_VERSES = 'related-verses',
}

export interface StudyModeTabConfig {
  id: StudyModeTabId;
  label: string;
  icon: JSX.Element;
  onClick: (e: React.MouseEvent | React.KeyboardEvent) => void;
  condition: boolean | undefined;
}

interface StudyModeBottomActionsProps {
  tabs: StudyModeTabConfig[];
}

const StudyModeBottomActions: React.FC<StudyModeBottomActionsProps> = ({ tabs }) => {
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

  return (
    <div className={styles.bottomActionsContainer}>
      <div
        className={classNames(styles.tabsContainer, {
          [styles.tabsContainerRTL]: isRTL,
        })}
      >
        {tabs
          .filter((tab) => tab.condition !== false)
          .map((tab, index, filteredTabs) => (
            <React.Fragment key={tab.id}>
              <div
                className={classNames(styles.tabItem, { [styles.tabItemRTL]: isRTL })}
                data-testid={`study-mode-tab-${tab.id}`}
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

export default StudyModeBottomActions;
