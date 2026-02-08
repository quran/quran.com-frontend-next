import type { AnyAction, Dispatch, MiddlewareAPI } from 'redux';
import { describe, it, expect, vi } from 'vitest';

import { RESET_SETTINGS_EVENT } from '@/redux/actions/reset-settings';
import DefaultSettingsMiddleware from '@/redux/middleware/defaultSettingsMiddleware';
import { RootState } from '@/redux/RootState';
import { setIsUsingDefaultSettings } from '@/redux/slices/defaultSettings';
import SliceName from '@/redux/types/SliceName';

const runMiddleware = (action: AnyAction) => {
  const dispatched: AnyAction[] = [];

  const dispatch: Dispatch<AnyAction> = (a) => {
    dispatched.push(a);
    return a;
  };

  const storeAPI: MiddlewareAPI<Dispatch<AnyAction>, RootState> = {
    dispatch,
    getState: () => ({} as RootState),
  };

  const next = vi.fn<(a: AnyAction) => AnyAction>((a) => a);

  DefaultSettingsMiddleware(storeAPI)(next)(action);

  return { dispatched, next };
};

describe('DefaultSettingsMiddleware', () => {
  it('marks isUsingDefaultSettings=false for observed user setting changes', () => {
    const { dispatched, next } = runMiddleware({
      type: `${SliceName.TRANSLATIONS}/setSelectedTranslations`,
      payload: { translations: [131], locale: 'en' },
    });

    expect(dispatched).toEqual([{ type: setIsUsingDefaultSettings.type, payload: false }]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not mark isUsingDefaultSettings=false when action has meta.skipDefaultSettings', () => {
    const { dispatched } = runMiddleware({
      type: `${SliceName.TRANSLATIONS}/setSelectedTranslations`,
      payload: { translations: [131], locale: 'en' },
      meta: { skipDefaultSettings: true },
    });

    expect(dispatched).toEqual([]);
  });

  it('marks isUsingDefaultSettings=true on reset settings event', () => {
    const { dispatched } = runMiddleware({ type: RESET_SETTINGS_EVENT, payload: { locale: 'en' } });
    expect(dispatched).toEqual([{ type: setIsUsingDefaultSettings.type, payload: true }]);
  });
});
