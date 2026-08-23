import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import ThemeProvider from './ThemeProvider';

import useThemeDetector from '@/hooks/useThemeDetector';
import ThemeType from '@/redux/types/ThemeType';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  shallowEqual: vi.fn(),
}));

vi.mock('@/redux/slices/theme', () => ({
  selectTheme: vi.fn(),
}));

vi.mock('@/hooks/useThemeDetector', () => ({
  default: vi.fn(),
}));

const getThemeColorMetaTag = () => document.querySelector('meta[name="theme-color"]');

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((tag) => tag.remove());
    document.body.removeAttribute('data-theme');
  });

  it('sets the body data-theme attribute to match the selected theme', () => {
    vi.mocked(useSelector).mockReturnValue({ type: ThemeType.Dark });
    vi.mocked(useThemeDetector).mockReturnValue({
      isDarkTheme: true,
      settingsTheme: { type: ThemeType.Dark },
      themeVariant: ThemeType.Dark,
    });

    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(document.body.getAttribute('data-theme')).toBe(ThemeType.Dark);
  });

  it('sets the theme-color meta tag to the dark theme background color', () => {
    vi.mocked(useSelector).mockReturnValue({ type: ThemeType.Dark });
    vi.mocked(useThemeDetector).mockReturnValue({
      isDarkTheme: true,
      settingsTheme: { type: ThemeType.Dark },
      themeVariant: ThemeType.Dark,
    });

    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#1f2125');
  });

  it('sets the theme-color meta tag to the sepia theme background color', () => {
    vi.mocked(useSelector).mockReturnValue({ type: ThemeType.Sepia });
    vi.mocked(useThemeDetector).mockReturnValue({
      isDarkTheme: false,
      settingsTheme: { type: ThemeType.Sepia },
      themeVariant: ThemeType.Sepia,
    });

    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#f8ebd5');
  });

  it('resolves auto theme to the system-preferred variant color', () => {
    vi.mocked(useSelector).mockReturnValue({ type: ThemeType.Auto });
    vi.mocked(useThemeDetector).mockReturnValue({
      isDarkTheme: true,
      settingsTheme: { type: ThemeType.Auto },
      themeVariant: ThemeType.Dark,
    });

    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(document.body.getAttribute('data-theme')).toBe(ThemeType.Auto);
    expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#1f2125');
  });

  it('reuses the existing meta tag rendered by SEO config instead of creating duplicates', () => {
    const seoTag = document.createElement('meta');
    seoTag.name = 'theme-color';
    seoTag.content = '#fff';
    document.head.appendChild(seoTag);

    vi.mocked(useSelector).mockReturnValue({ type: ThemeType.Dark });
    vi.mocked(useThemeDetector).mockReturnValue({
      isDarkTheme: true,
      settingsTheme: { type: ThemeType.Dark },
      themeVariant: ThemeType.Dark,
    });

    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#1f2125');
  });

  it('restores the theme color after a later SEO rerender reverts the meta tag', async () => {
    vi.mocked(useSelector).mockReturnValue({ type: ThemeType.Dark });
    vi.mocked(useThemeDetector).mockReturnValue({
      isDarkTheme: true,
      settingsTheme: { type: ThemeType.Dark },
      themeVariant: ThemeType.Dark,
    });

    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#1f2125');

    // Simulate `DefaultSeo`/next-seo's head reconciliation stomping the tag back to its
    // static placeholder on an unrelated rerender (e.g. AppContent selector change).
    getThemeColorMetaTag()?.setAttribute('content', '#fff');

    await vi.waitFor(() => {
      expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#1f2125');
    });
  });

  it('restores the theme color after the SEO tag is replaced with a new element', async () => {
    vi.mocked(useSelector).mockReturnValue({ type: ThemeType.Sepia });
    vi.mocked(useThemeDetector).mockReturnValue({
      isDarkTheme: false,
      settingsTheme: { type: ThemeType.Sepia },
      themeVariant: ThemeType.Sepia,
    });

    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#f8ebd5');

    // Simulate Next's head diffing removing the old tag and inserting a fresh one from
    // the static SEO config (a childList mutation rather than an attribute mutation).
    getThemeColorMetaTag()?.remove();
    const replacementTag = document.createElement('meta');
    replacementTag.name = 'theme-color';
    replacementTag.content = '#fff';
    document.head.appendChild(replacementTag);

    await vi.waitFor(() => {
      expect(getThemeColorMetaTag()?.getAttribute('content')).toBe('#f8ebd5');
    });
  });
});
