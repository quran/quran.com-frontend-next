import type { Dispatch, UnknownAction } from 'redux';

import { ToastStatus } from '@/dls/Toast/Toast';

export type TranslateFn = (key: string, query?: Record<string, unknown>) => string;
export type ToastFn = (
  message: string,
  options: { status: ToastStatus; actions?: unknown[] },
) => void;
// Mirror the default types returned by `react-redux`'s `useDispatch()` in this codebase
// (Dispatch<UnknownAction>) to avoid unsafe casts while keeping reasonable type-safety.
export type DispatchFn = Dispatch<UnknownAction>;

// Match SWR's global `mutate` signature from `useSWRConfig()`.
export type GlobalMutateFn = ReturnType<typeof import('swr')['useSWRConfig']>['mutate'];
