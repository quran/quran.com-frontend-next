import React, { useMemo, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeBottomActions.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';
import useIsMobile from '@/hooks/useIsMobile';

export enum StudyModeTabId {
  TAFSIR = 'tafsir',
  LESSONS = 'lessons',
  REFLECTIONS = 'reflections',
  ANSWERS = 'answers',
  QIRAAT = 'qiraat',
  RELATED_VERSES = 'related_verses',
}

enum ExpandableTabId {
  EXPAND = 'expand-tabs',
  COLLAPSE = 'collapse-tabs',
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

const MAX_SHOWN_TABS = 4;

const StudyModeBottomActions: React.FC<StudyModeBottomActionsProps> = ({ tabs, activeTab }) => {
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

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

  const tabsToRender = useMemo(() => {
    if (filteredTabs.length <= MAX_SHOWN_TABS || isMobile) {
      return filteredTabs;
    }

    if (isExpanded) {
      return [
        ...filteredTabs,
        {
          id: ExpandableTabId.COLLAPSE,
          label: t('tab-see-less'),
          icon: null,
          onClick: () => setIsExpanded(false),
          condition: true,
        },
      ];
    }

    return [
      ...filteredTabs.slice(0, MAX_SHOWN_TABS),
      {
        id: ExpandableTabId.EXPAND,
        label: t('tab-see-more'),
        icon: null,
        onClick: () => setIsExpanded(true),
        condition: true,
      },
    ];
  }, [filteredTabs, isExpanded, isMobile, t]);

  return (
    <div
      className={classNames(styles.bottomActionsContainer, {
        [styles.noBorder]: !activeTab,
      })}
    >
      <div className={styles.tabsContainer}>
        {tabsToRender.map((tab, index) => (
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
            {index < tabsToRender.length - 1 && (
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
