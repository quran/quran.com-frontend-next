import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FlashCardCarousel from '.';

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
