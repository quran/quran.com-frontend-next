import React from 'react';

import classNames from 'classnames';

import { StudyModeTabId } from './StudyModeBottomActions';
import styles from './StudyModeModal.module.scss';
import StudyModeSsrContent from './StudyModeSsrContent';
import StudyModeSsrHeader from './StudyModeSsrHeader';

import ContentModal from '@/dls/ContentModal/ContentModal';
import { TestId } from '@/tests/test-ids';
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
  isContentTabActive: boolean | StudyModeTabId;
}

const StudyModeSsrContainerView: React.FC<StudyModeSsrContainerViewProps> = (props) => {
  const {
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
    ...contentProps
  } = props;

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
    />
  );

  return (
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
        {...contentProps}
      />
    </ContentModal>
  );
};

export default StudyModeSsrContainerView;
