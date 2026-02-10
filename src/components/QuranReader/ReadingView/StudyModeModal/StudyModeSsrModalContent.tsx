import React from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { StudyModeTabId } from './StudyModeBottomActions';
import styles from './StudyModeModal.module.scss';
import StudyModeSsrContent from './StudyModeSsrContent';
import StudyModeSsrHeader from './StudyModeSsrHeader';

import ContentModal from '@/dls/ContentModal/ContentModal';
import { selectStudyModeIsSsrMode } from '@/redux/slices/QuranReader/studyMode';
import {
  selectVerseActionModalIsOpen,
  selectVerseActionModalWasOpenedFromStudyMode,
} from '@/redux/slices/QuranReader/verseActionModal';
import { TestId } from '@/tests/test-ids';
import { AyahHadithsResponse } from '@/types/Hadith';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import Verse from '@/types/Verse';
import Word from '@/types/Word';

interface StudyModeSsrModalContentProps {
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
  hadithsInitialData?: AyahHadithsResponse;
  verseHistory?: {
    chapterName: string;
    localizedVerseKey: string;
  } | null;
  onGoBack?: () => void;
  onGoToVerse?: (chapterId: string, verseNumber: string, previousVerseKey?: string) => void;
}

const StudyModeSsrModalContent: React.FC<StudyModeSsrModalContentProps> = ({
  t,
  selectedChapterId,
  selectedVerseNumber,
  canNavigatePrev,
  canNavigateNext,
  onChapterChange,
  onVerseChange,
  onPreviousVerse,
  onNextVerse,
  onClose,
  isContentTabActive,
  activeContentTab,
  selectedWordLocation,
  verseHistory,
  onGoBack,
  onGoToVerse,
  ...contentProps
}) => {
  const isVerseActionOpen = useSelector(selectVerseActionModalIsOpen);
  const wasOpenedFromStudyMode = useSelector(selectVerseActionModalWasOpenedFromStudyMode);
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);

  // Hide when verse action is open and was opened from SSR study mode
  const shouldHide = isVerseActionOpen && wasOpenedFromStudyMode && isSsrMode;

  const header = (
    <StudyModeSsrHeader
      t={t}
      selectedChapterId={selectedChapterId}
      selectedVerseNumber={selectedVerseNumber}
      canNavigatePrev={canNavigatePrev}
      canNavigateNext={canNavigateNext}
      onChapterChange={onChapterChange}
      onVerseChange={onVerseChange}
      onPreviousVerse={onPreviousVerse}
      onNextVerse={onNextVerse}
      verseHistory={verseHistory}
      onGoBack={onGoBack}
    />
  );

  return (
    <div className={classNames({ [styles.ssrHidden]: shouldHide })}>
      <ContentModal
        isFakeSEOFriendlyMode
        onClose={onClose}
        hasCloseButton={false}
        header={header}
        headerClassName={styles.modalHeader}
        contentClassName={classNames(styles.contentModal, {
          [styles.bottomSheetContent]: isContentTabActive,
        })}
        overlayClassName={classNames(styles.mobileBottomSheetOverlay, {
          [styles.bottomSheetOverlay]: isContentTabActive,
        })}
        innerContentClassName={classNames(styles.innerContent, {
          [styles.bottomSheetInnerContent]: isContentTabActive,
        })}
        dataTestId={TestId.STUDY_MODE_MODAL}
      >
        <StudyModeSsrContent
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          activeContentTab={activeContentTab}
          selectedWordLocation={selectedWordLocation}
          onGoToVerse={onGoToVerse}
          {...contentProps}
        />
      </ContentModal>
    </div>
  );
};

export default StudyModeSsrModalContent;
