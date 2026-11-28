import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useGetQueryParamOrXstateValue from './useGetQueryParamOrXstateValue';

import QueryParam from 'types/QueryParam';

const SELECTED_RECITER_ID = 7;
const QUERY_PARAM_RECITER_ID = 12;

const mockRouter = { query: {} as Record<string, string>, isReady: true };

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ lang: 'en' }),
}));

vi.mock('@xstate/react', () => ({
  useSelector: () => SELECTED_RECITER_ID,
}));

vi.mock('src/xstate/AudioPlayerMachineContext', () => ({
  AudioPlayerMachineContext: { Provider: null, Consumer: null },
}));

vi.mock('src/api', () => ({
  fetcher: vi.fn(),
}));

// The list of reciters is what the id is validated against, so the hook has to
// have fetched it before it can accept the param.
vi.mock('swr/immutable', () => ({
  default: (key: string | null) => ({
    data: key ? { reciters: [{ id: QUERY_PARAM_RECITER_ID }] } : undefined,
  }),
}));

describe('useGetQueryParamOrXstateValue', () => {
  it('returns the xstate value when the param is not in the url', () => {
    mockRouter.query = {};

    const { result } = renderHook(() => useGetQueryParamOrXstateValue(QueryParam.RECITER));

    expect(result.current.value).toBe(SELECTED_RECITER_ID);
    expect(result.current.isQueryParamDifferent).toBe(false);
  });

  it('returns the reciter id in the url instead of the selected one', () => {
    mockRouter.query = { [QueryParam.RECITER]: String(QUERY_PARAM_RECITER_ID) };

    const { result } = renderHook(() => useGetQueryParamOrXstateValue(QueryParam.RECITER));

    expect(result.current.value).toBe(QUERY_PARAM_RECITER_ID);
    expect(result.current.isQueryParamDifferent).toBe(true);
  });

  it('falls back to the xstate value for a reciter id that does not exist', () => {
    mockRouter.query = { [QueryParam.RECITER]: '9999999' };

    const { result } = renderHook(() => useGetQueryParamOrXstateValue(QueryParam.RECITER));

    expect(result.current.value).toBe(SELECTED_RECITER_ID);
    expect(result.current.isQueryParamDifferent).toBe(false);
  });
});
