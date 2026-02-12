/* eslint-disable i18next/no-literal-string */
import React, { useState, useRef, useCallback } from 'react';

import classNames from 'classnames';

import styles from './FlashCardCarousel.module.scss';

import { FlashCardData } from '@/components/Course/FlashCards/types';

type FlashCardCarouselProps = {
  cards: FlashCardData[];
  className?: string;
};

const FlashCardCarousel: React.FC<FlashCardCarouselProps> = ({ cards, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      left: index * containerRef.current.offsetWidth,
      behavior: 'smooth',
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const newIndex = Math.round(containerRef.current.scrollLeft / containerRef.current.offsetWidth);
    if (newIndex >= 0 && newIndex < cards.length) setCurrentIndex(newIndex);
  }, [cards.length]);

  const toggleFlip = useCallback((index: number) => {
    setFlippedCards((prev) => {
      const s = new Set(prev);
      if (s.has(index)) s.delete(index);
      else s.add(index);
      return s;
    });
  }, []);

  const navigate = useCallback(
    (dir: -1 | 1) => {
      if (!containerRef.current) return;
      const current = Math.round(
        containerRef.current.scrollLeft / containerRef.current.offsetWidth,
      );
      const next = current + dir;
      if (next >= 0 && next < cards.length) scrollToIndex(next);
    },
    [cards.length, scrollToIndex],
  );

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.carouselWrapper}>
        <button
          type="button"
          className={classNames(styles.navButton, styles.prevButton)}
          onClick={() => navigate(-1)}
          disabled={currentIndex === 0}
          aria-label="Previous card"
        >
          &#8249;
        </button>

        <div ref={containerRef} className={styles.carouselContainer} onScroll={handleScroll}>
          {cards.map((card, index) => (
            <div key={card.id} className={styles.slideWrapper}>
              <div
                className={classNames(styles.card, { [styles.flipped]: flippedCards.has(index) })}
                onClick={() => toggleFlip(index)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    navigate(document.documentElement.dir === 'rtl' ? 1 : -1);
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    navigate(document.documentElement.dir === 'rtl' ? -1 : 1);
                  } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFlip(index);
                  }
                }}
                role="button"
                tabIndex={index === currentIndex ? 0 : -1}
              >
                <div className={styles.cardInner}>
                  <div className={styles.cardFront}>
                    <div className={styles.arabicText}>{card.arabic}</div>
                    {card.transliteration && (
                      <div className={styles.transliteration}>({card.transliteration})</div>
                    )}
                    <div className={styles.hint}>Tap to reveal</div>
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
          ))}
        </div>

        <button
          type="button"
          className={classNames(styles.navButton, styles.nextButton)}
          onClick={() => navigate(1)}
          disabled={currentIndex === cards.length - 1}
          aria-label="Next card"
        >
          &#8250;
        </button>
      </div>

      <div className={styles.dotsContainer}>
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className={classNames(styles.dot, { [styles.activeDot]: index === currentIndex })}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to card ${index + 1}`}
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
