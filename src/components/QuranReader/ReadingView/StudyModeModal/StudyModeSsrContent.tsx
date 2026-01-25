import React from 'react';

import StudyModeBody from './StudyModeBody';
import { StudyModeTabId } from './StudyModeBottomActions';
import styles from './StudyModeModal.module.scss';
import StudyModeSkeleton from './StudyModeSkeleton';

import Error from '@/components/Error';
import { TestId } from '@/tests/test-ids';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import Verse from '@/types/Verse';
import Word from '@/types/Word';

interface StudyModeSsrContentProps {
  isLoading: boolean;
  error: Error | undefined;
  onRetry: () => void;
  currentVerse: Verse | undefined;
  bookmarksRangeUrl: string;
  selectedWord: Word | undefined;
  selectedWordLocation: string | undefined;
  showWordBox: boolean;
  onWordClick: (word: Word) => void;
  onCloseWordBox: () => void;
  onPreviousWord: () => void;
  onNextWord: () => void;
  canNavigateWordPrev: boolean;
  canNavigateWordNext: boolean;
  selectedChapterId: string;
  selectedVerseNumber: string;
  activeContentTab: StudyModeTabId | null;
  onTabChange: (tabId: StudyModeTabId | null) => void;
  questionId?: string;
  questionsInitialData?: AyahQuestionsResponse;
  tafsirIdOrSlug?: string;
}

const StudyModeSsrContent: React.FC<StudyModeSsrContentProps> = ({
  isLoading,
  error,
  onRetry,
  currentVerse,
  bookmarksRangeUrl,
  selectedWord,
  selectedWordLocation,
  showWordBox,
  onWordClick,
  onCloseWordBox,
  onPreviousWord,
  onNextWord,
  canNavigateWordPrev,
  canNavigateWordNext,
  selectedChapterId,
  selectedVerseNumber,
  activeContentTab,
  onTabChange,
  questionId,
  questionsInitialData,
  tafsirIdOrSlug,
}) => {
  if (isLoading) {
    return (
      <div data-testid={TestId.STUDY_MODE_SKELETON}>
        <StudyModeSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer} data-testid={TestId.STUDY_MODE_ERROR}>
        <Error error={error} onRetryClicked={onRetry} />
      </div>
    );
  }

  if (currentVerse) {
    return (
      <div data-testid={TestId.STUDY_MODE_CONTENT}>
        <StudyModeBody
          verse={currentVerse}
          bookmarksRangeUrl={bookmarksRangeUrl}
          selectedWord={selectedWord}
          selectedWordLocation={selectedWordLocation}
          showWordBox={showWordBox}
          onWordClick={onWordClick}
          onWordBoxClose={onCloseWordBox}
          onNavigatePreviousWord={onPreviousWord}
          onNavigateNextWord={onNextWord}
          canNavigateWordPrev={canNavigateWordPrev}
          canNavigateWordNext={canNavigateWordNext}
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          activeTab={activeContentTab}
          onTabChange={onTabChange}
          questionId={questionId}
          questionsInitialData={questionsInitialData}
          tafsirIdOrSlug={tafsirIdOrSlug}
        />
      </div>
    );
  }

  return (
    <div data-testid={TestId.STUDY_MODE_SKELETON}>
      <StudyModeSkeleton />
    </div>
  );
};

export default StudyModeSsrContent;
