import React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SWIPE_ANIMATION_MS } from './constants';

import FlashCardDeck from '.';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => {
      switch (key) {
        case 'flashcards.know':
          return 'Know';
        case 'flashcards.review':
          return 'Review';
        case 'flashcards.mark-as-need-review':
          return 'Mark as need review';
        case 'flashcards.mark-as-known':
          return 'Mark as known';
        case 'flashcards.tap-to-flip-swipe-to-answer':
          return 'Tap to flip and swipe to answer';
        case 'flashcards.all-done':
          return 'All done!';
        case 'flashcards.known':
          return 'Known';
        case 'flashcards.start-over':
          return 'Start Over';
        default:
          return key;
      }
    },
  }),
}));

const cards = [
  {
    id: 'card-1',
    arabic: 'ٱلرَّحْمَٰنِ',
    transliteration: 'ar-rahman',
    translation: 'The Most Merciful',
  },
];

describe('FlashCardDeck', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('completes the deck and calls onComplete', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(<FlashCardDeck cards={cards} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark as known' }));

    act(() => {
      vi.advanceTimersByTime(SWIPE_ANIMATION_MS);
    });

    expect(screen.getByText('All done!')).toBeDefined();
    expect(onComplete).toHaveBeenCalledWith({ known: [cards[0]], unknown: [] });
  });
});
