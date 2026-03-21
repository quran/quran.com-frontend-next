import React from 'react';

import { render, screen } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import NavigationDrawerBody from '.';

import { makeDonatePageUrl } from '@/utils/apiPaths';

vi.mock('next/dynamic', () => ({
  default: () => {
    const Stub = () => <div data-testid="theme-switcher-stub" />;
    return Stub;
  },
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => {
      if (key === 'fundraising.title') return 'Become A Monthly Donor';
      return key;
    },
    lang: 'en',
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

vi.mock('../NavigationDrawerList', () => ({
  default: () => <div data-testid="navigation-drawer-list-stub" />,
}));

vi.mock('@/icons/globe.svg', () => ({
  default: () => <span data-testid="icon-globe" />,
}));

vi.mock('@/icons/diamond.svg', () => ({
  default: () => <span data-testid="icon-diamond" />,
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
  logEvent: vi.fn(),
}));

describe('NavigationDrawerBody', () => {
  it('renders the monthly donor CTA at the bottom', () => {
    vi.mocked(useDispatch).mockReturnValue(vi.fn());

    render(<NavigationDrawerBody isLanguageDrawerOpen={false} />);

    const donateLink = screen.getByRole('link', { name: 'Become A Monthly Donor' });

    expect(donateLink).toBeTruthy();
    expect(donateLink.getAttribute('href')).toBe(makeDonatePageUrl(false, true));
  });
});
