# SWR Data Fetching Strategy Guide

> Decision guide for choosing between `useSWR` and `useSWRImmutable`

## Quick Decision Flowchart

```
Is the data user-specific? (bookmarks, preferences, notes)
  └─ YES → Can the data change from multiple pages/tabs?
              └─ YES → Use `useSWR` with `mutatingFetcherConfig`
              └─ NO  → Use `useSWR` (default)
  └─ NO  → Does the data ever change after initial fetch?
              └─ YES → Use `useSWR` (default)
              └─ NO  → Use `useSWRImmutable`
```

## Decision Criteria

Answer these questions about your data:

| Question                                   | YES →             | NO →                       |
| ------------------------------------------ | ----------------- | -------------------------- |
| Can data change while user is on the page? | `useSWR`          | Consider `useSWRImmutable` |
| Can data be modified from multiple pages?  | `useSWR`          | Either works               |
| Do users expect cross-tab sync?            | `useSWR`          | Either works               |
| Is data user-specific (requires auth)?     | `useSWR`          | Either works               |
| Is data truly static/immutable?            | `useSWRImmutable` | `useSWR`                   |
| Is minimizing requests critical?           | `useSWRImmutable` | `useSWR`                   |

## Available Configurations

### 1. `useSWRImmutable` - For Static Content

```typescript
import useSWRImmutable from 'swr/immutable';

// Use for: Quran text, translations, tafsir, static config
const { data } = useSWRImmutable(key, fetcher);
```

**Behavior:**

- Fetches once, never revalidates automatically
- Cache persists until explicitly cleared
- No network requests on tab focus/reconnect

**Use when:**

- Data never changes (Quran verses, translations)
- Data changes very rarely (static configuration)
- Minimizing network requests is priority

### 2. `useSWR` (default) - For Dynamic Content

```typescript
import useSWR from 'swr';

// Use for: Most user data, lists that update
const { data } = useSWR(key, fetcher);
```

**Behavior:**

- Revalidates on focus, reconnect, and when stale
- Automatic cross-tab sync
- Always shows fresh data

**Use when:**

- Data can change from external sources
- Freshness is important
- Default choice when unsure

### 3. `useSWR` + `mutatingFetcherConfig` - For User-Mutable Data

```typescript
import useSWR from 'swr';
import mutatingFetcherConfig from '@/utils/swr';

// Use for: Bookmarks, collections, notes, preferences
const { data } = useSWR(key, fetcher, mutatingFetcherConfig);
```

**Behavior:**

- Cross-tab sync via `revalidateOnFocus`
- Throttled focus revalidation (max once per 30s)
- Reduced requests via `dedupingInterval: 10000`
- No reconnect revalidation (unnecessary for user data)

**Use when:**

- User can modify data from multiple pages
- Cross-tab sync is required
- High-traffic app (millions of users)
- Want balance of freshness and efficiency

## Configuration Reference

```typescript
// mutatingFetcherConfig (src/utils/swr.ts)
{
  revalidateOnFocus: true,       // Keep for cross-tab sync
  revalidateOnReconnect: false,  // Skip - unnecessary for user data
  dedupingInterval: 10000,       // 10s deduping window
}

// useSWRImmutable equivalent
{
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
}
```

## Examples by Data Type

| Data Type        | Strategy          | Reason                   |
| ---------------- | ----------------- | ------------------------ |
| Quran verses     | `useSWRImmutable` | Never changes            |
| Translations     | `useSWRImmutable` | Never changes            |
| Tafsir           | `useSWRImmutable` | Never changes            |
| Bookmarks        | `useSWR` + config | User-mutable, multi-page |
| Collections      | `useSWR` + config | User-mutable, multi-page |
| Notes            | `useSWR` + config | User-mutable, multi-page |
| User preferences | `useSWR` + config | User-mutable             |
| Reading progress | `useSWR` + config | Changes frequently       |
| Chapter list     | `useSWRImmutable` | Static data              |
| Juz/Hizb list    | `useSWRImmutable` | Static data              |
| Search results   | `useSWR`          | Changes per query        |
| Reciter list     | `useSWRImmutable` | Rarely changes           |

## Cache Invalidation

### With `useSWR`

```typescript
// Trigger refetch
mutate(key);

// Update with known data (no refetch)
mutate(key, newData, { revalidate: false });
```

### With `useSWRImmutable`

```typescript
// Must explicitly revalidate
mutate(key, undefined, { revalidate: true });

// Or pass exact new data
mutate(key, newData, { revalidate: false });
```

## Common Pitfalls

1. **Using `useSWRImmutable` for user data**

   - Problem: Cache doesn't update when user makes changes elsewhere
   - Solution: Use `useSWR` for any user-mutable data

2. **Using `useSWR` for static content**

   - Problem: Unnecessary network requests on every tab focus
   - Solution: Use `useSWRImmutable` for truly static data

3. **Forgetting cross-tab sync needs**

   - Problem: User edits in one tab, sees stale data in another
   - Solution: Use `useSWR` with `revalidateOnFocus: true`

4. **Over-fetching with default `useSWR`**
   - Problem: Too many requests for user data
   - Solution: Use `mutatingFetcherConfig` with deduping

## References

- [SWR Revalidation](https://swr.vercel.app/docs/revalidation)
- [useSWRImmutable](https://swr.vercel.app/docs/revalidation#disable-automatic-revalidations)
- [SWR Mutation](https://swr.vercel.app/docs/mutation)
