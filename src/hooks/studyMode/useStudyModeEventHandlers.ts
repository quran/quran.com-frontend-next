import { useCallback } from 'react';

import { useRouter } from 'next/router';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import Word from '@/types/Word';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { getSurahNavigationUrl } from '@/utils/navigation';

interface UseStudyModeEventHandlersProps {
  selectedChapterId: string;
  selectedVerseNumber: string;
  verseKey: string;
  selectedWordLocation: string | undefined;
  activeContentTab: StudyModeTabId | null;
  handlePreviousVerse: () => void;
  handleNextVerse: () => void;
  handleTabChange: (tabId: StudyModeTabId | null, chapterId: string, verseNumber: string) => void;
  handleWordClick: (word: Word) => void;
  handlePreviousWord: () => void;
  handleNextWord: () => void;
  handleCloseWordBox: () => void;
  retry: () => void;
}

const useStudyModeEventHandlers = ({
  selectedChapterId,
  selectedVerseNumber,
  verseKey,
  selectedWordLocation,
  activeContentTab,
  handlePreviousVerse,
  handleNextVerse,
  handleTabChange,
  handleWordClick,
  handlePreviousWord,
  handleNextWord,
  handleCloseWordBox,
  retry,
}: UseStudyModeEventHandlersProps) => {
  const router = useRouter();

  const onPreviousVerse = useCallback(() => {
    logButtonClick('study_mode_ssr_previous_verse', {
      verseKey: `${selectedChapterId}:${Number(selectedVerseNumber) - 1}`,
    });
    handlePreviousVerse();
  }, [handlePreviousVerse, selectedChapterId, selectedVerseNumber]);

  const onNextVerse = useCallback(() => {
    logButtonClick('study_mode_ssr_next_verse', {
      verseKey: `${selectedChapterId}:${Number(selectedVerseNumber) + 1}`,
    });
    handleNextVerse();
  }, [handleNextVerse, selectedChapterId, selectedVerseNumber]);

  const onTabChange = useCallback(
    (tabId: StudyModeTabId | null) => {
      logValueChange('study_mode_ssr_tab', activeContentTab, tabId, { verseKey });
      handleTabChange(tabId, selectedChapterId, selectedVerseNumber);
    },
    [activeContentTab, handleTabChange, selectedChapterId, selectedVerseNumber, verseKey],
  );

  const handleClose = useCallback(() => {
    logButtonClick('study_mode_ssr_close', { verseKey });
    const chapterUrl = getSurahNavigationUrl(selectedChapterId);
    const urlWithVerse = `${chapterUrl}?startingVerse=${selectedVerseNumber}`;
    router.replace(urlWithVerse, undefined, { scroll: false });
  }, [selectedChapterId, selectedVerseNumber, router, verseKey]);

  const handleRetry = useCallback(() => {
    logButtonClick('study_mode_ssr_retry', { verseKey });
    retry();
  }, [retry, verseKey]);

  const onWordClick = useCallback(
    (word: Word) => {
      logButtonClick('study_mode_ssr_word', { wordLocation: word.location });
      handleWordClick(word);
    },
    [handleWordClick],
  );

  const onPreviousWord = useCallback(() => {
    logButtonClick('study_mode_ssr_previous_word', { wordLocation: selectedWordLocation });
    handlePreviousWord();
  }, [handlePreviousWord, selectedWordLocation]);

  const onNextWord = useCallback(() => {
    logButtonClick('study_mode_ssr_next_word', { wordLocation: selectedWordLocation });
    handleNextWord();
  }, [handleNextWord, selectedWordLocation]);

  const onCloseWordBox = useCallback(() => {
    logButtonClick('study_mode_ssr_word_box_close');
    handleCloseWordBox();
  }, [handleCloseWordBox]);

  return {
    handlePreviousVerse: onPreviousVerse,
    handleNextVerse: onNextVerse,
    handleTabChange: onTabChange,
    handleClose,
    handleRetry,
    handleWordClick: onWordClick,
    handlePreviousWord: onPreviousWord,
    handleNextWord: onNextWord,
    handleCloseWordBox: onCloseWordBox,
  };
};

export default useStudyModeEventHandlers;
