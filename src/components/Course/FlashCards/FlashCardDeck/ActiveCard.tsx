/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';

import styles from './FlashCardDeck.module.scss';

import { FlashCardData } from '@/components/Course/FlashCards/types';

const SWIPE_THRESHOLD = 100;

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
        Know
      </div>
      <div
        className={classNames(styles.swipeIndicator, styles.reviewIndicator)}
        style={{ opacity: Math.min(-offsetX / SWIPE_THRESHOLD, 1) }}
      >
        Review
      </div>
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.arabicText}>{card.arabic}</div>
          {card.transliteration && (
            <div className={styles.transliteration}>({card.transliteration})</div>
          )}
          <div className={styles.hint}>Tap to flip &bull; Swipe to answer</div>
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
