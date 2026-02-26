/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { useSWRImmutableMock, bannerMock, dispatchMock } = vi.hoisted(() => ({
  useSWRImmutableMock: vi.fn(),
  bannerMock: vi.fn((props: Record<string, unknown>) => (
    <div data-testid="mock-banner">{String(props.text || '')}</div>
  )),
  dispatchMock: vi.fn(),
}));

vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <div data-testid="mock-dynamic-component" />,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/home',
    asPath: '/home',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
    lang: 'fr',
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

vi.mock('swr/immutable', () => ({
  __esModule: true,
  default: useSWRImmutableMock,
}));

vi.mock('@/api', () => ({
  getUiSection: vi.fn(),
}));

vi.mock('./ProfileAvatarButton', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-profile-avatar-button" />,
}));

vi.mock('@/components/Navbar/Logo/NavbarLogoWrapper', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-navbar-logo" />,
}));

vi.mock('@/components/Banner/Banner', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => bannerMock(props),
}));

vi.mock('@/dls/Button/Button', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const children = props.children as React.ReactNode;
    const onClick = props.onClick as (() => void) | undefined;
    const dataTestId = props['data-testid'] as string | undefined;

    return (
      <button type="button" data-testid={dataTestId} onClick={onClick}>
        {children}
      </button>
    );
  },
  ButtonShape: { Circle: 'circle' },
  ButtonVariant: { Ghost: 'ghost' },
}));

vi.mock('@/dls/Spinner/Spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-spinner" />,
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  __esModule: true,
  default: () => ({ isLoggedIn: false }),
}));

vi.mock('@/hooks/useNavbarDrawerActions', () => ({
  __esModule: true,
  default: () => ({
    openSearchDrawer: vi.fn(),
    openNavigationDrawer: vi.fn(),
    openLanguageDrawer: vi.fn(),
  }),
}));

vi.mock('@/icons/globe.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="mock-globe-icon" />,
}));

vi.mock('@/icons/menu.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="mock-menu-icon" />,
}));

vi.mock('@/icons/search.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="mock-search-icon" />,
}));

vi.mock('@/redux/slices/navbar', () => ({
  selectIsLanguageDrawerOpen: () => false,
  selectIsNavigationDrawerOpen: () => false,
  selectIsSettingsDrawerOpen: () => false,
}));

vi.mock('@/redux/slices/persistGateHydration', () => ({
  selectIsPersistGateHydrationComplete: () => true,
}));

vi.mock('@/redux/slices/QuranReader/sidebarNavigation', () => ({
  selectIsSidebarNavigationVisible: () => false,
  setIsSidebarNavigationVisible: (value: boolean) => ({
    type: 'sidebar/setIsSidebarNavigationVisible',
    payload: value,
  }),
}));

vi.mock('@/utils/css', () => ({
  getSidebarTransitionDurationFromCss: () => 0,
}));

vi.mock('@/tests/test-ids', () => ({
  TestId: { OPEN_NAVIGATION_DRAWER: 'open-navigation-drawer' },
}));

const renderNavbar = async () => {
  const { default: NavbarBody } = await import('./index');
  return render(<NavbarBody isBannerVisible />);
};

describe('NavbarBody UI section banner states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders empty banner while loading', async () => {
    useSWRImmutableMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: true,
    });

    await renderNavbar();

    expect(screen.getAllByTestId('mock-banner')).toHaveLength(2);
    const [firstProps, secondProps] = bannerMock.mock.calls.map((call) => call[0]);
    expect(firstProps.text).toBe('');
    expect(secondProps.text).toBe('');
    expect(firstProps.ctaButtonText).toBeUndefined();
    expect(secondProps.ctaButtonText).toBeUndefined();
  });

  it('renders empty banner when API fails', async () => {
    useSWRImmutableMock.mockReturnValue({
      data: undefined,
      error: new Error('network-error'),
      isValidating: false,
    });

    await renderNavbar();

    expect(screen.getAllByTestId('mock-banner')).toHaveLength(2);
    const [firstProps, secondProps] = bannerMock.mock.calls.map((call) => call[0]);
    expect(firstProps.text).toBe('');
    expect(secondProps.text).toBe('');
  });

  it('renders empty banner when API returns no content', async () => {
    useSWRImmutableMock.mockReturnValue({
      data: { uiSection: null },
      error: undefined,
      isValidating: false,
    });

    await renderNavbar();

    expect(screen.getAllByTestId('mock-banner')).toHaveLength(2);
    const [firstProps, secondProps] = bannerMock.mock.calls.map((call) => call[0]);
    expect(firstProps.text).toBe('');
    expect(secondProps.text).toBe('');
  });

  it('passes CTA props only when URL and localized CTA text exist', async () => {
    useSWRImmutableMock.mockReturnValue({
      data: {
        uiSection: {
          key: 'navbar_announcement',
          url: 'https://example.com',
          ctaText: 'Faire un don',
          cacheTtlSeconds: 3600,
          metadata: {},
          content: { format: 'plain_text', value: 'Short banner text' },
          language: 'fr',
        },
      },
      error: undefined,
      isValidating: false,
    });

    await renderNavbar();

    expect(screen.getAllByTestId('mock-banner')).toHaveLength(2);
    const withUrlProps = bannerMock.mock.calls[0][0];
    expect(withUrlProps.text).toBe('Short banner text');
    expect(withUrlProps.textFormat).toBe('plain_text');
    expect(withUrlProps.ctaButtonText).toBe('Faire un don');
    expect(withUrlProps.ctaUrl).toBe('https://example.com');

    cleanup();
    vi.clearAllMocks();

    useSWRImmutableMock.mockReturnValue({
      data: {
        uiSection: {
          key: 'navbar_announcement',
          url: 'https://example.com',
          ctaText: null,
          cacheTtlSeconds: 3600,
          metadata: {},
          content: { format: 'plain_text', value: 'Short banner text' },
          language: 'fr',
        },
      },
      error: undefined,
      isValidating: false,
    });

    await renderNavbar();

    expect(screen.getAllByTestId('mock-banner')).toHaveLength(2);
    const withoutUrlProps = bannerMock.mock.calls[0][0];
    expect(withoutUrlProps.ctaButtonText).toBeUndefined();
    expect(withoutUrlProps.ctaUrl).toBeUndefined();
  });
});
