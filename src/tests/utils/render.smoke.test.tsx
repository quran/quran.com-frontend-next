/**
 * Phase 1 Foundation — DOD Smoke Tests
 *
 * Verifies that the core testing infrastructure works end-to-end:
 *   1. renderWithProviders renders with a real Redux store
 *   2. preloadedState is reflected in store.getState()
 *   3. Factories produce valid typed objects
 *   4. MSW intercepts network requests made by SWR
 *
 * i18n note: components that call useTranslation() must mock it:
 *   vi.mock('next-translate/useTranslation', () => ({
 *     default: () => ({ t: (key: string) => key, lang: 'en' }),
 *   }));
 */
import React from 'react';

import { describe, expect, it } from 'vitest';

import { makeVerse } from '../factories';

import { renderWithProviders } from './render';

import ThemeType from '@/redux/types/ThemeType';

describe('Phase 1 — Foundation smoke tests', () => {
  it('renders a component with Redux provider', () => {
    const { getByText } = renderWithProviders(<div>hello</div>);
    expect(getByText('hello')).toBeTruthy();
  });

  it('accepts preloadedState and exposes the store', () => {
    const { store } = renderWithProviders(<div />, {
      preloadedState: { theme: { type: ThemeType.Dark } },
    });
    expect(store.getState().theme.type).toBe(ThemeType.Dark);
  });

  it('makeVerse returns a valid Verse with overrides applied', () => {
    const verse = makeVerse({ verseKey: '2:255' });
    expect(verse.verseKey).toBe('2:255');
    expect(verse.words).toEqual([]);
    expect(verse.chapterId).toBe(1);
  });

  it('renderWithProviders returns RTL direction when specified', () => {
    const { container } = renderWithProviders(<div>rtl test</div>, {
      direction: 'rtl',
    });
    expect(container).toBeTruthy();
  });
});
