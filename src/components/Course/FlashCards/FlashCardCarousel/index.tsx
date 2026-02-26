import React, { useState, useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './FlashCardCarousel.module.scss';

import { FlashCardData } from '@/components/Course/FlashCards/types';

type FlashCardCarouselProps = {
  cards: FlashCardData[];
  className?: string;
};

const FlashCardCarousel: React.FC<FlashCardCarouselProps> = ({ cards, className }) => {
  const { t } = useTranslation('learn');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleFlip = useCallback((index: number) => {
    setFlippedCards((prev) => {
      const s = new Set(prev);
      if (s.has(index)) s.delete(index);
      else s.add(index);
      return s;
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= cards.length || index === currentIndex) return;
      setSlideDir(index > currentIndex ? 'next' : 'prev');
      setCurrentIndex(index);
    },
    [currentIndex, cards.length],
  );

  const card = cards[currentIndex];

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.carouselWrapper}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label={t('flashcards.previous-card')}
        >
          &#8249;
        </button>

        <div
          className={styles.carouselContainer}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              const dir = e.key === 'ArrowLeft' ? -1 : 1;
              goTo(currentIndex + (document.documentElement.dir === 'rtl' ? -dir : dir));
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleFlip(currentIndex);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={t('flashcards.carousel-aria-label')}
        >
          <div
            key={currentIndex}
            className={classNames(styles.card, {
              [styles.flipped]: flippedCards.has(currentIndex),
              [styles.slideNext]: slideDir === 'next',
              [styles.slidePrev]: slideDir === 'prev',
            })}
            onClick={() => toggleFlip(currentIndex)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFlip(currentIndex);
              }
            }}
            role="button"
            tabIndex={-1}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <div className={styles.arabicText}>{card.arabic}</div>
                {card.transliteration && (
                  <div className={styles.transliteration}>({card.transliteration})</div>
                )}
                <div className={styles.hint}>{t('flashcards.tap-to-reveal')}</div>
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
        </div>

        <button
          type="button"
          className={styles.navButton}
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === cards.length - 1}
          aria-label={t('flashcards.next-card')}
        >
          &#8250;
        </button>
      </div>

      <div className={styles.dotsContainer}>
        {cards.map((c, index) => (
          <button
            key={c.id}
            type="button"
            className={classNames(styles.dot, { [styles.activeDot]: index === currentIndex })}
            onClick={() => goTo(index)}
            aria-label={t('flashcards.go-to-card', { index: index + 1 })}
          />
        ))}
      </div>

      <div className={styles.counter}>
        {currentIndex + 1} / {cards.length}
      </div>
    </div>
  );
};

export default FlashCardCarousel;
