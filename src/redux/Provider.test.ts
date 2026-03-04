/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import resolveCurrentLocale from './providerLocale';

describe('resolveCurrentLocale', () => {
  it('prefers router locale when available', () => {
    const locale = resolveCurrentLocale({
      fallbackLocale: 'en',
      pathname: '/ar/2',
      routerLocale: 'fr',
      routerDefaultLocale: 'en',
      routerLocales: ['en', 'ar', 'fr'],
    });

    expect(locale).toBe('fr');
  });

  it('uses locale prefix in pathname when router locale is unavailable', () => {
    const locale = resolveCurrentLocale({
      fallbackLocale: 'en',
      pathname: '/ar/2?readingMode=translation',
      routerDefaultLocale: 'en',
      routerLocales: ['en', 'ar'],
    });

    expect(locale).toBe('ar');
  });

  it('uses i18n locales fallback when routerLocales is missing', () => {
    const locale = resolveCurrentLocale({
      fallbackLocale: 'en',
      pathname: '/ar/2?readingMode=translation',
      routerDefaultLocale: 'en',
    });

    expect(locale).toBe('ar');
  });

  it('falls back to default locale when path has no locale prefix', () => {
    const locale = resolveCurrentLocale({
      fallbackLocale: 'en',
      pathname: '/2?readingMode=arabic',
      routerDefaultLocale: 'en',
      routerLocales: ['en', 'ar'],
    });

    expect(locale).toBe('en');
  });

  it('falls back to provided fallback locale when router default is missing', () => {
    const locale = resolveCurrentLocale({
      fallbackLocale: 'ar',
      pathname: '/2',
      routerLocales: ['en', 'ar'],
    });

    expect(locale).toBe('ar');
  });
});
