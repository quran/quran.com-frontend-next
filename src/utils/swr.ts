import { SWRConfiguration } from 'swr';

/**
 * SWR configuration for mutable user data like bookmarks and collections.
 *
 * This config balances freshness with network efficiency:
 * - `revalidateOnFocus: true` (default) - Enables cross-tab sync
 * - `revalidateOnReconnect: false` - Skip unnecessary refetch on reconnect
 * - `dedupingInterval: 10000` - Dedupe requests within 10s window
 * - `focusThrottleInterval: 30000` - Limit focus revalidations to once per 30s
 *
 * Combined with optimistic updates for best UX.
 *
 * @see docs/SWR_IMMUTABLE_VS_SWR.md for rationale
 */
const mutatingFetcherConfig: SWRConfiguration = {
  revalidateOnReconnect: false,
  dedupingInterval: 10000,
  focusThrottleInterval: 30000,
};

export default mutatingFetcherConfig;
