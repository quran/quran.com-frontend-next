# SWR Cache Invalidation Best Practices Guide

This guide explains the proper way to handle cache invalidation in SWR, specifically for bookmark
and collection mutations.

---

## Table of Contents

1. [useSWR vs useSWRImmutable](#useswr-vs-useswrimmutable)
2. [mutate() vs cache.delete()](#mutate-vs-cachedelete)
3. [Common Pitfalls](#common-pitfalls)
4. [Best Practices](#best-practices)
5. [Practical Examples](#practical-examples)
6. [Fixing the Bookmark Bug](#fixing-the-bookmark-bug)

---

## useSWR vs useSWRImmutable

### What's the Difference?

| Feature             | useSWR                                 | useSWRImmutable                        |
| ------------------- | -------------------------------------- | -------------------------------------- |
| Auto revalidation   | ✅ Yes (on focus, reconnect, interval) | ❌ No automatic revalidation           |
| Manual revalidation | ✅ Via `mutate()`                      | ✅ Via `mutate()`                      |
| Use case            | Dynamic data that changes frequently   | Data requiring explicit manual control |
| Background updates  | ✅ Automatic                           | ❌ Only when you call `mutate()`       |

### When to Use Each

#### Use `useSWR` for

- **Dynamic data**: User profiles, dashboards, real-time data
- **Data that changes externally**: Other users might modify it
- **Data you want fresh**: When user switches tabs back
- **List views**: Collections list, bookmarks list, activity feeds

```typescript
// Good: Collections can be modified by user or other devices
const { data: collections } = useSWR(makeCollectionsUrl(), getCollectionsList);
```

#### Use `useSWRImmutable` for

- **Truly immutable data**: Historical records, archived content
- **Data requiring explicit control**: When you want to decide exactly when to refetch
- **Performance-critical views**: Reduce unnecessary network requests
- **Static content**: Configuration, lookup tables

```typescript
// Good: Chapter metadata doesn't change
const { data: chapterInfo } = useSWRImmutable(`/api/chapters/${id}`, fetcher);
```

### Important: useSWRImmutable ≠ Immutable Data

**Common Misconception**: "Use `useSWRImmutable` for data that never changes"

**Reality**: You can use `useSWRImmutable` for mutable data IF you properly invalidate the cache
with `mutate()` after mutations.

```typescript
// This is VALID if you mutate properly after changes
const { data: bookmark, mutate } = useSWRImmutable(makeBookmarkUrl(verseKey), getBookmark);

// After deleting, you MUST call mutate
await deleteBookmark(bookmark.id);
mutate(null, { revalidate: false }); // ← Required!
```

**Equivalent Configuration**:

```typescript
// useSWRImmutable is the same as:
useSWR(key, fetcher, {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
});
```

---

## mutate() vs cache.delete()

### Official SWR Recommendation

> **"You shouldn't directly write to the cache, which might cause undefined behaviors of SWR. Please
> use the SWR APIs such as mutate."**
>
> — SWR Official Documentation

### Why cache.delete() is Dangerous

```typescript
// ❌ WRONG - Causes undefined behaviors
cache.delete(makeBookmarkUrl(verseKey));

// Problems:
// 1. SWR doesn't know the cache was modified
// 2. Components using that data won't revalidate
// 3. Race conditions between cache deletion and SWR internal state
// 4. Can cause "stale cache" bugs where UI shows old data
```

### The Right Way: Use mutate()

```typescript
import { mutate as globalMutate } from 'swr';

// ✅ CORRECT - Clear cache without refetching
await globalMutate(makeBookmarkUrl(verseKey), undefined, {
  revalidate: false,
});

// ✅ CORRECT - Clear cache and refetch
await globalMutate(makeBookmarkUrl(verseKey));

// ✅ CORRECT - Optimistic update
await globalMutate(makeBookmarkUrl(verseKey), newBookmarkData, { revalidate: false });
```

### Global mutate vs Bound mutate

```typescript
// Bound mutate (from the hook)
const { data, mutate } = useSWR(key, fetcher);
await mutate(newData); // Only affects this specific SWR instance

// Global mutate (from useSWRConfig)
import { mutate as globalMutate } from 'swr';
await globalMutate(key, newData); // Affects ALL SWR instances using this key
```

**When to use each**:

- **Bound mutate**: When you have the hook instance available and only want to update that component
- **Global mutate**: When you need to invalidate cache from outside components, or affect multiple
  components using the same key

---

## Common Pitfalls

### Pitfall 1: Forgetting to mutate after API calls

```typescript
// ❌ WRONG - Cache never gets updated
const handleDelete = async () => {
  await deleteBookmarkById(bookmark.id);
  toast('Deleted!');
  // Bug: Component still shows old bookmark
};

// ✅ CORRECT - Invalidate cache after mutation
const handleDelete = async () => {
  await deleteBookmarkById(bookmark.id);
  mutate(null, { revalidate: false }); // ← Clear cache
  toast('Deleted!');
};
```

### Pitfall 2: Only invalidating one cache key

```typescript
// ❌ WRONG - Only clears one cache entry
const handleDelete = async () => {
  await deleteBookmarkById(bookmark.id);
  mutate(null, { revalidate: false });
  // Bug: Bookmarks list still shows deleted bookmark
  // Bug: Collection checkboxes still checked
};

// ✅ CORRECT - Invalidate ALL related caches
const handleDelete = async () => {
  await deleteBookmarkById(bookmark.id);

  // Clear the individual bookmark
  mutate(null, { revalidate: false });

  // Refetch the bookmarks list
  globalMutate(makeBookmarksUrl(mushafId));

  // Refetch collection memberships
  globalMutate(makeBookmarkCollectionsUrl(...));

  toast('Deleted!');
};
```

### Pitfall 3: Mixing cache.delete() with mutate()

```typescript
// ❌ WRONG - Inconsistent cache management
cache.delete(makeBookmarksUrl(mushafId));
globalMutate(makeBookmarkUrl(verseKey), undefined, { revalidate: false });

// ✅ CORRECT - Use mutate() consistently
globalMutate(makeBookmarksUrl(mushafId));
globalMutate(makeBookmarkUrl(verseKey), undefined, { revalidate: false });
```

### Pitfall 4: Not handling optimistic updates properly

```typescript
// ❌ WRONG - Optimistic update without rollback
const handleAdd = async () => {
  mutate(newBookmark, { revalidate: false });
  await addBookmark(data); // What if this fails?
};

// ✅ CORRECT - Optimistic update with error handling
const handleAdd = async () => {
  const originalData = bookmark;

  // Optimistically update
  mutate(newBookmark, { revalidate: false });

  try {
    const result = await addBookmark(data);
    mutate(result, { revalidate: false }); // Update with server response
  } catch (error) {
    mutate(originalData, { revalidate: false }); // Rollback on error
    toast('Failed to add bookmark');
  }
};
```

---

## Best Practices

### 1. Invalidate All Related Caches

When you mutate data, think about ALL the places that data appears:

```typescript
// Example: Deleting a bookmark affects:
// 1. Individual bookmark cache: makeBookmarkUrl(verseKey)
// 2. Bookmarks list: makeBookmarksUrl(mushafId)
// 3. Bookmarks range (for pagination): makeBookmarksRangeUrl(params)
// 4. Collection memberships: makeBookmarkCollectionsUrl(...)
// 5. Collections list (if bookmark count is shown): makeCollectionsUrl()

// ✅ Invalidate ALL of them
await Promise.all([
  globalMutate(makeBookmarkUrl(verseKey), undefined, { revalidate: false }),
  globalMutate(makeBookmarksUrl(mushafId)),
  globalMutate(makeBookmarksRangeUrl(params)),
  globalMutate(makeBookmarkCollectionsUrl(...)),
  globalMutate(makeCollectionsUrl()),
]);
```

### 2. Use Pattern Matching for Bulk Invalidation

The codebase has a `useMutateMultipleKeys` hook - use it!

```typescript
import useMutateMultipleKeys from '@/hooks/useMutateMultipleKeys';

const mutateMultipleKeys = useMutateMultipleKeys();

// Invalidate multiple related keys at once
await mutateMultipleKeys(
  [
    makeBookmarkUrl(verseKey),
    makeBookmarksUrl(mushafId),
    makeBookmarkCollectionsUrl(...),
  ],
  undefined,
  { revalidate: true }
);
```

### 3. Choose the Right Revalidation Strategy

```typescript
// Scenario 1: Delete - Clear cache, don't refetch
mutate(null, { revalidate: false });

// Scenario 2: Update - Refetch to get server state
mutate(undefined, { revalidate: true });

// Scenario 3: Optimistic add - Update immediately, then confirm
mutate(newData, { revalidate: false });
const result = await api();
mutate(result, { revalidate: false });

// Scenario 4: List invalidation - Always refetch
globalMutate(makeListUrl());
```

### 4. Handle Loading States

```typescript
const { data, mutate, isValidating } = useSWRImmutable(key, fetcher);

// ✅ Disable buttons during operations
<Button onClick={handleDelete} isDisabled={isValidating}>
  Delete
</Button>;
```

### 5. Use Proper Error Handling

```typescript
const handleMutation = async () => {
  try {
    await apiCall();
    mutate(newData, { revalidate: false });
    toast('Success!', { status: 'success' });
  } catch (error) {
    if (error.status === 400) {
      toast('Sync error', { status: 'error' });
    } else {
      toast('General error', { status: 'error' });
    }
    // Don't mutate cache on error - keep original data
  }
};
```

---

## Practical Examples

### Example 1: Adding a Bookmark

```typescript
const { data: bookmark, mutate } = useSWRImmutable(makeBookmarkUrl(verseKey), getBookmark);

const handleAddBookmark = async () => {
  try {
    // Optimistic update
    mutate(
      { id: 'temp', verseKey, createdAt: new Date() },
      {
        revalidate: false,
      },
    );

    // API call
    const newBookmark = await addBookmark({
      key: Number(verse.chapterId),
      mushafId,
      type: BookmarkType.Ayah,
      verseNumber: verse.verseNumber,
    });

    // Update with real data from server
    mutate(newBookmark, { revalidate: false });

    // Invalidate related caches
    await globalMutate(makeBookmarksUrl(mushafId));

    toast('Bookmark added!');
  } catch (error) {
    // Rollback optimistic update
    mutate(null, { revalidate: false });
    toast('Failed to add bookmark');
  }
};
```

### Example 2: Deleting a Bookmark

```typescript
const { data: bookmark, mutate } = useSWRImmutable(
  makeBookmarkUrl(verseKey),
  getBookmark
);

const handleDeleteBookmark = async () => {
  try {
    // Optimistic update - remove immediately
    mutate(null, { revalidate: false });

    // API call
    await deleteBookmarkById(bookmark.id);

    // Invalidate related caches
    await Promise.all([
      globalMutate(makeBookmarksUrl(mushafId)),
      globalMutate(makeBookmarksRangeUrl(params)),
      globalMutate(makeBookmarkCollectionsUrl(...)),
    ]);

    toast('Bookmark removed!');
  } catch (error) {
    // Rollback - restore bookmark
    mutate(bookmark, { revalidate: false });
    toast('Failed to remove bookmark');
  }
};
```

### Example 3: Removing from Collection

```typescript
const handleRemoveFromCollection = async (collectionId: string) => {
  try {
    // API call
    await deleteCollectionBookmarkById(collectionId, bookmark.id);

    // Invalidate collection membership cache
    mutate(undefined, { revalidate: true });

    // Invalidate collection details (if on collection detail page)
    await globalMutate(makeGetCollectionBookmarks(collectionId), undefined, { revalidate: true });

    toast('Removed from collection!');
  } catch (error) {
    toast('Failed to remove from collection');
  }
};
```

### Example 4: Updating Bookmark Range

```typescript
const updateInBookmarkRange = (value) => {
  if (bookmarksRangeUrl) {
    // ❌ WRONG - Direct cache manipulation
    const bookmarkedVersesRange = cache.get(bookmarksRangeUrl);
    const nextBookmarkedVersesRange = {
      ...bookmarkedVersesRange,
      [verse.verseKey]: value,
    };
    cache.set(bookmarksRangeUrl, nextBookmarkedVersesRange);

    // ✅ CORRECT - Use mutate
    globalMutate(
      bookmarksRangeUrl,
      (currentData) => ({
        ...currentData,
        [verse.verseKey]: value,
      }),
      { revalidate: false },
    );
  }
};
```

---

## Fixing the Bookmark Bug

### The Bug

**Symptom**: Deleting a bookmark or removing an ayah from a collection doesn't update the UI. The
bookmark icon stays highlighted, and the collection checkbox remains checked.

**Root Cause**: After calling `deleteBookmarkById()` or `deleteCollectionBookmarkById()`, the code
doesn't invalidate the SWR cache entries. The cache still contains the old data, so components
continue to show the "bookmarked" state.

### Current Code (Buggy)

```typescript
// src/components/Verse/BookmarkAction.tsx:156-161
deleteBookmarkById(bookmark.id).then(() => {
  updateInBookmarkRange(null);
  toast(t('verse-bookmark-removed'), {
    status: ToastStatus.Success,
  });
  // ❌ Missing: mutate() call to clear bookmark cache
  // ❌ Missing: Invalidate collection membership cache
});

// src/components/Verse/BookmarkAction.tsx:124-128
cache.delete(
  makeBookmarksUrl(getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf),
);
// ❌ Using cache.delete() instead of mutate()
```

### Fixed Code

```typescript
// After deleting bookmark
deleteBookmarkById(bookmark.id).then(() => {
  // ✅ 1. Clear the individual bookmark cache
  mutate(null, { revalidate: false });

  // ✅ 2. Invalidate the bookmarks list
  globalMutate(
    makeBookmarksUrl(
      getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
    ),
    undefined,
    { revalidate: true },
  );

  // ✅ 3. Invalidate collection membership cache
  globalMutate(
    makeBookmarkCollectionsUrl(
      mushafId,
      Number(verse.chapterId),
      BookmarkType.Ayah,
      Number(verse.verseNumber),
    ),
    undefined,
    { revalidate: true },
  );

  // ✅ 4. Update range cache
  updateInBookmarkRange(null);

  toast(t('verse-bookmark-removed'), {
    status: ToastStatus.Success,
  });
});
```

### Checklist for Cache Invalidation

When implementing bookmark/collection mutations, ensure you:

- [ ] Call `mutate()` (not `cache.delete()`) for all cache operations
- [ ] Invalidate the individual bookmark cache: `makeBookmarkUrl(...)`
- [ ] Invalidate the bookmarks list: `makeBookmarksUrl(...)`
- [ ] Invalidate the bookmarks range: `makeBookmarksRangeUrl(...)`
- [ ] Invalidate collection memberships: `makeBookmarkCollectionsUrl(...)`
- [ ] Invalidate collection details if on detail page: `makeGetCollectionBookmarks(...)`
- [ ] Invalidate collections list if count changed: `makeCollectionsUrl(...)`
- [ ] Handle errors and rollback optimistic updates
- [ ] Show appropriate loading states during mutations
- [ ] Display success/error toasts

---

## Quick Reference

### Do's and Don'ts

| ❌ Don't                           | ✅ Do                                                |
| ---------------------------------- | ---------------------------------------------------- |
| `cache.delete(key)`                | `mutate(key, undefined, { revalidate: false })`      |
| Forget to mutate after API calls   | Always mutate after mutations                        |
| Only invalidate one cache key      | Invalidate ALL related caches                        |
| Mix cache.delete() with mutate()   | Use mutate() consistently                            |
| Ignore error handling              | Handle errors and rollback                           |
| Use useSWRImmutable without mutate | Either use useSWR OR useSWRImmutable + proper mutate |

### Common Cache Keys to Invalidate

For bookmark operations:

```typescript
makeBookmarkUrl(mushafId, chapterId, type, verseNumber);
makeBookmarksUrl(mushafId);
makeBookmarksRangeUrl(params);
makeBookmarkCollectionsUrl(mushafId, chapterId, type, verseNumber);
```

For collection operations:

```typescript
makeCollectionsUrl({ type: BookmarkType.Ayah })
makeGetCollectionBookmarks(collectionId)
makeBookmarkCollectionsUrl(...) // Which collections contain this bookmark
```

---

## Additional Resources

- [SWR Mutation Documentation](https://swr.vercel.app/docs/mutation)
- [SWR Cache Documentation](https://swr.vercel.app/docs/advanced/cache)
- [SWR Revalidation Options](https://swr.vercel.app/docs/revalidation)
- [SWR GitHub Discussions on Best Practices](https://github.com/vercel/swr/discussions/567)

---

## Questions?

If you're unsure about cache invalidation for a specific case, ask yourself:

1. **What data did I just change?** (bookmark, collection, etc.)
2. **Where does this data appear in the UI?** (bookmark icon, lists, counts, etc.)
3. **What are ALL the cache keys related to this data?** (individual, lists, ranges, etc.)
4. **Should I refetch or just clear?** (Delete → clear, Update → refetch)
5. **What happens if the API call fails?** (Rollback optimistic updates)

When in doubt, invalidate more rather than less - better to have an extra network request than stale
UI.

---

**Document Version**: 1.0 **Last Updated**: 2025-11-12 **Applies to**: SWR v2.x
