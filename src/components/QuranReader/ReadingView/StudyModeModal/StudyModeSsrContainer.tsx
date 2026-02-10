import React, { useContext, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { StudyModeTabId } from './StudyModeBottomActions';
import StudyModeSsrContainerView from './StudyModeSsrContainerView';

import DataContext from '@/contexts/DataContext';
import {
  useStudyModeVerseNavigation,
  useStudyModeWordNavigation,
  useStudyModeTabNavigation,
  useStudyModeVerseData,
  useStudyModeEventHandlers,
} from '@/hooks/studyMode';
import { openStudyModeSsr } from '@/redux/slices/QuranReader/studyMode';
import { AyahHadithsResponse } from '@/types/Hadith';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import Verse from '@/types/Verse';

interface StudyModeSsrContainerProps {
  initialTab: StudyModeTabId;
  chapterId: string;
  verseNumber: string;
  verse?: Verse;
  tafsirIdOrSlug?: string;
  questionId?: string;
  questionsInitialData?: AyahQuestionsResponse;
  hadithsInitialData?: AyahHadithsResponse;
}

const StudyModeSsrContainer: React.FC<StudyModeSsrContainerProps> = ({
  initialTab,
  chapterId: initialChapterId,
  verseNumber: initialVerseNumber,
  verse: initialVerse,
  tafsirIdOrSlug,
  questionId,
  questionsInitialData,
  hadithsInitialData,
}) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);

  const { activeContentTab, handleTabChange, getNavigationUrlForTab } = useStudyModeTabNavigation({
    initialTab,
    tafsirIdOrSlug,
  });

  const verseNav = useStudyModeVerseNavigation({
    initialChapterId,
    initialVerseNumber,
    activeContentTab,
    getNavigationUrlForTab,
  });

  const verseData = useStudyModeVerseData({
    verseKey: verseNav.verseKey,
    selectedChapterId: verseNav.selectedChapterId,
    selectedVerseNumber: verseNav.selectedVerseNumber,
    initialChapterId,
    initialVerseNumber,
    initialVerse,
  });

  const wordNav = useStudyModeWordNavigation({ verse: verseData.currentVerse });

  const events = useStudyModeEventHandlers({
    selectedChapterId: verseNav.selectedChapterId,
    selectedVerseNumber: verseNav.selectedVerseNumber,
    verseKey: verseNav.verseKey,
    selectedWordLocation: wordNav.selectedWordLocation,
    activeContentTab,
    handlePreviousVerse: verseNav.handlePreviousVerse,
    handleNextVerse: verseNav.handleNextVerse,
    handleTabChange,
    handleWordClick: wordNav.handleWordClick,
    handlePreviousWord: wordNav.handlePreviousWord,
    handleNextWord: wordNav.handleNextWord,
    handleCloseWordBox: wordNav.handleCloseWordBox,
    handleGoBack: verseNav.handleGoBack,
    handleGoToVerse: verseNav.handleGoToVerse,
    retry: verseData.retry,
  });

  useEffect(() => {
    if (!initialChapterId || !initialVerseNumber) return;
    dispatch(
      openStudyModeSsr({
        verseKey: `${initialChapterId}:${initialVerseNumber}`,
        activeTab: initialTab,
        highlightedWordLocation: null,
      }),
    );
  }, [initialChapterId, initialVerseNumber, initialTab, dispatch]);

  const isContentTabActive =
    activeContentTab &&
    [
      StudyModeTabId.TAFSIR,
      StudyModeTabId.LAYERS,
      StudyModeTabId.REFLECTIONS,
      StudyModeTabId.LESSONS,
      StudyModeTabId.ANSWERS,
      StudyModeTabId.QIRAAT,
      StudyModeTabId.HADITH,
      StudyModeTabId.RELATED_VERSES,
    ].includes(activeContentTab);

  const isInitialVerse =
    verseNav.selectedChapterId === initialChapterId &&
    verseNav.selectedVerseNumber === initialVerseNumber;

  if (!chaptersData || !initialChapterId || !initialVerseNumber) return null;

  return (
    <StudyModeSsrContainerView
      t={t}
      selectedChapterId={verseNav.selectedChapterId}
      selectedVerseNumber={verseNav.selectedVerseNumber}
      canNavigatePrev={verseNav.canNavigatePrev}
      canNavigateNext={verseNav.canNavigateNext}
      onChapterChange={verseNav.handleChapterChange}
      onVerseChange={verseNav.handleVerseChange}
      onPreviousVerse={events.handlePreviousVerse}
      onNextVerse={events.handleNextVerse}
      onGoBack={events.handleGoBack}
      onGoToVerse={events.handleGoToVerse}
      verseHistory={verseNav.verseHistory}
      onClose={events.handleClose}
      isLoading={verseData.isLoading}
      error={verseData.error}
      onRetry={events.handleRetry}
      currentVerse={verseData.currentVerse}
      bookmarksRangeUrl={verseData.bookmarksRangeUrl}
      selectedWord={wordNav.selectedWord}
      selectedWordLocation={wordNav.selectedWordLocation}
      showWordBox={wordNav.showWordBox}
      onWordClick={events.handleWordClick}
      onCloseWordBox={events.handleCloseWordBox}
      onPreviousWord={events.handlePreviousWord}
      onNextWord={events.handleNextWord}
      canNavigateWordPrev={wordNav.canNavigateWordPrev}
      canNavigateWordNext={wordNav.canNavigateWordNext}
      activeContentTab={activeContentTab}
      onTabChange={events.handleTabChange}
      questionId={isInitialVerse ? questionId : undefined}
      questionsInitialData={isInitialVerse ? questionsInitialData : undefined}
      isContentTabActive={isContentTabActive}
      tafsirIdOrSlug={tafsirIdOrSlug}
      hadithsInitialData={hadithsInitialData}
    />
  );
};

export default StudyModeSsrContainer;
