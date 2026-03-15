/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DonatePopup from './DonatePopup';
import { getCurrentRamadanDonationPopupAyah } from './ramadanDonationPopupAyah';
import { DONATION_POPUP_HIDE_DURATION_MS } from './utils';

import {
  setDonationPopupHiddenUntilMs,
  setDonationPopupPermanentlyDismissed,
} from '@/redux/slices/fundraisingBanner';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

let mockVerseAndTranslationProps: Record<string, unknown> | null = null;

const translations = new Map<string, string>([
  ['close', 'Close'],
  ['ramadan-donation-popup.title', 'Dear Companion of the Quran,'],
  ['ramadan-donation-popup.subtitle.start', 'Help Millions Connect with the Quran.'],
  ['ramadan-donation-popup.subtitle.end', 'Share in the Reward.'],
  ['ramadan-donation-popup.learn-more', 'Learn more'],
  ['ramadan-donation-popup.next-ayah', 'Check back tomorrow for the next ayah'],
  ['ramadan-donation-popup.month-raised', '/month raised'],
  ['ramadan-donation-popup.month-goal', '/month goal'],
  ['ramadan-donation-popup.goal-label', 'Alhumdulillah, Ramadan Goal Reached!'],
  ['ramadan-donation-popup.extended-goal-label', 'Annual Goal'],
  ['ramadan-donation-popup.donate-now', 'Donate Now'],
  ['ramadan-donation-popup.dont-show-again', 'Don’t show this again'],
]);

vi.mock('next/router', () => ({
  useRouter: () => (globalThis as any).mockRouter,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    lang: (globalThis as any).mockRouter?.locale ?? 'en',
    t: (key: string) => translations.get(key) ?? key,
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => (globalThis as any).mockDispatch,
  useSelector: (selector: (state: any) => any) => selector((globalThis as any).mockReduxState),
}));

vi.mock('swr/immutable', () => ({
  default: () => (globalThis as any).mockDonationOverviewResult,
}));

