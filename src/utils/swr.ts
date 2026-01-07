import { SWRConfiguration } from 'swr';

/**
 * SWR configuration for mutable user data like bookmarks and collections.
 *
 * This config balances freshness with network efficiency:
 * - `revalidateOnFocus: true` - Enables cross-tab sync on tab switch
 * - `revalidateOnReconnect: false` - Skip unnecessary refetch on reconnect
 * - `dedupingInterval: 2000` - Dedupe requests within 2s window (reduced from 10s for better cross-tab sync)
 *
 * Combined with optimistic updates for best UX.
 *
 * @see docs/SWR_IMMUTABLE_VS_SWR.md for rationale
 */
const mutatingFetcherConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
};

export default mutatingFetcherConfig;
