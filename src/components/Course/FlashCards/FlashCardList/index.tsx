/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';

import styles from './FlashCardList.module.scss';

import { FlashCardData } from '@/components/Course/FlashCards/types';

type FlashCardListProps = {
  cards: FlashCardData[];
  expandedCards: Set<string>;
  masteredCards: Set<string>;
  onToggleExpand: (cardId: string) => void;
  onToggleMastered: (cardId: string) => void;
  className?: string;
};

const FlashCardList: React.FC<FlashCardListProps> = ({
  cards,
  expandedCards,
  masteredCards,
  onToggleExpand,
  onToggleMastered,
  className,
}) => {
  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.cardsList}>
        {cards.map((card, index) => {
          const isExpanded = expandedCards.has(card.id);
          const isMastered = masteredCards.has(card.id);

          return (
            <div
              key={card.id}
              className={classNames(styles.cardItem, {
                [styles.mastered]: isMastered,
              })}
              onClick={() => onToggleExpand(card.id)}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleExpand(card.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardNumber}>{index + 1}</div>
                <div className={styles.cardContent}>
                  <div className={styles.arabicText}>{card.arabic}</div>
                  {card.transliteration && (
                    <div className={styles.transliteration}>({card.transliteration})</div>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={classNames(styles.masteredButton, {
                      [styles.masteredActive]: isMastered,
                    })}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMastered(card.id);
                    }}
                    aria-label={isMastered ? 'Mark as not mastered' : 'Mark as mastered'}
                  >
                    {isMastered ? '✓' : null}
                  </button>
                  <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.cardBody}>
                  <div className={styles.translation}>
                    <span className={styles.translationLabel}>Translation:</span> {card.translation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashCardList;
