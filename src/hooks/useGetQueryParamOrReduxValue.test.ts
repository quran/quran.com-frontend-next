/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import i18nConfig from '../../i18n.json';

import useGetQueryParamOrReduxValue from './useGetQueryParamOrReduxValue';

import QueryParam from '@/types/QueryParam';
import { ReadingPreference } from '@/types/QuranReader';
import { getReadingModeQueryParamValue } from '@/utils/readingPreference';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  shallowEqual: vi.fn((a, b) => a === b),
}));

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectReadingPreference: (state: any) => state.readingPreferences.readingPreference,
  selectWordByWordLocale: (state: any) => state.readingPreferences.selectedWordByWordLocale,
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: (state: any) => state.translations.selectedTranslations,
}));

type EntryVector =
  | 'direct_url_paste_same_tab'
  | 'browser_refresh'
  | 'in_app_mode_switch'
  | 'url_update_existing_tab';

type AuthState = 'guest' | 'logged_in';

const modes: ReadingPreference[] = [
  ReadingPreference.Translation,
  ReadingPreference.Reading,
  ReadingPreference.ReadingTranslation,
];

const routeShapes = ['/2', '/2/255'];
const entryVectors: EntryVector[] = [
  'direct_url_paste_same_tab',
  'browser_refresh',
  'in_app_mode_switch',
  'url_update_existing_tab',
];
const authStates: AuthState[] = ['guest', 'logged_in'];

const getLocaleDefaultReadingPreference = (locale: string): ReadingPreference =>
  locale === 'ar' ? ReadingPreference.Reading : ReadingPreference.Translation;

const getPathForLocale = (locale: string, routeShape: string): string => {
  if (locale === 'en') return routeShape;
  return `/${locale}${routeShape}`;
};

const getAsPathForMode = (locale: string, routeShape: string, targetMode: ReadingPreference) => {
  const path = getPathForLocale(locale, routeShape);
  return `${path}?readingMode=${getReadingModeQueryParamValue(targetMode)}`;
};

const getQueryModeForEntryVector = (
  entryVector: EntryVector,
  sourceMode: ReadingPreference,
  targetMode: ReadingPreference,
): ReadingPreference => {
  if (entryVector === 'browser_refresh' || entryVector === 'in_app_mode_switch') {
    return targetMode;
  }
  return sourceMode;
};

