import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import ActiveCard from './ActiveCard';
import CompletedView from './CompletedView';
import styles from './FlashCardDeck.module.scss';
import useSwipeDeck from './useSwipeDeck';

import { FlashCardData } from '@/components/Course/FlashCards/types';

type FlashCardDeckProps = {
  cards: FlashCardData[];
  onComplete?: (r: { known: FlashCardData[]; unknown: FlashCardData[] }) => void;
  className?: string;
};

const REVIEW_ICON = '\u2715';
const KNOW_ICON = '\u2713';

const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ cards, onComplete, className }) => {
  const { t } = useTranslation('learn');
  const {
    currentIndex,
    currentCard,
    cardState,
    results,
    isAnimating,
    progress,
    handleSwipeComplete,
    handleStart,
    handleMove,
    handleEnd,
    handleCardClick,
    handleRestart,
  } = useSwipeDeck(cards, onComplete);

  if (currentIndex >= cards.length) {
    return (
      <CompletedView
        knownCount={results.known.length}
        unknownCount={results.unknown.length}
        onRestart={handleRestart}
        className={className}
      />
    );
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressText}>
          {currentIndex + 1} / {cards.length}
        </span>
      </div>
      <div className={styles.deckContainer}>
        {cards.slice(currentIndex + 1, currentIndex + 3).map((card, idx) => (
          <div
            key={card.id}
            className={styles.backgroundCard}
            style={{
              transform: `scale(${1 - (idx + 1) * 0.05}) translateY(${(idx + 1) * 8}px)`,
              zIndex: 10 - idx,
            }}
          />
        ))}
        {currentCard && (
          <ActiveCard
            card={currentCard}
            {...cardState}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onClick={handleCardClick}
          />
        )}
      </div>
      <div className={styles.actionsContainer}>
        <button
          type="button"
          className={classNames(styles.actionButton, styles.reviewButton)}
          onClick={() => handleSwipeComplete('left')}
          disabled={isAnimating}
          aria-label={t('flashcards.mark-as-need-review', undefined, {
            default: 'Mark as need review',
          })}
        >
          <span className={styles.buttonIcon}>{REVIEW_ICON}</span>
          <span className={styles.buttonText}>
            {t('flashcards.review', undefined, { default: 'Review' })}
          </span>
        </button>
        <button
          type="button"
          className={classNames(styles.actionButton, styles.knowButton)}
          onClick={() => handleSwipeComplete('right')}
          disabled={isAnimating}
          aria-label={t('flashcards.mark-as-known', undefined, { default: 'Mark as known' })}
        >
          <span className={styles.buttonIcon}>{KNOW_ICON}</span>
          <span className={styles.buttonText}>
            {t('flashcards.know', undefined, { default: 'Know' })}
          </span>
        </button>
      </div>
    </div>
  );
};

export default FlashCardDeck;
