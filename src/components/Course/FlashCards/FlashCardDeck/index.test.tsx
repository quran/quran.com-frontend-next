import React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SWIPE_ANIMATION_MS } from './constants';

import FlashCardDeck from '.';

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
    fireEvent.click(
      screen.getByRole('button', { name: /flashcards\.mark-as-known|Mark as known/u }),
    );

    act(() => {
      vi.advanceTimersByTime(SWIPE_ANIMATION_MS);
    });

    expect(screen.getByText(/flashcards\.all-done|All done!/u)).toBeDefined();
    expect(onComplete).toHaveBeenCalledWith({ known: [cards[0]], unknown: [] });
  });
});
