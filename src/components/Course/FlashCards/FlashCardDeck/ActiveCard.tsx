import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import { SWIPE_THRESHOLD } from './constants';
import styles from './FlashCardDeck.module.scss';

import { FlashCardData } from '@/components/Course/FlashCards/types';

type ActiveCardProps = {
  card: FlashCardData;
  isFlipped: boolean;
  isSwiping: boolean;
  offsetX: number;
  offsetY: number;
  rotation: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick: () => void;
};

const ActiveCard: React.FC<ActiveCardProps> = ({
  card,
  isFlipped,
  isSwiping,
  offsetX,
  offsetY,
  rotation,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
}) => {
  const { t } = useTranslation('learn');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={classNames(styles.card, {
        [styles.flipped]: isFlipped,
        [styles.swiping]: isSwiping,
      })}
      style={{
        transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotation}deg)`,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className={classNames(styles.swipeIndicator, styles.knowIndicator)}
        style={{ opacity: Math.min(offsetX / SWIPE_THRESHOLD, 1) }}
      >
        {t('flashcards.know')}
      </div>
      <div
        className={classNames(styles.swipeIndicator, styles.reviewIndicator)}
        style={{ opacity: Math.min(-offsetX / SWIPE_THRESHOLD, 1) }}
      >
        {t('flashcards.review')}
      </div>
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.arabicText}>{card.arabic}</div>
          {card.transliteration && (
            <div className={styles.transliteration}>({card.transliteration})</div>
          )}
          <div className={styles.hint}>{t('flashcards.tap-to-flip-swipe-to-answer')}</div>
        </div>
        <div className={styles.cardBack}>
          <div className={styles.arabicTextSmall}>{card.arabic}</div>
          {card.transliteration && (
            <div className={styles.transliterationSmall}>({card.transliteration})</div>
          )}
          <div className={styles.divider} />
          <div className={styles.translation}>{card.translation}</div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCard;
