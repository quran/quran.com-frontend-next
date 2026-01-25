import React from 'react';

import { StudyModeTabId } from './StudyModeBottomActions';
import StudyModeSsrModalContent from './StudyModeSsrModalContent';

import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import Verse from '@/types/Verse';
import Word from '@/types/Word';

interface StudyModeSsrContainerViewProps {
  t: (key: string) => string;
  selectedChapterId: string;
  selectedVerseNumber: string;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  onChapterChange: (chapterId: string) => void;
  onVerseChange: (verseNumber: string) => void;
  onPreviousVerse: () => void;
  onNextVerse: () => void;
  onClose: () => void;
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
  activeContentTab: StudyModeTabId | null;
  onTabChange: (tabId: StudyModeTabId | null) => void;
  questionId?: string;
  questionsInitialData?: AyahQuestionsResponse;
  isContentTabActive: boolean;
  tafsirIdOrSlug?: string;
}

const StudyModeSsrContainerView: React.FC<StudyModeSsrContainerViewProps> = (props) => {
  return (
    <>
      <StudyModeSsrModalContent {...props} />
      <VerseActionModalContainer />
    </>
  );
};

export default StudyModeSsrContainerView;
