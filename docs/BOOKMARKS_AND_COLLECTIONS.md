# Bookmarks and Collections System

This document provides comprehensive documentation for the bookmarks and collections feature in
quran.com-frontend-next.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Structures](#data-structures)
4. [Hooks](#hooks)
5. [Redux State](#redux-state)
6. [API Layer](#api-layer)
7. [UI Components](#ui-components)
8. [Collections Feature](#collections-feature)
9. [Sync Logic](#sync-logic)
10. [Caching Strategy](#caching-strategy)

---

## Overview

The bookmarks system allows users to save and organize Quran verses and pages for later reference.
Key features include:

- **Verse Bookmarks**: Save individual ayahs (verses)
- **Page Bookmarks**: Save entire pages
- **Collections**: Organize bookmarks into named groups
- **Dual Storage**: Local storage for anonymous users, server storage for logged-in users
- **Sync**: One-time sync of local bookmarks when user signs up
- **Mushaf-Aware**: Bookmarks are tied to specific mushaf (Quran edition/font)

---

## Architecture

### Storage Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        User State                                │
├─────────────────────────────┬───────────────────────────────────┤
│     Anonymous User          │         Logged-In User            │
├─────────────────────────────┼───────────────────────────────────┤
│  Redux Store                │  Server API                       │
│  ├─ bookmarkedVerses        │  ├─ /bookmarks                    │
│  └─ bookmarkedPages         │  ├─ /collections                  │
│                             │  └─ /collections/{id}/bookmarks   │
│  Persisted via              │                                   │
│  redux-persist              │  Cached via SWR                   │
│  (localStorage)             │                                   │
└─────────────────────────────┴───────────────────────────────────┘
```

### Data Flow

```
User Action (Add/Remove Bookmark)
         │
         ▼
    ┌────────────┐
    │ Is Logged  │
    │    In?     │
    └─────┬──────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
  Yes          No
    │           │
    ▼           ▼
 API Call    Redux
 (POST/      Dispatch
  DELETE)   (toggle)
    │           │
    ▼           ▼
 SWR Cache   Redux
 Mutate      Store
    │           │
    └─────┬─────┘
          │
          ▼
    UI Re-renders
```

---

## Data Structures

### Core Types

#### Bookmark (`types/Bookmark.ts`)

```typescript
interface Bookmark {
  id: string; // Unique identifier (server-generated)
  key: number; // Chapter number (for verses) or page number
  type: string; // BookmarkType enum value
  verseNumber?: number; // Verse number (only for Ayah bookmarks)
}
```

#### BookmarkType (`types/BookmarkType.ts`)

```typescript
enum BookmarkType {
  Page = 'page',
  Juz = 'juz',
  Surah = 'surah',
  Ayah = 'ayah',
}
```

#### BookmarksMap (`types/BookmarksMap.ts`)

```typescript
// Maps verse keys (e.g., "1:5") to Bookmark objects
// Used for bulk fetching bookmarks in a range
type BookmarksMap = Record<string, Bookmark>;
```

#### Collection (`types/Collection.ts`)

```typescript
type Collection = {
  id: string; // Unique identifier
  updatedAt: string; // ISO timestamp
  name: string; // Display name
  url: string; // Slugified ID for URL routing
};
```

#### Sort Options (`types/CollectionSortOptions.ts`)

```typescript
// For sorting bookmarks within a collection
enum CollectionDetailSortOption {
  RecentlyAdded = 'recentlyAdded',
  VerseKey = 'verseKey', // Mushaf order
}

// For sorting collections list
enum CollectionListSortOption {
  RecentlyUpdated = 'recentlyUpdated',
  Alphabetical = 'alphabetical',
}
```

---

## Hooks

### useVerseBookmark

**File:** `src/hooks/useVerseBookmark.ts`

Handles verse (Ayah) bookmark operations with support for both logged-in and anonymous users.

```typescript
interface UseVerseBookmarkProps {
  verse: WordVerse;
  mushafId: number;
  bookmarksRangeUrl?: string; // Optional URL for bulk-fetched bookmarks
}

interface UseVerseBookmarkReturn {
  isVerseBookmarked: boolean;
  isLoading: boolean;
  handleToggleBookmark: () => void;
}
```

**Features:**

- Optimistic updates for instant UI feedback
- SWR cache invalidation after changes
- Toast notifications for user feedback
- Supports bulk bookmark fetching via `bookmarksRangeUrl`

**Usage:**

```tsx
const { isVerseBookmarked, isLoading, handleToggleBookmark } = useVerseBookmark({
  verse,
  mushafId,
  bookmarksRangeUrl, // Pass this when using bulk fetching
});
```

### usePageBookmark

**File:** `src/hooks/usePageBookmark.ts`

Handles page bookmark operations.

```typescript
interface UsePageBookmarkProps {
  pageNumber: number;
  mushafId: number;
}

interface UsePageBookmarkReturn {
  isPageBookmarked: boolean;
  isLoading: boolean;
  handleToggleBookmark: () => void;
}
```

**Features:**

- Single page bookmark fetch via SWR
- Optimistic updates with error recovery
- Handles both logged-in and anonymous users

**Usage:**

```tsx
const { isPageBookmarked, isLoading, handleToggleBookmark } = usePageBookmark({
  pageNumber: 5,
  mushafId,
});
```

### useSyncUserData

**File:** `src/hooks/auth/useSyncUserData.ts`

One-time sync of local bookmarks to server when user signs up.

**Sync Flow:**

1. Check `getLastSyncAt()` - if null, sync needed
2. Convert Redux bookmarks to API format
3. POST to `/users/syncLocalData`
4. Set sync timestamp
5. Invalidate SWR caches

**Data Conversion:**

```typescript
// Local verse bookmark: { "1:5": 1699999999999 }
// Converted to:
{
  createdAt: "2023-11-14T12:00:00.000Z",
  type: "ayah",
  key: 1,           // Chapter number
  verseNumber: 5,
  mushaf: 1,
}
```

---

## Redux State

### Bookmarks Slice

**File:** `src/redux/slices/QuranReader/bookmarks.ts`

```typescript
type Bookmarks = {
  bookmarkedVerses: Record<string, number>; // verseKey -> timestamp
  bookmarkedPages: Record<string, number>; // pageNumber -> timestamp
};
```

### Reducers

```typescript
// Toggle a verse bookmark (add if missing, remove if exists)
toggleVerseBookmark(state, action: PayloadAction<string>)

// Toggle a page bookmark
togglePageBookmark(state, action: PayloadAction<string>)
```

### Selectors

```typescript
// Get bookmarked verses (insertion order - newest first)
selectBookmarks(state): Record<string, number>

// Get bookmarked pages
selectBookmarkedPages(state): Record<string, number>

// Get verses sorted by verse key (Mushaf order)
selectOrderedBookmarkedVerses(state): Record<string, number>

// Get pages sorted by page number
selectOrderedBookmarkedPages(state): Record<string, number>
```

**Usage:**

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';

const bookmarks = useSelector(selectBookmarks);
const dispatch = useDispatch();

// Toggle bookmark
dispatch(toggleVerseBookmark('1:5'));
```

---

## API Layer

### API Functions

**File:** `src/utils/auth/api.ts`

#### Bookmark Operations

```typescript
// Add a new bookmark
addBookmark({ key, mushafId, type, verseNumber }): Promise<Bookmark>

// Get a single bookmark
getBookmark(mushafId, key, type, verseNumber?): Promise<Bookmark>

// Get bookmarks in a range (bulk fetch)
getPageBookmarks(mushafId, chapterNumber, verseNumber, perPage): Promise<BookmarksMap>

// Delete a bookmark
deleteBookmarkById(bookmarkId): Promise<void>

// Get collections containing a bookmark
getBookmarkCollections(mushafId, key, type, verseNumber?): Promise<string[]>
```

#### Collection Operations

```typescript
// Get all user's collections
getCollectionsList(queryParams): Promise<{ data: Collection[] }>

// Get bookmarks in a collection
getBookmarksByCollectionId(collectionId, queryParams): Promise<GetBookmarkCollectionsIdResponse>

// Create a new collection
addCollection(collectionName): Promise<Collection>

// Rename a collection
updateCollection(collectionId, { name }): Promise<void>

// Delete a collection
deleteCollection(collectionId): Promise<void>

// Add bookmark to collection
addCollectionBookmark({ collectionId, key, mushaf, type, verseNumber }): Promise<void>

// Remove bookmark from collection by ID
deleteCollectionBookmarkById(collectionId, bookmarkId): Promise<void>

// Remove bookmark from collection by key
deleteCollectionBookmarkByKey({ collectionId, key, mushaf, type, verseNumber }): Promise<void>

// Sync local data to server
syncUserLocalData(payload): Promise<SyncUserLocalDataResponse>
```

### API Path Builders

**File:** `src/utils/auth/apiPaths.ts`

```typescript
// Bookmark URLs
makeBookmarksUrl(mushafId, limit?)           // GET /bookmarks?mushafId=X&limit=Y
makeBookmarkUrl(mushafId, key, type, verseNumber?)  // GET /bookmarks/bookmark?...
makeBookmarksRangeUrl(mushafId, chapter, verse, perPage)  // GET /bookmarks/ayahs-range?...
makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber?)  // GET /bookmarks/collections?...
makeDeleteBookmarkUrl(bookmarkId)            // DELETE /bookmarks/{id}

// Collection URLs
makeCollectionsUrl(queryParams)              // GET /collections?...
makeGetBookmarkByCollectionId(collectionId, queryParams)  // GET /collections/{id}?...
makeAllCollectionsItemsUrl(queryParams)      // GET /collections/all?...
makeAddCollectionUrl()                       // POST /collections
makeUpdateCollectionUrl(collectionId)        // POST /collections/{id}
makeDeleteCollectionUrl(collectionId)        // DELETE /collections/{id}
makeAddCollectionBookmarkUrl(collectionId)   // POST /collections/{id}/bookmarks
makeDeleteCollectionBookmarkByIdUrl(collectionId, bookmarkId)  // DELETE /collections/{id}/bookmarks/{bookmarkId}
makeDeleteCollectionBookmarkByKeyUrl(collectionId)  // DELETE /collections/{id}/bookmarks
```

---

## UI Components

### Bookmark Components

#### BookmarkIcon

**File:** `src/components/QuranReader/TranslationView/BookmarkIcon.tsx`

Displays bookmark icon in translation view. Shows only when verse is bookmarked.

```tsx
<BookmarkIcon verse={verse} bookmarksRangeUrl={bookmarksRangeUrl} />
```

#### PageBookmarkAction

**File:** `src/components/QuranReader/ContextMenu/components/PageBookmarkAction.tsx`

Context menu action for bookmarking/unbookmarking pages.

```tsx
<PageBookmarkAction pageNumber={currentPage} />
```

#### SaveToCollectionAction

**File:** `src/components/Verse/SaveToCollectionAction.tsx`

Menu item to save a verse to collections. Opens modal for collection management.

```tsx
<SaveToCollectionAction verse={verse} bookmarksRangeUrl={bookmarksRangeUrl} />
```

### Collection Components

#### SaveToCollectionModal

**File:** `src/components/Collection/SaveToCollectionModal/SaveToCollectionModal.tsx`

Modal for adding/removing bookmarks from collections.

```tsx
<SaveToCollectionModal
  isOpen={isOpen}
  onClose={onClose}
  bookmarkCollections={selectedCollectionIds}
  allCollections={collections}
  onCollectionToggled={handleToggle}
  onNewCollectionCreated={handleNewCollection}
/>
```

#### CollectionList

**File:** `src/components/Collection/CollectionList/CollectionList.tsx`

Displays all user's collections with sort options and management actions.

#### CollectionDetailContainer

**File:** `src/components/Collection/CollectionDetailContainer/CollectionDetailContainer.tsx`

Displays bookmarks within a collection with infinite scroll pagination.

#### BookmarkedVersesList

**File:** `src/components/Verses/BookmarkedVersesList.tsx`

Shows recent bookmarks (limit: 10) for quick access.

#### BookmarksAndCollectionsSection

**File:** `src/components/Verses/BookmarksAndCollectionsSection.tsx`

Tab-based section combining:

- Recently Read Sessions
- Bookmarks
- Collections (logged-in only)

---

## Collections Feature

### Hierarchy

```
Collections List (/collections)
    │
    ├── Collection A
    │   ├── Bookmark 1
    │   ├── Bookmark 2
    │   └── Bookmark 3
    │
    ├── Collection B
    │   ├── Bookmark 2  (same bookmark can be in multiple collections)
    │   └── Bookmark 4
    │
    └── All Saved Verses (/collections/all)  (aggregated view)
        ├── Bookmark 1
        ├── Bookmark 2
        ├── Bookmark 3
        └── Bookmark 4
```

### Collection Pages

#### All Collections Items

**File:** `src/pages/collections/all/index.tsx`

- Shows all bookmarks across all collections
- Cursor-based pagination with SWR Infinite
- Sort by Recently Added or Verse Key
- Protected route (requires authentication)

#### Collection Detail

**File:** `src/pages/collections/[collectionId]/index.tsx`

- Shows bookmarks in a specific collection
- Cursor-based pagination
- Owner can rename/delete collection
- Owner can remove bookmarks from collection

### Collection Operations Flow

```
Create Collection          Add to Collection         Remove from Collection
      │                          │                          │
      ▼                          ▼                          ▼
POST /collections     POST /collections/{id}/    DELETE /collections/{id}/
      │                    bookmarks                 bookmarks/{bookmarkId}
      ▼                          │                          │
Invalidate              Invalidate                  Invalidate
collections cache       bookmark caches             bookmark caches
```

---

## Sync Logic

### One-Time Sync on Signup

When a user signs up, their local (anonymous) bookmarks are synced to the server once.

**Flow:**

```
User Signs Up
      │
      ▼
Complete Signup Page
      │
      ▼
useSyncUserData Hook
      │
      ▼
Check getLastSyncAt()
      │
      ├─── Has value ──► Skip sync
      │
      └─── null ──► Perform sync
                         │
                         ▼
              Convert local bookmarks
              to API format
                         │
                         ▼
              POST /users/syncLocalData
                         │
                         ▼
              Set lastSyncAt timestamp
                         │
                         ▼
              Invalidate SWR caches
```

### Data Conversion

```typescript
// Local Redux format
{
  bookmarkedVerses: {
    "1:5": 1699999999999,   // verseKey: timestamp
    "2:255": 1699999999998,
  },
  bookmarkedPages: {
    "5": 1699999999997,     // pageNumber: timestamp
  }
}

// API sync format
{
  bookmarks: [
    {
      createdAt: "2023-11-14T12:00:00.000Z",
      type: "ayah",
      key: 1,
      verseNumber: 5,
      mushaf: 1,
    },
    {
      createdAt: "2023-11-14T11:59:59.998Z",
      type: "ayah",
      key: 2,
      verseNumber: 255,
      mushaf: 1,
    },
    {
      createdAt: "2023-11-14T11:59:59.997Z",
      type: "page",
      key: 5,
      mushaf: 1,
    },
  ]
}
```

---

## Caching Strategy

### SWR Cache Keys

The system uses multiple SWR cache keys for different granularities:

```typescript
// Single bookmark check
makeBookmarkUrl(mushafId, key, type, verseNumber?)
// Example: /bookmarks/bookmark?mushafId=1&key=1&type=ayah&verseNumber=5

// Bulk bookmark fetch (range)
makeBookmarksRangeUrl(mushafId, chapterNumber, verseNumber, perPage)
// Example: /bookmarks/ayahs-range?mushafId=1&chapterNumber=1&verseNumber=1&perPage=50

// All bookmarks list
makeBookmarksUrl(mushafId, limit?)
// Example: /bookmarks?mushafId=1&limit=10

// Collections containing a bookmark
makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber?)
// Example: /bookmarks/collections?mushafId=1&key=1&type=ayah&verseNumber=5

// Collections list
makeCollectionsUrl(queryParams)
// Example: /collections?type=ayah&sortBy=recentlyUpdated
```

### Cache Invalidation

After bookmark operations, multiple caches need invalidation:

```typescript
import { mutate as globalMutate } from 'swr';

// After adding/removing a bookmark:
globalMutate(makeBookmarksUrl(mushafId));           // Invalidate list
globalMutate(makeBookmarkUrl(...));                 // Invalidate single
globalMutate(bookmarksRangeUrl);                    // Invalidate range
globalMutate(makeBookmarkCollectionsUrl(...));      // Invalidate collections for bookmark
globalMutate(makeCollectionsUrl(...));              // Invalidate collections list
```

### Optimistic Updates

For instant UI feedback, optimistic updates are used:

```typescript
// Example from useVerseBookmark.ts
const handleRemoveBookmark = async () => {
  const bookmark = getBookmarkFromCache();
  if (!bookmark) return;

  // Optimistic update - remove from cache immediately
  updateBookmarkCaches(null); // Set to null/empty

  try {
    await deleteBookmarkById(bookmark.id);
    // Invalidate other caches
    globalMutate(makeBookmarksUrl(mushafId));
  } catch (error) {
    // Revert on error
    updateBookmarkCaches(bookmark);
    showToast(t('error-removing-bookmark'));
  }
};
```

---

## File Reference

### Types

| File                                       | Purpose             |
| ------------------------------------------ | ------------------- |
| `types/Bookmark.ts`                        | Bookmark interface  |
| `types/BookmarksMap.ts`                    | Bulk bookmarks type |
| `types/BookmarkType.ts`                    | Bookmark type enum  |
| `types/Collection.ts`                      | Collection type     |
| `types/CollectionSortOptions.ts`           | Sort enums          |
| `types/auth/SyncDataType.ts`               | Sync data type enum |
| `types/auth/GetBookmarksByCollectionId.ts` | API response type   |

### Hooks

| File                                | Purpose                   |
| ----------------------------------- | ------------------------- |
| `src/hooks/useVerseBookmark.ts`     | Verse bookmark operations |
| `src/hooks/usePageBookmark.ts`      | Page bookmark operations  |
| `src/hooks/auth/useSyncUserData.ts` | One-time sync on signup   |

### Redux

| File                                        | Purpose               |
| ------------------------------------------- | --------------------- |
| `src/redux/slices/QuranReader/bookmarks.ts` | Local bookmarks state |

### API

| File                         | Purpose       |
| ---------------------------- | ------------- |
| `src/utils/auth/api.ts`      | API functions |
| `src/utils/auth/apiPaths.ts` | URL builders  |

### Components

| File                                                                                | Purpose                           |
| ----------------------------------------------------------------------------------- | --------------------------------- |
| `src/components/QuranReader/TranslationView/BookmarkIcon.tsx`                       | Bookmark icon in translation view |
| `src/components/QuranReader/ContextMenu/components/PageBookmarkAction.tsx`          | Page bookmark context menu        |
| `src/components/Verse/SaveToCollectionAction.tsx`                                   | Save to collection menu item      |
| `src/components/Collection/SaveToCollectionModal/SaveToCollectionModal.tsx`         | Collection selection modal        |
| `src/components/Collection/CollectionList/CollectionList.tsx`                       | Collections list view             |
| `src/components/Collection/CollectionDetailContainer/CollectionDetailContainer.tsx` | Collection detail view            |
| `src/components/Verses/BookmarkedVersesList.tsx`                                    | Recent bookmarks list             |
| `src/components/Verses/BookmarksAndCollectionsSection.tsx`                          | Tabbed bookmarks/collections      |

### Pages

| File                                             | Purpose                       |
| ------------------------------------------------ | ----------------------------- |
| `src/pages/collections/all/index.tsx`            | All bookmarks aggregated view |
| `src/pages/collections/[collectionId]/index.tsx` | Collection detail page        |
