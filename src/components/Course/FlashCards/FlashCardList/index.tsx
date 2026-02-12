/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';

import classNames from 'classnames';

import styles from './FlashCardList.module.scss';

import { FlashCardData } from '@/components/Course/FlashCards/types';

type FlashCardListProps = {
  cards: FlashCardData[];
  className?: string;
};

const toggleInSet = <T,>(set: Set<T>, item: T) => {
  const nextSet = new Set(set);
  if (nextSet.has(item)) nextSet.delete(item);
  else nextSet.add(item);
  return nextSet;
};

const FlashCardList: React.FC<FlashCardListProps> = ({ cards, className }) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  const toggleExpand = (cardId: string) => {
    setExpandedCards((prev) => toggleInSet(prev, cardId));
  };

  const toggleMastered = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredCards((prev) => toggleInSet(prev, cardId));
  };

  const expandAll = () => {
    setExpandedCards(new Set(cards.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  const masteredCount = masteredCards.size;
  const totalCount = cards.length;

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.header}>
        <div className={styles.progressInfo}>
          <span className={styles.masteredCount}>
            {masteredCount} / {totalCount}
          </span>
          <span className={styles.masteredLabel}>mastered</span>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.headerButton} onClick={expandAll}>
            Expand All
          </button>
          <button type="button" className={styles.headerButton} onClick={collapseAll}>
            Collapse All
          </button>
        </div>
      </div>

      <div className={styles.cardsList}>
        {cards.map((card, index) => {
          const isExpanded = expandedCards.has(card.id);
          const isMastered = masteredCards.has(card.id);

          return (
            <div
              key={card.id}
              className={classNames(styles.cardItem, {
                [styles.expanded]: isExpanded,
                [styles.mastered]: isMastered,
              })}
              onClick={() => toggleExpand(card.id)}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleExpand(card.id);
                }
              }}
              role="button"
              tabIndex={0}
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
                    onClick={(e) => toggleMastered(card.id, e)}
                    aria-label={isMastered ? 'Mark as not mastered' : 'Mark as mastered'}
                  >
                    {isMastered ? '✓' : '○'}
                  </button>
                  <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.cardBody}>
                  <div className={styles.translationLabel}>Translation:</div>
                  <div className={styles.translation}>{card.translation}</div>
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
