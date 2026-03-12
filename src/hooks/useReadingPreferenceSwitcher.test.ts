/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useReadingPreferenceSwitcher, { SwitcherContext } from './useReadingPreferenceSwitcher';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { markUserSwitchedReadingMode, resetUserSwitchFlag } from '@/hooks/readingModeSwitchTracker';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import QueryParam from '@/types/QueryParam';
import { ReadingPreference } from '@/types/QuranReader';
import { getReadingModeQueryParamValue } from '@/utils/readingPreference';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('@/hooks/auth/usePersistPreferenceGroup', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useGetQueryParamOrReduxValue', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/readingModeSwitchTracker', () => ({
  markUserSwitchedReadingMode: vi.fn(),
  resetUserSwitchFlag: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectReadingPreferences: (state: any) => state.readingPreferences,
  setReadingPreference: (value: ReadingPreference) => ({
    type: 'readingPreferences/setReadingPreference',
    payload: value,
  }),
}));

vi.mock('@/redux/slices/QuranReader/readingTracker', () => ({
  selectLastReadVerseKey: (state: any) => state.readingTracker,
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: (state: any) => state.translations.selectedTranslations,
}));

describe('useReadingPreferenceSwitcher', () => {
  let mockRouter: any;
  let mockReadingPreferenceReduxValue: ReadingPreference;
  let mockLastReadVerseKey: string | null;
  let mockSelectedTranslations: number[];
  const mockOnSettingsChange = vi.fn();
  const createDeferredPromise = () => {
    let resolve!: (value: boolean) => void;
    const promise = new Promise<boolean>((res) => {
      resolve = res;
    });

    return { promise, resolve };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockReadingPreferenceReduxValue = ReadingPreference.Reading;
    mockLastReadVerseKey = '2:255';
    mockSelectedTranslations = [20];

    mockRouter = {
      pathname: '/[chapterId]/[verseId]',
      asPath: `/ar/2/255?readingMode=${getReadingModeQueryParamValue(ReadingPreference.Reading)}`,
      query: {
        chapterId: '2',
        verseId: '255',
        readingMode: getReadingModeQueryParamValue(ReadingPreference.Reading),
        startingVerse: '12',
      },
      replace: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(useRouter).mockImplementation(() => mockRouter);

    vi.mocked(useSelector).mockImplementation((selector: any) => {
      if (selector === selectReadingPreferences) {
        return { readingPreference: mockReadingPreferenceReduxValue };
      }
      if (selector === selectLastReadVerseKey) {
        return { verseKey: mockLastReadVerseKey };
      }
      if (selector === selectSelectedTranslations) {
        return mockSelectedTranslations;
      }
      return undefined;
    });

    vi.mocked(useGetQueryParamOrReduxValue).mockReturnValue({
      value: ReadingPreference.Reading,
      isQueryParamDifferent: false,
    });

    vi.mocked(usePersistPreferenceGroup).mockReturnValue({
      actions: {
        onSettingsChange: mockOnSettingsChange,
      },
      isLoading: false,
    } as any);

    mockOnSettingsChange.mockImplementation(
      (
        _key: string,
        _value: ReadingPreference,
        _action: unknown,
        _undoAction: unknown,
        _group: PreferenceGroup,
        success?: () => void,
      ) => {
        success?.();
      },
    );

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it('is a no-op when switching to the currently resolved reading preference', () => {
    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    act(() => {
      result.current.switchReadingPreference(ReadingPreference.Reading);
    });

    expect(mockOnSettingsChange).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(markUserSwitchedReadingMode).not.toHaveBeenCalled();
  });

  it('updates URL payload correctly for SurahHeader context by removing startingVerse', async () => {
    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.SurahHeader,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.ReadingTranslation);
    });

    expect(markUserSwitchedReadingMode).toHaveBeenCalledWith(
      `/ar/2/255?readingMode=${getReadingModeQueryParamValue(ReadingPreference.Reading)}`,
    );
    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      'readingPreference',
      ReadingPreference.ReadingTranslation,
      setReadingPreference(ReadingPreference.ReadingTranslation),
      setReadingPreference(ReadingPreference.Reading),
      PreferenceGroup.READING,
      expect.any(Function),
      expect.any(Function),
    );

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/[chapterId]/[verseId]',
        query: {
          chapterId: '2',
          verseId: '255',
          translations: '20',
          readingMode: getReadingModeQueryParamValue(ReadingPreference.ReadingTranslation),
        },
      },
      null,
      { shallow: true, scroll: false },
    );

    await waitFor(() => {
      expect(resetUserSwitchFlag).toHaveBeenCalled();
    });
  });

  it('sets startingVerse from lastReadVerse for chapter-scoped routes when not at top', async () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 450,
    });

    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.MobileTabs,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.ReadingTranslation);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/[chapterId]/[verseId]',
        query: {
          chapterId: '2',
          verseId: '255',
          translations: '20',
          readingMode: getReadingModeQueryParamValue(ReadingPreference.ReadingTranslation),
          startingVerse: '255',
        },
      },
      null,
      { shallow: true, scroll: false },
    );
  });

  it('removes translations query param when switching to Arabic reading mode', async () => {
    mockRouter.query.translations = '20';
    vi.mocked(useGetQueryParamOrReduxValue).mockReturnValue({
      value: ReadingPreference.Translation,
      isQueryParamDifferent: false,
    });

    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.Reading);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/[chapterId]/[verseId]',
        query: {
          chapterId: '2',
          verseId: '255',
          readingMode: getReadingModeQueryParamValue(ReadingPreference.Reading),
        },
      },
      null,
      { shallow: true, scroll: false },
    );
  });

  it('restores translations query param from Redux when switching to reading translation mode', async () => {
    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.ReadingTranslation);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/[chapterId]/[verseId]',
        query: {
          chapterId: '2',
          verseId: '255',
          translations: '20',
          readingMode: getReadingModeQueryParamValue(ReadingPreference.ReadingTranslation),
        },
      },
      null,
      { shallow: true, scroll: false },
    );
  });

  it('restores translations query param from Redux when switching to verse-by-verse mode', async () => {
    vi.mocked(useGetQueryParamOrReduxValue).mockReturnValue({
      value: ReadingPreference.Reading,
      isQueryParamDifferent: false,
    });

    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.Translation);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/[chapterId]/[verseId]',
        query: {
          chapterId: '2',
          verseId: '255',
          translations: '20',
          readingMode: getReadingModeQueryParamValue(ReadingPreference.Translation),
        },
      },
      null,
      { shallow: true, scroll: false },
    );
  });

  it('executes rollback callback by reverting URL to previous query params', async () => {
    let undoCallback: (() => void) | undefined;
    mockRouter.query.translations = '20';

    mockOnSettingsChange.mockImplementation(
      (
        _key: string,
        _value: ReadingPreference,
        _action: unknown,
        _undoAction: unknown,
        _group: PreferenceGroup,
        _success?: () => void,
        undo?: () => void,
      ) => {
        undoCallback = undo;
      },
    );

    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.ReadingTranslation);
    });

    expect(undoCallback).toBeDefined();

    act(() => {
      undoCallback?.();
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/[chapterId]/[verseId]',
        query: {
          chapterId: '2',
          verseId: '255',
          translations: '20',
          readingMode: getReadingModeQueryParamValue(ReadingPreference.Reading),
          startingVerse: '12',
        },
      },
      null,
      { shallow: true, scroll: false },
    );
  });

  it('uses asPath readingMode for rollback when router.query readingMode is stale', async () => {
    let undoCallback: (() => void) | undefined;

    mockRouter.asPath = `/ar/2/255?readingMode=${getReadingModeQueryParamValue(
      ReadingPreference.ReadingTranslation,
    )}&startingVerse=12`;
    mockRouter.query.readingMode = getReadingModeQueryParamValue(ReadingPreference.Reading);

    vi.mocked(useGetQueryParamOrReduxValue).mockReturnValue({
      value: ReadingPreference.ReadingTranslation,
      isQueryParamDifferent: true,
    });

    mockOnSettingsChange.mockImplementation(
      (
        _key: string,
        _value: ReadingPreference,
        _action: unknown,
        _undoAction: unknown,
        _group: PreferenceGroup,
        _success?: () => void,
        undo?: () => void,
      ) => {
        undoCallback = undo;
      },
    );

    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.Reading);
    });

    act(() => {
      undoCallback?.();
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/[chapterId]/[verseId]',
        query: {
          chapterId: '2',
          verseId: '255',
          readingMode: getReadingModeQueryParamValue(ReadingPreference.ReadingTranslation),
          startingVerse: '12',
        },
      },
      null,
      { shallow: true, scroll: false },
    );
  });

  it('keeps suppression active until rollback navigation settles', async () => {
    let undoCallback: (() => void) | undefined;
    const forwardNavigation = createDeferredPromise();
    const rollbackNavigation = createDeferredPromise();

    mockRouter.replace = vi
      .fn()
      .mockReturnValueOnce(forwardNavigation.promise)
      .mockReturnValueOnce(rollbackNavigation.promise);

    mockOnSettingsChange.mockImplementation(
      (
        _key: string,
        _value: ReadingPreference,
        _action: unknown,
        _undoAction: unknown,
        _group: PreferenceGroup,
        _success?: () => void,
        undo?: () => void,
      ) => {
        undoCallback = undo;
      },
    );

    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    act(() => {
      result.current.switchReadingPreference(ReadingPreference.ReadingTranslation);
    });

    await act(async () => {
      forwardNavigation.resolve(true);
      await forwardNavigation.promise;
    });

    expect(resetUserSwitchFlag).not.toHaveBeenCalled();

    act(() => {
      undoCallback?.();
    });

    expect(markUserSwitchedReadingMode).toHaveBeenCalledTimes(2);
    expect(resetUserSwitchFlag).not.toHaveBeenCalled();

    await act(async () => {
      rollbackNavigation.resolve(true);
      await rollbackNavigation.promise;
    });

    await waitFor(() => {
      expect(resetUserSwitchFlag).toHaveBeenCalledTimes(1);
    });
  });

  it('uses verse key as startingVerse for verse-key routes when not chapter-scoped', async () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 450,
    });

    mockRouter.query.chapterId = '2:255';
    mockRouter.query.startingVerse = undefined;

    const { result } = renderHook(() =>
      useReadingPreferenceSwitcher({
        context: SwitcherContext.ContextMenu,
      }),
    );

    await act(async () => {
      result.current.switchReadingPreference(ReadingPreference.ReadingTranslation);
    });

    const currentCall = vi
      .mocked(mockRouter.replace)
      .mock.calls.find(
        (call) =>
          call[0]?.query?.[QueryParam.READING_MODE] ===
            getReadingModeQueryParamValue(ReadingPreference.ReadingTranslation) &&
          call[0]?.query?.startingVerse,
      );

    expect(currentCall?.[0]).toEqual({
      pathname: '/[chapterId]/[verseId]',
      query: {
        chapterId: '2:255',
        verseId: '255',
        translations: '20',
        readingMode: getReadingModeQueryParamValue(ReadingPreference.ReadingTranslation),
        startingVerse: '2:255',
      },
    });
  });
});
