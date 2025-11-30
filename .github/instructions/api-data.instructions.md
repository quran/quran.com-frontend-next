---
applyTo: 'src/api.ts,src/hooks/**/*.ts,src/services/**/*.ts,src/utils/api/**/*.ts'
---

# API & Data Handling Review Standards

Guidelines for API calls and data handling in the Quran.com frontend.

## Data Fetching

- Require `useSWR` for data fetching - flag raw fetch/axios calls in components
- Use `useSWRImmutable` for data that rarely changes (chapters list, translations list)
- Flag redundant API calls - suggest caching strategies

```typescript
// Good - using useSWR
const { data, error, isLoading } = useSWR(makeVersesUrl(chapterId), fetcher);

// Bad - manual fetching without caching
useEffect(() => {
  fetch(makeVersesUrl(chapterId))
    .then((res) => res.json())
    .then(setData);
}, [chapterId]);
```

## State Management

- Flag using Redux/store when `useSWR` cache is sufficient
- Require optimistic updates for predictable actions (like, bookmark, etc.)

```typescript
// Good - optimistic update
const handleBookmark = async () => {
  mutate(key, optimisticData, false); // Update UI immediately
  await addBookmark(verseKey);
  mutate(key); // Revalidate
};
```

## Error Handling

- Require error states for all API-dependent components
- Flag blind trust in API responses - always provide fallbacks
- Ensure meaningful error messages for users

```typescript
// Good
if (error) {
  return <ErrorMessage message={t('error.failed-to-load')} />;
}
if (!data) {
  return <VersesSkeleton />;
}

// Bad - no error handling
return <VersesList verses={data.verses} />;
```

## Response Validation

- Flag direct usage of API response without null checks
- Require fallback values for optional response fields

```typescript
// Good
const versesCount = response?.pagination?.totalRecords ?? 0;

// Bad
const versesCount = response.pagination.totalRecords;
```
