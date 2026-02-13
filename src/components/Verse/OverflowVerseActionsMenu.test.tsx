import React from 'react';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Track PopoverMenu props to assert isOpen state changes
const popoverMenuProps = vi.hoisted(() => ({ current: {} as any }));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('../QuranReader/TranslationView/TranslationViewCell.module.scss', () => ({
  default: {},
}));

vi.mock('./OverflowVerseActionsMenuBody.module.scss', () => ({
  default: {},
}));

vi.mock('@/dls/Button/Button', () => ({
  default: ({ children, ...props }: any) => (
    <button data-testid={props['data-testid'] || 'button'} {...props}>
      {children}
    </button>
  ),
  ButtonShape: { Circle: 'circle' },
  ButtonSize: { Small: 'small' },
  ButtonVariant: { Ghost: 'ghost' },
}));

vi.mock('@/dls/IconContainer/IconContainer', () => ({
  default: ({ children }: any) => <div data-testid="icon-container">{children}</div>,
  IconColor: { tertiary: 'tertiary' },
  IconSize: { Custom: 'Custom' },
}));

vi.mock('@/dls/PopoverMenu/PopoverMenu', () => ({
  default: ({ children, trigger, isOpen, onOpenChange, ...rest }: any) => {
    // Store props so tests can inspect them
    popoverMenuProps.current = { isOpen, onOpenChange, ...rest };
    return (
      <div data-testid="popover-menu" data-is-open={isOpen}>
        <div
          data-testid="popover-trigger"
          onClick={() => onOpenChange?.(!isOpen)}
          onKeyDown={() => {}}
          role="button"
          tabIndex={0}
        >
          {trigger}
        </div>
        {isOpen && <div data-testid="popover-content">{children}</div>}
      </div>
    );
  },
}));

vi.mock('@/dls/Spinner/Spinner', () => ({
  default: () => <div data-testid="spinner" />,
}));

vi.mock('@/icons/menu_more_horiz.svg', () => ({
  default: () => <div data-testid="menu-icon" />,
}));

vi.mock('@/utils/eventLogger', () => ({
  logEvent: vi.fn(),
}));

// Mock the dynamically imported OverflowVerseActionsMenuBody
vi.mock('./OverflowVerseActionsMenuBody', () => ({
  default: ({ onActionTriggered }: any) => (
    <div data-testid="menu-body">
      <button data-testid="action-button" onClick={() => onActionTriggered?.()}>
        Action
      </button>
    </div>
  ),
}));

// Mock next/dynamic to render the mocked component synchronously
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<any>, _options?: any) => {
    let Comp: React.ComponentType<any> | null = null;
    importFn().then((mod) => {
      Comp = mod.default;
    });
    // eslint-disable-next-line react/display-name
    return (props: any) => {
      if (!Comp) return <div data-testid="spinner" />;
      return <Comp {...props} />;
    };
  },
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

describe('OverflowVerseActionsMenu', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    popoverMenuProps.current = {};
  });

  it('renders the popover menu trigger button', async () => {
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} />);
    expect(screen.getByTestId('verse-actions-more')).toBeDefined();
  });

  it('initializes with popover closed (isOpen=false)', async () => {
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} />);
    expect(screen.getByTestId('popover-menu').getAttribute('data-is-open')).toBe('false');
  });

  it('opens popover when trigger is clicked', async () => {
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} />);

    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(screen.getByTestId('popover-menu').getAttribute('data-is-open')).toBe('true');
  });

  it('closes popover when an action is triggered', async () => {
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} />);

    // Open the popover first
    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(screen.getByTestId('popover-menu').getAttribute('data-is-open')).toBe('true');

    // Wait for the dynamically loaded menu body to render
    await waitFor(() => {
      expect(screen.getByTestId('action-button')).toBeDefined();
    });

    // Click an action inside the menu body
    fireEvent.click(screen.getByTestId('action-button'));

    // Popover should now be closed
    expect(screen.getByTestId('popover-menu').getAttribute('data-is-open')).toBe('false');
  });

  it('calls external onActionTriggered callback when action is triggered', async () => {
    const onActionTriggered = vi.fn();
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(
      <OverflowVerseActionsMenu verse={mockVerse} onActionTriggered={onActionTriggered} />,
    );

    // Open the popover
    fireEvent.click(screen.getByTestId('popover-trigger'));

    // Wait for the dynamically loaded menu body to render
    await waitFor(() => {
      expect(screen.getByTestId('action-button')).toBeDefined();
    });

    // Click an action
    fireEvent.click(screen.getByTestId('action-button'));

    expect(onActionTriggered).toHaveBeenCalledTimes(1);
  });

  it('closes popover even without external onActionTriggered', async () => {
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} />);

    // Open, then trigger action without external callback
    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(screen.getByTestId('popover-menu').getAttribute('data-is-open')).toBe('true');

    // Wait for the dynamically loaded menu body to render
    await waitFor(() => {
      expect(screen.getByTestId('action-button')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('action-button'));
    expect(screen.getByTestId('popover-menu').getAttribute('data-is-open')).toBe('false');
  });

  it('logs open/close events via onOpenChange', async () => {
    const { logEvent } = await import('@/utils/eventLogger');
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} isTranslationView />);

    // Open
    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(logEvent).toHaveBeenCalledWith('translation_view_verse_actions_menu_open');

    // Close via trigger
    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(logEvent).toHaveBeenCalledWith('translation_view_verse_actions_menu_close');
  });

  it('logs close event when popover closes via action trigger', async () => {
    const { logEvent } = await import('@/utils/eventLogger');
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} isTranslationView />);

    // Open the popover
    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(logEvent).toHaveBeenCalledWith('translation_view_verse_actions_menu_open');

    // Wait for the dynamically loaded menu body to render
    await waitFor(() => {
      expect(screen.getByTestId('action-button')).toBeDefined();
    });

    // Close via action (not via trigger)
    fireEvent.click(screen.getByTestId('action-button'));
    expect(logEvent).toHaveBeenCalledWith('translation_view_verse_actions_menu_close');
  });

  it('logs reading_view events when isTranslationView is false', async () => {
    const { logEvent } = await import('@/utils/eventLogger');
    const { default: OverflowVerseActionsMenu } = await import('./OverflowVerseActionsMenu');
    render(<OverflowVerseActionsMenu verse={mockVerse} isTranslationView={false} />);

    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(logEvent).toHaveBeenCalledWith('reading_view_verse_actions_menu_open');
  });
});
