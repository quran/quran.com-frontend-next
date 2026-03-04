/* eslint-disable i18next/no-literal-string */
/* eslint-disable max-lines */
import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import QueryParamMessage from '.';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  selectReadingPreference,
  selectWordByWordLocale,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import {
  selectSelectedTranslations,
  setSelectedTranslations,
} from '@/redux/slices/QuranReader/translations';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
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

vi.mock('@xstate/react', () => ({
  useSelector: vi.fn(() => 7),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ lang: 'en' }),
}));

vi.mock('next-translate/Trans', () => ({
  default: ({ components }: { components: React.ReactElement[] }) => (
    <div>
      <button
        type="button"
        data-testid="use-redux-state"
        onClick={() => components[0].props.onClick()}
      >
        use-redux-state
      </button>
      <button
        type="button"
        data-testid="persist-query-params"
        onClick={() => components[1].props.onClick()}
      >
        persist-query-params
      </button>
    </div>
  ),
}));

vi.mock('@/hooks/auth/usePersistPreferenceGroup', () => ({
  default: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectReadingPreference: (state: any) => state.readingPreferences.readingPreference,
  selectWordByWordLocale: (state: any) => state.readingPreferences.selectedWordByWordLocale,
  setReadingPreference: (value: ReadingPreference) => ({
    type: 'readingPreferences/setReadingPreference',
    payload: value,
  }),
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: (state: any) => state.translations.selectedTranslations,
  setSelectedTranslations: ({
    translations,
    locale,
  }: {
    translations: number[];
    locale: string;
  }) => ({
    type: 'translations/setSelectedTranslations',
    payload: { translations, locale },
  }),
}));

describe('QueryParamMessage', () => {
  let mockRouter: any;
  const mockOnSettingsChange = vi.fn();
  const mockOnXstateSettingsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockRouter = {
      query: {
        [QueryParam.READING_MODE]: ReadingPreference.ReadingTranslation,
      },
      asPath: `/2/255?${QueryParam.READING_MODE}=${getReadingModeQueryParamValue(
        ReadingPreference.ReadingTranslation,
      )}`,
      push: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(useRouter).mockReturnValue(mockRouter);

    vi.mocked(useSelector).mockImplementation((selector: any) => {
      if (selector === selectSelectedTranslations) {
        return [131];
      }
      if (selector === selectWordByWordLocale) {
        return 'en';
      }
      if (selector === selectReadingPreference) {
        return ReadingPreference.Reading;
      }
      return undefined;
    });

    vi.mocked(usePersistPreferenceGroup).mockReturnValue({
      actions: {
        onSettingsChange: mockOnSettingsChange,
        onXstateSettingsChange: mockOnXstateSettingsChange,
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('clicking "Use Redux state" writes readingMode from Redux to URL and pushes shallow route', () => {
    render(
      <QueryParamMessage
        translationsQueryParamDifferent={false}
        reciterQueryParamDifferent={false}
        wordByWordLocaleQueryParamDifferent={false}
        isReadingModeQueryParamDifferent
      />,
    );

    fireEvent.click(screen.getByTestId('use-redux-state'));

    expect(mockRouter.query[QueryParam.READING_MODE]).toBe(
      getReadingModeQueryParamValue(ReadingPreference.Reading),
    );
    expect(mockRouter.push).toHaveBeenCalledWith(mockRouter, undefined, { shallow: true });
  });

  it('clicking "Persist query params" persists readingMode into Redux preference group', () => {
    mockRouter.query[QueryParam.READING_MODE] = ReadingPreference.ReadingTranslation;

    render(
      <QueryParamMessage
        translationsQueryParamDifferent={false}
        reciterQueryParamDifferent={false}
        wordByWordLocaleQueryParamDifferent={false}
        isReadingModeQueryParamDifferent
      />,
    );

    fireEvent.click(screen.getByTestId('persist-query-params'));

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      'readingPreference',
      ReadingPreference.ReadingTranslation,
      setReadingPreference(ReadingPreference.ReadingTranslation),
      setReadingPreference(ReadingPreference.Reading),
      PreferenceGroup.READING,
    );
  });

  it('persists readingMode from asPath when router.query is stale', () => {
    mockRouter.query[QueryParam.READING_MODE] = ReadingPreference.Reading;
    mockRouter.asPath = `/2/255?${QueryParam.READING_MODE}=${getReadingModeQueryParamValue(
      ReadingPreference.ReadingTranslation,
    )}`;

    render(
      <QueryParamMessage
        translationsQueryParamDifferent={false}
        reciterQueryParamDifferent={false}
        wordByWordLocaleQueryParamDifferent={false}
        isReadingModeQueryParamDifferent
      />,
    );

    fireEvent.click(screen.getByTestId('persist-query-params'));

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      'readingPreference',
      ReadingPreference.ReadingTranslation,
      setReadingPreference(ReadingPreference.ReadingTranslation),
      setReadingPreference(ReadingPreference.Reading),
      PreferenceGroup.READING,
    );
  });

  it('persists translation selection when translation query param is different and valid', () => {
    mockRouter.query[QueryParam.TRANSLATIONS] = '20,131';

    render(
      <QueryParamMessage
        translationsQueryParamDifferent
        reciterQueryParamDifferent={false}
        wordByWordLocaleQueryParamDifferent={false}
      />,
    );

    fireEvent.click(screen.getByTestId('persist-query-params'));

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      'selectedTranslations',
      [20, 131],
      setSelectedTranslations({ translations: [20, 131], locale: 'en' }),
      setSelectedTranslations({ translations: [131], locale: 'en' }),
      PreferenceGroup.TRANSLATIONS,
    );
  });
});
