import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FlashCardList from '.';

const cards = [
  {
    id: 'card-1',
    arabic: 'الْحَمْدُ',
    transliteration: 'alhamdu',
    translation: 'All praise',
  },
];

describe('FlashCardList', () => {
  it('toggles a card and exposes expanded state', () => {
    const onToggleExpand = vi.fn();
    render(
      <FlashCardList
        cards={cards}
        expandedCards={new Set()}
        masteredCards={new Set()}
        onToggleExpand={onToggleExpand}
        onToggleMastered={vi.fn()}
      />,
    );

    const cardButton = screen.getByRole('button', { name: /الْحَمْدُ/u });
    expect(cardButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(cardButton);
    expect(onToggleExpand).toHaveBeenCalledWith('card-1');
  });
});
