import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LessonQuiz from '.';

vi.mock('@/icons/check.svg', () => ({
  default: () => <div data-testid="check-icon" />,
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <div data-testid="close-icon" />,
}));

describe('LessonQuiz', () => {
  afterEach(cleanup);

  const singleQuestion = {
    id: 'q1',
    question: 'What is the answer?',
    options: [
      { id: 'a', text: 'Option A' },
      { id: 'b', text: 'Option B' },
      { id: 'c', text: 'Option C' },
      { id: 'd', text: 'Option D' },
    ],
    correctOptionId: 'a',
  };

  it('keeps shuffled option order stable for the same lesson and question', () => {
    const { unmount } = render(
      <LessonQuiz lessonSlug="lesson-slug" title="Question on Ayah 1" question={singleQuestion} />,
    );
    const firstRenderOrder = screen
      .getAllByRole('button')
      .map((button) => button.textContent?.trim() || '');

    unmount();

    render(
      <LessonQuiz lessonSlug="lesson-slug" title="Question on Ayah 1" question={singleQuestion} />,
    );
    const secondRenderOrder = screen
      .getAllByRole('button')
      .map((button) => button.textContent?.trim() || '');

    expect(secondRenderOrder).toEqual(firstRenderOrder);
  });

  it('does not render a score summary after answering', () => {
    render(
      <LessonQuiz lessonSlug="lesson-slug" title="Question on Ayah 1" question={singleQuestion} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }));
    expect(screen.queryByText(/You got/)).toBeNull();
  });

  it('shows answer result icons after answering', () => {
    render(
      <LessonQuiz lessonSlug="lesson-slug" title="Question on Ayah 1" question={singleQuestion} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }));
    expect(screen.getByTestId('close-icon')).toBeDefined();
    expect(screen.getByTestId('check-icon')).toBeDefined();
  });
});