vi.mock('@radix-ui/react-dialog', () => ({
  Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Description: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('./ramadanDonationPopupAyah', () => ({
  default: vi.fn(() => ({
    chapter: 2,
    verse: 261,
    verseKey: '2:261',
  })),
  getCurrentRamadanDonationPopupAyah: vi.fn(() => ({
    chapter: 2,
    verse: 261,
    verseKey: '2:261',
  })),
}));

vi.mock('@/utils/apiPaths', () => ({
  makeDonateUrl: () => 'https://donate.quran.foundation/learn',
  makeDonatePageUrl: () => 'https://donate.quran.foundation/donate',
}));

vi.mock('@/utils/chapter', () => ({
  getAllChaptersData: vi.fn(() =>
    Promise.resolve({
      2: {
        transliteratedName: 'Al-Baqarah',
      },
    }),
  ),
  getChapterData: vi.fn((chaptersData, id) => chaptersData?.[id]),
}));

vi.mock('@/redux/defaultSettings/util', () => ({
  getTranslationsInitialState: vi.fn((locale = 'en') => ({
    selectedTranslations: locale === 'ar' ? [] : [131],
    isUsingDefaultTranslations: true,
  })),
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock('@/dls/ContentModal/ContentModal', () => ({
  default: (props: { children: React.ReactNode; isOpen: boolean }) => {
    (globalThis as any).mockModalProps = props;

    return props.isOpen ? <div data-testid="content-modal">{props.children}</div> : null;
  },
}));

vi.mock('@/dls/Button/Button', () => ({
  default: ({
    children,
    href,
    onClick,
    isNewTab,
    className,
  }: {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    isNewTab?: boolean;
    className?: string;
  }) =>
    href ? (
      <a
        href={href}
        target={isNewTab ? '_blank' : undefined}
        rel={isNewTab ? 'noreferrer' : undefined}
        onClick={onClick}
        className={className}
      >
        {children}
      </a>
    ) : (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    ),
  ButtonSize: {
    Large: 'large',
  },
  ButtonType: {
    Primary: 'primary',
  },
}));

vi.mock('@/components/dls/Skeleton/Skeleton', () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock('@/hooks/useVerseAndTranslation', () => ({
  default: () => ({
    data: {
      verses: [
        {
          verseKey: '2:261',
          textUthmani: 'Arabic verse',
          translations: [
            {
              languageId: 38,
              text: 'Verse translation',
            },
          ],
        },
      ],
    },
  }),
}));

vi.mock('@/components/Verse/VerseAndTranslation', () => ({
  default: (props: Record<string, unknown>) => {
    mockVerseAndTranslationProps = props;

    return <div data-testid="verse-and-translation" />;
  },
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg />,
}));

describe('DonatePopup', () => {
  const fixedNow = new Date(2026, 2, 10, 12, 0, 0).getTime();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow);
    (globalThis as any).mockDispatch = vi.fn();
    (globalThis as any).mockRouter = {
      pathname: '/[chapterId]',
      asPath: '/2',
      locale: 'en',
    };
    (globalThis as any).mockReduxState = {
      fundraisingBanner: {
        isHomepageBannerVisible: true,
        donationPopup: {
          hiddenUntilMs: null,
          permanentlyDismissed: false,
        },
      },
    };
    (globalThis as any).mockDonationOverviewResult = {
      data: undefined,
      error: undefined,
    };
    (globalThis as any).mockModalProps = null;
    mockVerseAndTranslationProps = null;
  });

  it('renders the popup, logs an impression, and shows loading placeholders while the overview loads', () => {
    render(<DonatePopup />);

    expect(screen.queryByTestId('ramadan-donation-popup')).not.toBeNull();
    expect(screen.queryByTestId('verse-and-translation')).not.toBeNull();
    expect(screen.queryByTestId('ramadan-donation-popup-progress')).not.toBeNull();
    expect(screen.queryByTestId('ramadan-donation-popup-progress-fill')).toBeNull();
    expect((globalThis as any).mockModalProps.shouldCloseOnOutsideClick).toBe(false);
    expect(logEvent).toHaveBeenCalledWith('ramadan_donation_popup_impression', {
      pathname: '/2',
      locale: 'en',
      isReaderRoute: true,
    });
    expect(mockVerseAndTranslationProps?.shouldShowReference).toBe(true);
  });

  it('does not dismiss the popup when escape is pressed', () => {
    render(<DonatePopup />);

    const preventDefault = vi.fn();
    (globalThis as any).mockModalProps.onEscapeKeyDown({ preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(logButtonClick).not.toHaveBeenCalledWith(
      'ramadan_donation_popup_close',
      expect.anything(),
    );
    expect((globalThis as any).mockDispatch).not.toHaveBeenCalledWith(
      setDonationPopupHiddenUntilMs(expect.any(Number)),
    );
  });

  it('hides the popup verse reference for the Arabic locale', () => {
    (globalThis as any).mockRouter = {
      pathname: '/[chapterId]',
      asPath: '/ar/2',
      locale: 'ar',
    };

    render(<DonatePopup />);

    expect(mockVerseAndTranslationProps?.shouldShowReference).toBe(false);
  });

  it('renders the annual track and Ramadan milestone before the milestone is reached', () => {
    (globalThis as any).mockDonationOverviewResult = {
      data: {
        totalAmount: 12_500,
        numberOfRecurringPlans: 42,
      },
      error: undefined,
    };

    render(<DonatePopup />);

    expect(
      Number.parseFloat(screen.getByTestId('ramadan-donation-popup-progress-fill').style.width),
    ).toBeCloseTo(41.666666666666664);
    expect(screen.queryByText('Alhumdulillah, Ramadan Goal Reached!')).not.toBeNull();
    expect(screen.queryByText('Annual Goal')).not.toBeNull();
    expect(screen.queryByText('$30,000')).not.toBeNull();
    expect(screen.queryByTestId('ramadan-donation-popup-progress-goal-marker')).not.toBeNull();
    expect(screen.queryByTestId('ramadan-donation-popup-progress-overflow-fill')).toBeNull();
  });

  it('renders the extended goal state once donations pass the Ramadan goal', () => {
    (globalThis as any).mockDonationOverviewResult = {
      data: {
        totalAmount: 20_252,
        numberOfRecurringPlans: 42,
      },
      error: undefined,
    };

    render(<DonatePopup />);

    expect(
      Number.parseFloat(screen.getByTestId('ramadan-donation-popup-progress-fill').style.width),
    ).toBeCloseTo(66.66666666666666);
    expect(screen.queryByTestId('ramadan-donation-popup-progress-overflow-fill')).not.toBeNull();
    expect(screen.queryByTestId('ramadan-donation-popup-progress-goal-marker')).not.toBeNull();
    expect(screen.queryByText('Alhumdulillah, Ramadan Goal Reached!')).not.toBeNull();
    expect(screen.queryByText('Annual Goal')).not.toBeNull();
    expect(screen.queryByText('$30,000')).not.toBeNull();
  });

  it('keeps the popup visible and hides the progress row when the donation overview fails', () => {
    (globalThis as any).mockDonationOverviewResult = {
      data: undefined,
      error: new Error('boom'),
    };

    render(<DonatePopup />);

    expect(screen.queryByTestId('ramadan-donation-popup')).not.toBeNull();
    expect(screen.queryByTestId('ramadan-donation-popup-progress')).toBeNull();
  });

  it('dispatches a 24 hour suppression when the close button is clicked', () => {
    render(<DonatePopup />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(logButtonClick).toHaveBeenCalledWith('ramadan_donation_popup_close', {
      pathname: '/2',
      locale: 'en',
      isReaderRoute: true,
    });
    expect((globalThis as any).mockDispatch).toHaveBeenCalledWith(
      setDonationPopupHiddenUntilMs(fixedNow + DONATION_POPUP_HIDE_DURATION_MS),
    );
  });

  it('dispatches permanent dismissal when the secondary action is clicked', () => {
    render(<DonatePopup />);

    fireEvent.click(screen.getByRole('button', { name: 'Don’t show this again' }));

    expect(logButtonClick).toHaveBeenCalledWith('ramadan_donation_popup_dont_show_again', {
      pathname: '/2',
      locale: 'en',
      isReaderRoute: true,
    });
    expect((globalThis as any).mockDispatch).toHaveBeenCalledWith(
      setDonationPopupPermanentlyDismissed(true),
    );
  });

  it('tracks learn more and donate clicks and opens both links in new tabs', () => {
    render(<DonatePopup />);

    const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });
    const donateLink = screen.getByRole('link', { name: 'Donate Now' });

    expect(learnMoreLink.getAttribute('href')).toBe('https://donate.quran.foundation/learn');
    expect(learnMoreLink.getAttribute('target')).toBe('_blank');
    expect(donateLink.getAttribute('href')).toBe('https://donate.quran.foundation/donate');
    expect(donateLink.getAttribute('target')).toBe('_blank');

    fireEvent.click(learnMoreLink);
    fireEvent.click(donateLink);

    expect(logButtonClick).toHaveBeenCalledWith('ramadan_donation_popup_learn_more', {
      pathname: '/2',
      locale: 'en',
      isReaderRoute: true,
    });
    expect(logButtonClick).toHaveBeenCalledWith('ramadan_donation_popup_donate', {
      pathname: '/2',
      locale: 'en',
      isReaderRoute: true,
    });
  });

  it('renders the subtitle as two separate lines', () => {
    render(<DonatePopup />);

    const secondaryLine = screen.getByTestId('ramadan-donation-popup-subtitle-secondary-line');

    expect(screen.getByText('Help Millions Connect with the Quran.')).not.toBeNull();
    expect(secondaryLine.textContent).toBe('Share in the Reward. Learn more');
  });

  it('does not render on embed pages', () => {
    (globalThis as any).mockRouter = {
      pathname: '/embed/index',
      asPath: '/embed',
      locale: 'en',
    };

    render(<DonatePopup />);

    expect(screen.queryByTestId('ramadan-donation-popup')).toBeNull();
  });

  it('resolves the verse of the day for the popup', () => {
    render(<DonatePopup />);

    expect(getCurrentRamadanDonationPopupAyah).toHaveBeenCalled();
    expect(mockVerseAndTranslationProps).toMatchObject({
      chapter: 2,
      from: 261,
      to: 261,
      translationIds: [131],
      shouldShowReference: true,
      shouldLinkReference: false,
    });
  });
});
