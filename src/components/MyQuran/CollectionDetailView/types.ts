import { ToastStatus } from '@/dls/Toast/Toast';

export type TranslateFn = (key: string, query?: Record<string, unknown>) => string;
export type ToastFn = (
  message: string,
  options: { status: ToastStatus; actions?: unknown[] },
) => void;
export type DispatchFn = (action: unknown) => void;
export type GlobalMutateFn = (key: unknown, data?: unknown, opts?: unknown) => Promise<unknown>;
