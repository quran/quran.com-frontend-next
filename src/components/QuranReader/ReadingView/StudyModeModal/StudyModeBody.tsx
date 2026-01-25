import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './StudyModeBody.module.scss';
import { TAB_COMPONENTS, useStudyModeTabs } from './StudyModeBodyTabs';
import StudyModeBottomActions, { StudyModeTabId } from './StudyModeBottomActions';
import StudyModeVerseText from './StudyModeVerseText';
import useStudyModeScroll from './useStudyModeScroll';
import WordNavigationBox from './WordNavigationBox';

import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getVerseWords } from '@/utils/verse';
import AyahQuestionsResponse from 'types/QuestionsAndAnswers/AyahQuestionsResponse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';
import Word from 'types/Word';

interface StudyModeBodyProps {
  verse: Verse;
  bookmarksRangeUrl?: string;
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
}

const StudyModeBody: React.FC<StudyModeBodyProps> = ({
  verse,
  bookmarksRangeUrl = '',
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
}) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  const { containerRef, bottomActionsRef, tabContentRef, hasScrolledDown, showScrollGradient } =
    useStudyModeScroll({ verseKey: verse.verseKey, activeTab });

  const tabs = useStudyModeTabs(activeTab, verse.verseKey, onTabChange);

  return (
    <div ref={containerRef} className={styles.container}>
      <TopActions verse={verse} bookmarksRangeUrl={bookmarksRangeUrl} shouldUseModalZIndex />
      <div className={styles.arabicVerseContainer}>
        {showWordBox && selectedWord && (
          <WordNavigationBox
            word={selectedWord}
            onPrevious={onNavigatePreviousWord}
            onNext={onNavigateNextWord}
            onClose={onWordBoxClose}
            canNavigatePrev={canNavigateWordPrev}
            canNavigateNext={canNavigateWordNext}
          />
        )}
        <StudyModeVerseText
          words={getVerseWords(verse)}
          highlightedWordLocation={selectedWordLocation}
          onWordClick={onWordClick}
        />
      </div>
      <div className={styles.translationsContainer}>
        {verse.translations?.map((translation: Translation) => (
          <div key={translation.id} className={styles.translationContainer}>
            <TranslationText
              translationFontScale={quranReaderStyles.translationFontScale}
              text={translation.text}
              languageId={translation.languageId}
              resourceName={verse.translations?.length > 1 ? translation.resourceName : null}
            />
          </div>
        ))}
      </div>

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
              />
            </div>
          );
        })()}
    </div>
  );
};

export default StudyModeBody;
