import React, { useState, useRef, useCallback } from 'react';

import { FlashCardData } from '@/components/Course/FlashCards/types';

type SwipeDirection = 'left' | 'right' | null;

const SWIPE_THRESHOLD = 100;
const DEFAULT_CARD = { isFlipped: false, isSwiping: false, offsetX: 0, offsetY: 0, rotation: 0 };

const getClientPos = (e: React.TouchEvent | React.MouseEvent) => {
  const src = 'touches' in e ? e.touches[0] : e;
  return { x: src.clientX, y: src.clientY };
};

export default function useSwipeDeck(
  cards: FlashCardData[],
  onComplete?: (r: { known: FlashCardData[]; unknown: FlashCardData[] }) => void,
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState(DEFAULT_CARD);
  const [results, setResults] = useState<{ known: FlashCardData[]; unknown: FlashCardData[] }>({
    known: [],
    unknown: [],
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex / cards.length) * 100).toFixed(0) : '0';

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      if (!currentCard || isAnimating) return;
      setIsAnimating(true);
      const nr = { known: [...results.known], unknown: [...results.unknown] };
      if (direction === 'right') nr.known.push(currentCard);
      else nr.unknown.push(currentCard);
      setResults(nr);
      const sign = direction === 'right' ? 1 : -1;
      setCardState((prev) => ({ ...prev, offsetX: sign * 500, rotation: sign * 30 }));
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setCardState(DEFAULT_CARD);
        setIsAnimating(false);
        if (currentIndex + 1 >= cards.length && onComplete) onComplete(nr);
      }, 300);
    },
    [currentCard, currentIndex, cards.length, results, onComplete, isAnimating],
  );

  const handleStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (isAnimating) return;
      startPos.current = getClientPos(e);
      isDragging.current = true;
      setCardState((prev) => ({ ...prev, isSwiping: true }));
    },
    [isAnimating],
  );

  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging.current || isAnimating) return;
      const { x, y } = getClientPos(e);
      const deltaX = x - startPos.current.x;
      setCardState((prev) => ({
        ...prev,
        offsetX: deltaX,
        offsetY: (y - startPos.current.y) * 0.3,
        rotation: deltaX * 0.1,
      }));
    },
    [isAnimating],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (Math.abs(cardState.offsetX) > SWIPE_THRESHOLD) {
      handleSwipeComplete(cardState.offsetX > 0 ? 'right' : 'left');
    } else {
      setCardState(DEFAULT_CARD);
    }
  }, [cardState.offsetX, handleSwipeComplete]);

  const handleCardClick = () => {
    if (!cardState.isSwiping && Math.abs(cardState.offsetX) < 5) {
      setCardState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setResults({ known: [], unknown: [] });
    setCardState(DEFAULT_CARD);
  };

  return {
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
  };
}
