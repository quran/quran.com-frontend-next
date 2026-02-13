import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-redux', () => ({
  useSelector: () => false, // selectStudyModeIsOpen returns false
}));

vi.mock('../PinVerseAction', () => ({
  default: ({ onActionTriggered }: any) => (
    <button data-testid="pin-verse-action" onClick={() => onActionTriggered?.()}>
      Pin
    </button>
  ),
}));

vi.mock('../TranslationFeedback/TranslationFeedbackAction', () => ({
  default: ({ onActionTriggered }: any) => (
    <button data-testid="translation-feedback-action" onClick={() => onActionTriggered?.()}>
      Feedback
    </button>
  ),
}));

vi.mock('../VerseActionAdvancedCopy', () => ({
  default: ({ onActionTriggered }: any) => (
    <button data-testid="advanced-copy-action" onClick={() => onActionTriggered?.()}>
      Copy
    </button>
  ),
}));

vi.mock('../VerseActionEmbedWidget', () => ({
  default: ({ onActionTriggered }: any) => (
    <button data-testid="embed-widget-action" onClick={() => onActionTriggered?.()}>
      Embed
    </button>
  ),
}));

vi.mock('../VerseActionRepeatAudio', () => ({
  default: ({ onActionTriggered }: any) => (
    <button data-testid="repeat-audio-action" onClick={() => onActionTriggered?.()}>
      Repeat
    </button>
  ),
}));

vi.mock('./ShareVerseActionsMenu', () => ({
  default: ({ onActionTriggered }: any) => (
    <button data-testid="share-actions-menu" onClick={() => onActionTriggered?.()}>
      Share
    </button>
  ),
}));

vi.mock('@/components/QuranReader/ReadingView/WordActionsMenu/types', () => ({
  default: { Main: 'main', Share: 'share' },
}));

vi.mock('@/components/QuranReader/ReadingView/WordByWordVerseAction', () => ({
  default: ({ onActionTriggered }: any) => (
    <button data-testid="word-by-word-action" onClick={() => onActionTriggered?.()}>
      Word by Word
    </button>
  ),
}));

vi.mock('@/redux/slices/QuranReader/studyMode', () => ({
  selectStudyModeIsOpen: () => false,
}));

const mockVerse = {
  verseKey: '1:1',
  verseNumber: 1,
  hizbNumber: 1,
  rubElHizbNumber: 1,
  juzNumber: 1,
  pageNumber: 1,
  chapterId: 1,
  verseIndex: 0,
  words: [],
  textUthmani: '',
  textImlaeiSimple: '',
} as any;

describe('OverflowVerseActionsMenuBody', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders all action components', async () => {
    const { default: OverflowVerseActionsMenuBody } = await import('./index');
    render(
      <OverflowVerseActionsMenuBody verse={mockVerse} isTranslationView />,
    );

    expect(screen.getByTestId('pin-verse-action')).toBeDefined();
    expect(screen.getByTestId('advanced-copy-action')).toBeDefined();
    expect(screen.getByTestId('word-by-word-action')).toBeDefined();
    expect(screen.getByTestId('repeat-audio-action')).toBeDefined();
    expect(screen.getByTestId('translation-feedback-action')).toBeDefined();
    expect(screen.getByTestId('embed-widget-action')).toBeDefined();
  });

  it('passes onActionTriggered to PinVerseAction', async () => {
    const onActionTriggered = vi.fn();
    const { default: OverflowVerseActionsMenuBody } = await import('./index');
    render(
      <OverflowVerseActionsMenuBody
        verse={mockVerse}
        isTranslationView
        onActionTriggered={onActionTriggered}
      />,
    );

    fireEvent.click(screen.getByTestId('pin-verse-action'));
    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });

  it('passes onActionTriggered to VerseActionAdvancedCopy', async () => {
    const onActionTriggered = vi.fn();
    const { default: OverflowVerseActionsMenuBody } = await import('./index');
    render(
      <OverflowVerseActionsMenuBody
        verse={mockVerse}
        isTranslationView
        onActionTriggered={onActionTriggered}
      />,
    );

    fireEvent.click(screen.getByTestId('advanced-copy-action'));
    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });

  it('passes onActionTriggered to WordByWordVerseAction', async () => {
    const onActionTriggered = vi.fn();
    const { default: OverflowVerseActionsMenuBody } = await import('./index');
    render(
      <OverflowVerseActionsMenuBody
        verse={mockVerse}
        isTranslationView
        onActionTriggered={onActionTriggered}
      />,
    );

    fireEvent.click(screen.getByTestId('word-by-word-action'));
    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });

  it('passes onActionTriggered to VerseActionRepeatAudio', async () => {
    const onActionTriggered = vi.fn();
    const { default: OverflowVerseActionsMenuBody } = await import('./index');
    render(
      <OverflowVerseActionsMenuBody
        verse={mockVerse}
        isTranslationView
        onActionTriggered={onActionTriggered}
      />,
    );

    fireEvent.click(screen.getByTestId('repeat-audio-action'));
    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });

  it('passes onActionTriggered to TranslationFeedbackAction', async () => {
    const onActionTriggered = vi.fn();
    const { default: OverflowVerseActionsMenuBody } = await import('./index');
    render(
      <OverflowVerseActionsMenuBody
        verse={mockVerse}
        isTranslationView
        onActionTriggered={onActionTriggered}
      />,
    );

    fireEvent.click(screen.getByTestId('translation-feedback-action'));
    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });

  it('passes onActionTriggered to VerseActionEmbedWidget', async () => {
    const onActionTriggered = vi.fn();
    const { default: OverflowVerseActionsMenuBody } = await import('./index');
    render(
      <OverflowVerseActionsMenuBody
        verse={mockVerse}
        isTranslationView
        onActionTriggered={onActionTriggered}
      />,
    );

    fireEvent.click(screen.getByTestId('embed-widget-action'));
    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });
});
