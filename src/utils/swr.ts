import { SWRConfiguration } from 'swr';

/**
 * SWR configuration for mutable user data like bookmarks and collections.
 *
 * This config balances freshness with network efficiency:
 * - `revalidateOnFocus: true` (default) - Enables cross-tab sync on tab switch
 * - `revalidateOnReconnect: false` - Skip unnecessary refetch on reconnect
 * - `dedupingInterval: 10000` - Dedupe requests within 10s window
 *
 * Combined with optimistic updates for best UX.
 *
 * @see docs/SWR_IMMUTABLE_VS_SWR.md for rationale
 */
const mutatingFetcherConfig: SWRConfiguration = {
  revalidateOnReconnect: false,
  dedupingInterval: 10000,
};

export default mutatingFetcherConfig;
