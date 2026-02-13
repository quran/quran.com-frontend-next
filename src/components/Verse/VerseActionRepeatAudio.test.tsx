import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('../AudioPlayer/RepeatAudioModal/SelectRepetitionMode', () => ({
  RepetitionMode: { Single: 'single' },
}));

vi.mock('@/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal', () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="repeat-audio-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock('@/dls/IconContainer/IconContainer', () => ({
  default: () => <div data-testid="icon-container" />,
  IconColor: { tertiary: 'tertiary' },
  IconSize: { Custom: 'Custom' },
}));

vi.mock('@/dls/PopoverMenu/PopoverMenu', () => {
  const Item = ({ children, onClick, icon }: any) => (
    <button data-testid="popover-menu-item" onClick={onClick}>
      {icon}
      {children}
    </button>
  );

  const PopoverMenu = ({ children }: any) => <div>{children}</div>;
  PopoverMenu.Item = Item;
  PopoverMenu.Divider = () => <hr />;
  return { default: PopoverMenu };
});

vi.mock('@/icons/repeat-new.svg', () => ({
  default: () => <div data-testid="repeat-icon" />,
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('@/utils/verse', () => ({
  getChapterNumberFromKey: (key: string) => Number(key.split(':')[0]),
}));

describe('VerseActionRepeatAudio', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the repeat audio menu item', async () => {
    const { default: VerseActionRepeatAudio } = await import('./VerseActionRepeatAudio');
    render(<VerseActionRepeatAudio verseKey="1:1" isTranslationView />);
    expect(screen.getByTestId('popover-menu-item')).toBeDefined();
    expect(screen.getByText('audio.player.repeat-1-verse')).toBeDefined();
  });

  it('opens the repeat audio modal when clicked', async () => {
    const { default: VerseActionRepeatAudio } = await import('./VerseActionRepeatAudio');
    render(<VerseActionRepeatAudio verseKey="1:1" isTranslationView />);

    expect(screen.queryByTestId('repeat-audio-modal')).toBeNull();

    fireEvent.click(screen.getByTestId('popover-menu-item'));

    expect(screen.getByTestId('repeat-audio-modal')).toBeDefined();
  });

  it('calls onActionTriggered when clicked', async () => {
    const onActionTriggered = vi.fn();
    const { default: VerseActionRepeatAudio } = await import('./VerseActionRepeatAudio');
    render(
      <VerseActionRepeatAudio
        verseKey="1:1"
        isTranslationView
        onActionTriggered={onActionTriggered}
      />,
    );

    fireEvent.click(screen.getByTestId('popover-menu-item'));
    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });

  it('works without onActionTriggered (optional prop)', async () => {
    const { default: VerseActionRepeatAudio } = await import('./VerseActionRepeatAudio');
    render(<VerseActionRepeatAudio verseKey="1:1" isTranslationView />);

    // Should not throw when clicking without onActionTriggered
    fireEvent.click(screen.getByTestId('popover-menu-item'));
    expect(screen.getByTestId('repeat-audio-modal')).toBeDefined();
  });

  it('logs translation_view event when isTranslationView is true', async () => {
    const { logButtonClick } = await import('@/utils/eventLogger');
    const { default: VerseActionRepeatAudio } = await import('./VerseActionRepeatAudio');
    render(<VerseActionRepeatAudio verseKey="1:1" isTranslationView />);

    fireEvent.click(screen.getByTestId('popover-menu-item'));
    expect(logButtonClick).toHaveBeenCalledWith('translation_view_verse_actions_menu_repeat');
  });

  it('logs reading_view event when isTranslationView is false', async () => {
    const { logButtonClick } = await import('@/utils/eventLogger');
    const { default: VerseActionRepeatAudio } = await import('./VerseActionRepeatAudio');
    render(<VerseActionRepeatAudio verseKey="2:255" isTranslationView={false} />);

    fireEvent.click(screen.getByTestId('popover-menu-item'));
    expect(logButtonClick).toHaveBeenCalledWith('reading_view_verse_actions_menu_repeat');
  });

  it('closes the modal when onClose is called', async () => {
    const { default: VerseActionRepeatAudio } = await import('./VerseActionRepeatAudio');
    render(<VerseActionRepeatAudio verseKey="1:1" isTranslationView />);

    // Open modal
    fireEvent.click(screen.getByTestId('popover-menu-item'));
    expect(screen.getByTestId('repeat-audio-modal')).toBeDefined();

    // Close modal
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('repeat-audio-modal')).toBeNull();
  });
});
