import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FlashCardCarousel from '.';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: { index?: number }) => {
      switch (key) {
        case 'flashcards.previous-card':
          return 'Previous card';
        case 'flashcards.carousel-aria-label':
          return 'Flashcard carousel';
        case 'flashcards.tap-to-reveal':
          return 'Tap to reveal';
        case 'flashcards.next-card':
          return 'Next card';
        case 'flashcards.go-to-card':
          return `Go to card ${params?.index}`;
        default:
          return key;
      }
    },
  }),
}));

const cards = [
  { id: 'card-1', arabic: 'وَالْعَصْرِ', transliteration: 'wal asr', translation: 'By time' },
  {
    id: 'card-2',
    arabic: 'إِنَّ الْإِنسَانَ',
    transliteration: 'innal insan',
    translation: 'Indeed mankind',
  },
];

describe('FlashCardCarousel', () => {
  it('navigates between cards', () => {
    render(<FlashCardCarousel cards={cards} />);

    expect(screen.getByText('1 / 2')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
    expect(screen.getByText('2 / 2')).toBeDefined();
  });
});
