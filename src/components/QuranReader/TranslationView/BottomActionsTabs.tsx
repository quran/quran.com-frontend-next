import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationViewCell.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';
import useIsMobile from '@/hooks/useIsMobile';
import { isRTLLocale } from '@/utils/locale';

export enum TabId {
  TAFSIR = 'tafsir',
  REFLECTIONS = 'reflections',
  LESSONS = 'lessons',
  ANSWERS = 'answers',
  QIRAAT = 'qiraat',
  HADITH = 'hadith',
  RELATED_VERSES = 'related-verses',
}

enum ExpandableTabId {
  EXPAND = 'expand-tabs',
  COLLAPSE = 'collapse-tabs',
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

const MAX_SHOWN_TABS = 4;

const BottomActionsTabs: React.FC<BottomActionsTabsProps> = ({
  tabs,
  isTranslationView,
  className,
}) => {
  const { t, lang } = useTranslation('common');
  const isRTL = isRTLLocale(lang);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isMobile = useIsMobile();

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

  const filteredTabs = React.useMemo(() => tabs.filter((tab) => tab.condition !== false), [tabs]);

  const tabsToRender = React.useMemo(() => {
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
  }, [filteredTabs, isExpanded, t, isMobile]);

  return (
    <div className={styles.bottomActionsContainer}>
      <div
        className={classNames(styles.tabsContainer, className, {
          [styles.center]: !isTranslationView,
          [styles.tabsContainerRTL]: isRTL && isTranslationView,
        })}
      >
        {tabsToRender.map((tab, index) => (
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

export default BottomActionsTabs;
