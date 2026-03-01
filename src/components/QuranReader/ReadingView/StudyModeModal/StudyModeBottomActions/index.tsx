import React, { useContext, useEffect, useMemo, useRef } from 'react';

import { useSelector as useXStateSelector } from '@xstate/react';
import classNames from 'classnames';

import styles from './StudyModeBottomActions.module.scss';

import Separator, { SeparatorWeight } from '@/components/dls/Separator/Separator';
import Scrollable from '@/dls/Scrollable/Scrollable';
import EventNames from '@/utils/event-names';
import { selectIsAudioPlayerVisible } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

export enum StudyModeTabId {
  TAFSIR = 'tafsir',
  LAYERS = 'layers',
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
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioVisible = useXStateSelector(audioService, selectIsAudioPlayerVisible);

  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab]) {
      tabRefs.current[activeTab]?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  const handleTabKeyDown = (e: React.KeyboardEvent, handleClick: () => void) => {
    if (e.key === 'Enter' || (e.key === ' ' && !isAudioVisible)) {
      e.preventDefault();
      handleClick();
    }
  };

  const filteredTabs = useMemo(() => tabs.filter((tab) => tab.condition !== false), [tabs]);

  return (
    <div
      className={classNames(styles.bottomActionsContainer, {
        [styles.noBorder]: !activeTab,
      })}
    >
      <Scrollable
        className={styles.tabsContainer}
        eventName={EventNames.QURAN_READER_STUDY_MODE_BOTTOM_ACTION_SCROLLABLE}
      >
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
              // eslint-disable-next-line react/jsx-handler-names
              onClick={tab.onClick}
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
      </Scrollable>
    </div>
  );
};

export default StudyModeBottomActions;
