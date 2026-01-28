import React from 'react';

import classNames from 'classnames';

import SearchableVerseSelector from './SearchableVerseSelector';
import styles from './StudyModeModal.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { FakeContentClose } from '@/dls/ContentModal/FakeContentModal';
import ArrowIcon from '@/icons/arrow.svg';
import CloseIcon from '@/icons/close.svg';
import { TestId } from '@/tests/test-ids';

interface StudyModeSsrHeaderProps {
  t: (key: string) => string;
  selectedChapterId: string;
  selectedVerseNumber: string;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  onChapterChange: (chapterId: string) => void;
  onVerseChange: (verseNumber: string) => void;
  onPreviousVerse: () => void;
  onNextVerse: () => void;
}

const StudyModeSsrHeader: React.FC<StudyModeSsrHeaderProps> = ({
  t,
  selectedChapterId,
  selectedVerseNumber,
  canNavigatePrev,
  canNavigateNext,
  onChapterChange,
  onVerseChange,
  onPreviousVerse,
  onNextVerse,
}) => (
  <div className={styles.header} data-testid={TestId.STUDY_MODE_HEADER}>
    <div className={styles.selectionWrapper}>
      <SearchableVerseSelector
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        onChapterChange={onChapterChange}
        onVerseChange={onVerseChange}
      />
    </div>
    <Button
      size={ButtonSize.Small}
      variant={ButtonVariant.Ghost}
      onClick={onPreviousVerse}
      className={classNames(styles.navButton, styles.prevButton)}
      ariaLabel={t('aria.previous-verse')}
      isDisabled={!canNavigatePrev}
      shouldFlipOnRTL={false}
      data-testid={TestId.STUDY_MODE_PREV_VERSE_BUTTON}
    >
      <ArrowIcon />
    </Button>
    <Button
      size={ButtonSize.Small}
      variant={ButtonVariant.Ghost}
      onClick={onNextVerse}
      className={classNames(styles.navButton, styles.nextButton)}
      ariaLabel={t('aria.next-verse')}
      isDisabled={!canNavigateNext}
      shouldFlipOnRTL={false}
      data-testid={TestId.STUDY_MODE_NEXT_VERSE_BUTTON}
    >
      <ArrowIcon />
    </Button>
    <FakeContentClose className={styles.closeButton} data-testid={TestId.STUDY_MODE_CLOSE_BUTTON}>
      <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} ariaLabel={t('aria.close')}>
        <CloseIcon />
      </Button>
    </FakeContentClose>
  </div>
);

export default StudyModeSsrHeader;
