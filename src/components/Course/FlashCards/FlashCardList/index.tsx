import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

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

const MASTERED_ICON = '\u2713';
const EXPANDED_ICON = '\u25b2';
const COLLAPSED_ICON = '\u25bc';

const FlashCardList: React.FC<FlashCardListProps> = ({
  cards,
  expandedCards,
  masteredCards,
  onToggleExpand,
  onToggleMastered,
  className,
}) => {
  const { t } = useTranslation('learn');

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
                    aria-label={
                      isMastered
                        ? t('flashcards.mark-as-not-mastered', undefined, {
                            default: 'Mark as not mastered',
                          })
                        : t('flashcards.mark-as-mastered', undefined, {
                            default: 'Mark as mastered',
                          })
                    }
                  >
                    {isMastered ? MASTERED_ICON : null}
                  </button>
                  <span className={styles.expandIcon}>
                    {isExpanded ? EXPANDED_ICON : COLLAPSED_ICON}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.cardBody}>
                  <div className={styles.translation}>
                    <span className={styles.translationLabel}>
                      {t('flashcards.translation-label', undefined, { default: 'Translation:' })}
                    </span>{' '}
                    {card.translation}
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