describe('useGetQueryParamOrReduxValue', () => {
  let mockRouter: any;
  let mockState: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRouter = {
      query: {},
      asPath: '/2',
    };

    mockState = {
      readingPreferences: {
        readingPreference: ReadingPreference.Translation,
        selectedWordByWordLocale: 'en',
      },
      translations: {
        selectedTranslations: [131],
      },
    };

    vi.mocked(useRouter).mockImplementation(() => mockRouter);
    vi.mocked(useSelector).mockImplementation((selector: any) => selector(mockState));
  });

  it('uses asPath as canonical source for readingMode across all 2736 scenario combinations', () => {
    let scenarioCount = 0;

    i18nConfig.locales.forEach((locale) => {
      routeShapes.forEach((routeShape) => {
        entryVectors.forEach((entryVector) => {
          authStates.forEach((authState) => {
            modes.forEach((sourceMode) => {
              modes.forEach((targetMode) => {
                scenarioCount += 1;

                const defaultLocaleMode = getLocaleDefaultReadingPreference(locale);
                mockState.readingPreferences.readingPreference =
                  authState === 'guest' ? defaultLocaleMode : sourceMode;

                const queryMode = getQueryModeForEntryVector(entryVector, sourceMode, targetMode);

                mockRouter.query = {
                  readingMode: queryMode,
                };
                mockRouter.asPath = getAsPathForMode(locale, routeShape, targetMode);

                const { result, unmount } = renderHook(() =>
                  useGetQueryParamOrReduxValue(QueryParam.READING_MODE),
                );

                expect(result.current.value).toBe(targetMode);
                unmount();
              });
            });
          });
        });
      });
    });

    expect(scenarioCount).toBe(2736);
  });

  it('falls back to Redux value when readingMode is missing in both asPath and router.query', () => {
    mockState.readingPreferences.readingPreference = ReadingPreference.ReadingTranslation;
    mockRouter.query = {};
    mockRouter.asPath = '/2';

    const { result } = renderHook(() => useGetQueryParamOrReduxValue(QueryParam.READING_MODE));

    expect(result.current.value).toBe(ReadingPreference.ReadingTranslation);
    expect(result.current.isQueryParamDifferent).toBe(false);
  });

  it('falls back to Redux value when readingMode is invalid across all locales', () => {
    const invalidModes = ['', 'invalid', 'READING', 'Translation', 'reading', 'readingTranslation'];

    i18nConfig.locales.forEach((locale) => {
      const localeDefault = getLocaleDefaultReadingPreference(locale);
      mockState.readingPreferences.readingPreference = localeDefault;

      invalidModes.forEach((invalidMode) => {
        mockRouter.query = {
          readingMode: ReadingPreference.Reading,
        };
        mockRouter.asPath = `${getPathForLocale(locale, '/2')}?readingMode=${invalidMode}`;

        const { result, unmount } = renderHook(() =>
          useGetQueryParamOrReduxValue(QueryParam.READING_MODE),
        );

        expect(result.current.value).toBe(localeDefault);
        expect(result.current.isQueryParamDifferent).toBe(false);
        unmount();
      });
    });
  });

  it('respects coexistence with other query params while resolving readingMode from asPath', () => {
    mockState.readingPreferences.readingPreference = ReadingPreference.Reading;
    mockRouter.query = {
      readingMode: ReadingPreference.Translation,
      startingVerse: '5',
      translations: '20',
      wbw_locale: 'id',
    };
    mockRouter.asPath =
      '/ar/2?readingMode=translation&startingVerse=7&translations=131&wbw_locale=ar';

    const { result } = renderHook(() => useGetQueryParamOrReduxValue(QueryParam.READING_MODE));

    expect(result.current.value).toBe(ReadingPreference.ReadingTranslation);
    expect(result.current.isQueryParamDifferent).toBe(true);
  });

  it('keeps non-readingMode behavior unchanged by continuing to use router.query for other params', () => {
    mockState.translations.selectedTranslations = [131];
    mockRouter.query = {
      translations: '20',
    };
    mockRouter.asPath = '/2?translations=131';

    const { result } = renderHook(() => useGetQueryParamOrReduxValue(QueryParam.TRANSLATIONS));

    expect(result.current.value).toEqual([20]);
    expect(result.current.isQueryParamDifferent).toBe(true);
  });

  it('overrides locale defaults (including Arabic reading default) when URL has valid readingMode', () => {
    const localeTargetPairs: Array<{ locale: string; target: ReadingPreference }> = [
      { locale: 'ar', target: ReadingPreference.Translation },
      { locale: 'ar', target: ReadingPreference.ReadingTranslation },
      { locale: 'en', target: ReadingPreference.Reading },
      { locale: 'fr', target: ReadingPreference.ReadingTranslation },
      { locale: 'id', target: ReadingPreference.Reading },
    ];

    localeTargetPairs.forEach(({ locale, target }) => {
      mockState.readingPreferences.readingPreference = getLocaleDefaultReadingPreference(locale);
      mockRouter.query = {
        readingMode: ReadingPreference.Reading,
      };
      mockRouter.asPath = `${getPathForLocale(
        locale,
        '/2',
      )}?readingMode=${getReadingModeQueryParamValue(target)}`;

      const { result, unmount } = renderHook(() =>
        useGetQueryParamOrReduxValue(QueryParam.READING_MODE),
      );

      expect(result.current.value).toBe(target);
      unmount();
    });
  });
});
