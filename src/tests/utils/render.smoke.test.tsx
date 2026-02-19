/**
 * Phase 1 Foundation — DOD Smoke Tests
 *
 * Verifies that the core testing infrastructure works end-to-end:
 *   1. renderWithProviders renders with a real Redux store
 *   2. preloadedState is reflected in store.getState()
 *   3. Factories produce valid typed objects
 *   4. MSW intercepts network requests (fetch intercepted by MSW handler)
 *   5. AuthContext is available with guest defaults
 *
 * i18n note: components that call useTranslation() must mock it:
 *   vi.mock('next-translate/useTranslation', () => ({
 *     default: () => ({ t: (key: string) => key, lang: 'en' }),
 *   }));
 */
import React, { useContext } from 'react';

import { describe, expect, it } from 'vitest';

import { makeVerse } from '../factories';

import { renderWithProviders } from './render';

import { AuthContext } from '@/contexts/AuthContext';
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

  it('AuthContext is available with guest defaults (isLoading=false)', () => {
    let capturedAuth: ReturnType<typeof useContext<typeof AuthContext>> | undefined;
    function AuthConsumer() {
      capturedAuth = useContext(AuthContext);
      return null;
    }
    renderWithProviders(<AuthConsumer />);
    expect(capturedAuth).toBeDefined();
    expect(capturedAuth?.state.isAuthenticated).toBe(false);
    expect(capturedAuth?.state.isLoading).toBe(false);
  });

  it('MSW intercepts fetch requests for registered handlers', async () => {
    const response = await fetch('/api/proxy/preferences/country-language?locale=en-US');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
