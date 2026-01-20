import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './WordNavigationBox.module.scss';

import ArrowIcon from '@/icons/arrow.svg';
import CloseIcon from '@/icons/close.svg';
import Word from 'types/Word';

interface WordNavigationBoxProps {
  word: Word;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}

const WordNavigationBox: React.FC<WordNavigationBoxProps> = ({
  word,
  onPrevious,
  onNext,
  onClose,
  canNavigatePrev,
  canNavigateNext,
}) => {
  const { t } = useTranslation('common');

  // Always show translation and transliteration if available (ignore user settings)
  const hasContent = word.translation?.text || word.transliteration?.text;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canNavigatePrev}
        className={classNames(styles.navButton, styles.prevButton)}
        aria-label={t('aria.prev-page')}
      >
        <ArrowIcon />
      </button>

      <div className={styles.wordNavigationBox}>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label={t('close')}
        >
          <CloseIcon />
        </button>

        <div className={styles.content}>
          {word.translation?.text && (
            <div className={styles.row}>
              <span className={styles.label}>{t('translation')}:</span>
              <span className={styles.text}>{word.translation.text}</span>
            </div>
          )}
          {word.transliteration?.text && (
            <div className={styles.row}>
              <span className={styles.label}>{t('transliteration')}:</span>
              <span className={styles.text}>{word.transliteration.text}</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNavigateNext}
        className={classNames(styles.navButton, styles.nextButton)}
        aria-label={t('aria.next-page')}
      >
        <ArrowIcon />
      </button>
    </div>
  );
};

export default WordNavigationBox;
