import React from 'react';

import classNames from 'classnames';

import styles from './StudyModeBody.module.scss';
import StudyModeBodyContent from './StudyModeBodyContent';
import { TAB_COMPONENTS, useStudyModeTabs } from './StudyModeBodyTabs';
import StudyModeBottomActions, { StudyModeTabId } from './StudyModeBottomActions';
import useStudyModeScroll from './useStudyModeScroll';

import { AyahHadithsResponse } from 'types/Hadith';
import AyahQuestionsResponse from 'types/QuestionsAndAnswers/AyahQuestionsResponse';
import Verse from 'types/Verse';
import Word from 'types/Word';

interface StudyModeBodyProps {
  verse: Verse;
  selectedWord?: Word;
  selectedWordLocation?: string;
  showWordBox: boolean;
  onWordClick: (word: Word) => void;
  onWordBoxClose: () => void;
  onNavigatePreviousWord: () => void;
  onNavigateNextWord: () => void;
  canNavigateWordPrev: boolean;
  canNavigateWordNext: boolean;
  selectedChapterId: string;
  selectedVerseNumber: string;
  activeTab?: StudyModeTabId | null;
  onTabChange?: (tabId: StudyModeTabId | null) => void;
  questionId?: string;
  questionsInitialData?: AyahQuestionsResponse;
  tafsirIdOrSlug?: string;
  hadithsInitialData?: AyahHadithsResponse;
  onGoToVerse?: (chapterId: string, verseNumber: string, previousVerseKey?: string) => void;
}

const StudyModeBody: React.FC<StudyModeBodyProps> = ({
  verse,
  selectedWord,
  selectedWordLocation,
  showWordBox,
  onWordClick,
  onWordBoxClose,
  onNavigatePreviousWord,
  onNavigateNextWord,
  canNavigateWordPrev,
  canNavigateWordNext,
  selectedChapterId,
  selectedVerseNumber,
  activeTab,
  onTabChange,
  questionId,
  questionsInitialData,
  tafsirIdOrSlug,
  hadithsInitialData,
  onGoToVerse,
}) => {
  const { containerRef, bottomActionsRef, tabContentRef, hasScrolledDown, showScrollGradient } =
    useStudyModeScroll({ verseKey: verse.verseKey, activeTab });
  const [relatedVersesCount, setRelatedVersesCount] = React.useState<number | null>(null);

  const tabs = useStudyModeTabs({
    activeTab,
    verseKey: verse.verseKey,
    onTabChange,
    hasRelatedVerses: verse.hasRelatedVerses,
    relatedVersesCount,
  });

  return (
    <div ref={containerRef} className={styles.container}>
      <StudyModeBodyContent
        verse={verse}
        selectedWord={selectedWord}
        selectedWordLocation={selectedWordLocation}
        showWordBox={showWordBox}
        onWordClick={onWordClick}
        onWordBoxClose={onWordBoxClose}
        onNavigatePreviousWord={onNavigatePreviousWord}
        onNavigateNextWord={onNavigateNextWord}
        canNavigateWordPrev={canNavigateWordPrev}
        canNavigateWordNext={canNavigateWordNext}
      />

      <div
        ref={bottomActionsRef}
        className={classNames(styles.bottomActionsWrapper, {
          [styles.bottomActionsWrapperSticky]: !activeTab,
        })}
      >
        {showScrollGradient && (
          <div
            className={classNames(styles.scrollGradient, {
              [styles.scrollGradientHidden]: hasScrolledDown,
            })}
          />
        )}
        <StudyModeBottomActions tabs={tabs} activeTab={activeTab} />
      </div>

      {activeTab &&
        TAB_COMPONENTS[activeTab] &&
        (() => {
          const TabComponent = TAB_COMPONENTS[activeTab];

          return (
            <div
              key={`${activeTab}-${verse.verseKey}`}
              ref={tabContentRef}
              className={styles.tabContentContainer}
            >
              <TabComponent
                chapterId={selectedChapterId}
                verseNumber={selectedVerseNumber}
                switchTab={onTabChange}
                questionId={questionId}
                questionsInitialData={questionsInitialData}
                tafsirIdOrSlug={tafsirIdOrSlug}
                hadithsInitialData={hadithsInitialData}
                onGoToVerse={onGoToVerse}
                setRelatedVersesCount={setRelatedVersesCount}
              />
            </div>
          );
        })()}
    </div>
  );
};

export default StudyModeBody;
