/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-func/max-lines-per-function */
import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from 'redux';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import useLanguageChange from './useLanguageChange';

import resetSettings from '@/redux/actions/reset-settings';
import syncLocaleDependentSettings from '@/redux/actions/sync-locale-dependent-settings';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

declare global {
  // React checks this global flag to decide whether `act()` semantics are enabled.
  // Jest sets it automatically; Vitest does not.
  interface GlobalThis {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
}

// Mocks
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (k: string) => k, lang: 'ar' }),
}));

vi.mock('next-translate/setLanguage', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/redux/actions/sync-locale-dependent-settings', () => ({
  // This action is a thunk in production. Keep the mock returning a function so
  // the hook test matches real dispatch behavior.
  default: vi.fn(() => (_dispatch: Dispatch) => undefined),
}));

vi.mock('@/redux/actions/reset-settings', () => ({
  default: vi.fn((locale: string) => ({ type: 'resetSettings', payload: { locale } })),
}));

vi.mock('@/utils/auth/api', () => ({
  addOrUpdateUserPreference: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: vi.fn(),
}));

vi.mock('@/utils/cookies', () => ({
  setLocaleCookie: vi.fn(),
}));

vi.mock('@/utils/eventLogger', () => ({
  logValueChange: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Warning: 'Warning' },
  useToast: () => vi.fn(),
}));

describe('useLanguageChange', () => {
  const dispatch = vi.fn() as unknown as Dispatch;
  let previousIsReactActEnvironment: boolean | undefined;

  beforeAll(() => {
    previousIsReactActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    if (previousIsReactActEnvironment === undefined) {
      delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    } else {
      globalThis.IS_REACT_ACT_ENVIRONMENT = previousIsReactActEnvironment;
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(dispatch);
  });

  it('dispatches syncLocaleDependentSettings for guests when not using default settings', async () => {
    vi.mocked(isLoggedIn).mockReturnValue(false);
    vi.mocked(useSelector).mockReturnValue(false); // isUsingDefaultSettings=false

    const { result } = renderHook(() => useLanguageChange());

    await act(async () => {
      await result.current.onLanguageChange('en');
    });

    expect(syncLocaleDependentSettings).toHaveBeenCalledWith({
      prevLocale: 'ar',
      nextLocale: 'en',
    });
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'resetSettings', payload: { locale: 'en' } });
    expect(addOrUpdateUserPreference).not.toHaveBeenCalled();
    expect(setLocaleCookie).toHaveBeenCalledWith('en');
    expect(logValueChange).toHaveBeenCalledWith('locale', 'ar', 'en');
  });

  it('does not dispatch syncLocaleDependentSettings for guests when using default settings', async () => {
    vi.mocked(isLoggedIn).mockReturnValue(false);
    vi.mocked(useSelector).mockReturnValue(true); // isUsingDefaultSettings=true

    const { result } = renderHook(() => useLanguageChange());

    await act(async () => {
      await result.current.onLanguageChange('en');
    });

    expect(syncLocaleDependentSettings).not.toHaveBeenCalled();
    expect(resetSettings).toHaveBeenCalledWith('en');
    expect(dispatch).toHaveBeenCalledWith({ type: 'resetSettings', payload: { locale: 'en' } });
    expect(addOrUpdateUserPreference).not.toHaveBeenCalled();
  });

  it('does not dispatch syncLocaleDependentSettings for logged-in users', async () => {
    vi.mocked(isLoggedIn).mockReturnValue(true);
    vi.mocked(useSelector).mockReturnValue(false); // isUsingDefaultSettings=false

    const { result } = renderHook(() => useLanguageChange());

    await act(async () => {
      await result.current.onLanguageChange('en');
    });

    expect(syncLocaleDependentSettings).not.toHaveBeenCalled();
    expect(addOrUpdateUserPreference).toHaveBeenCalledWith(
      PreferenceGroup.LANGUAGE,
      'en',
      PreferenceGroup.LANGUAGE,
    );
  });

  it('still applies resetSettings when using default settings (independent of login)', async () => {
    vi.mocked(isLoggedIn).mockReturnValue(true);
    vi.mocked(useSelector).mockReturnValue(true); // isUsingDefaultSettings=true

    const { result } = renderHook(() => useLanguageChange());

    await act(async () => {
      await result.current.onLanguageChange('en');
    });

    expect(resetSettings).toHaveBeenCalledWith('en');
    expect(dispatch).toHaveBeenCalledWith({ type: 'resetSettings', payload: { locale: 'en' } });
  });
});
