import Bookmark from '@/types/Bookmark';

const EMPTY_STRING_ARRAY: string[] = [];

export const filterCollectionBookmarks = (params: {
  bookmarks: Bookmark[];
  searchQuery?: string;
  selectedChapterIds?: string[];
  selectedJuzNumbers?: string[];
  getJuzNumberByVerse: (chapterNumber: number, verseNumber: number) => number | null | undefined;
}) => {
  const {
    bookmarks,
    searchQuery,
    selectedChapterIds = EMPTY_STRING_ARRAY,
    selectedJuzNumbers = EMPTY_STRING_ARRAY,
    getJuzNumberByVerse,
  } = params;

  const query = (searchQuery ?? '').trim().toLowerCase();

  const hasChapterFilters = selectedChapterIds.length > 0;
  const hasJuzFilters = selectedJuzNumbers.length > 0;
  const shouldFilter = hasChapterFilters || hasJuzFilters;

  const chapterIdSet = hasChapterFilters ? new Set(selectedChapterIds) : null;
  const juzSet = hasJuzFilters ? new Set(selectedJuzNumbers) : null;

  return bookmarks.filter((bookmark) => {
    const verseKey = `${bookmark.key}:${bookmark.verseNumber ?? 1}`;
    if (query && !verseKey.includes(query)) return false;
    if (!shouldFilter) return true;

    // When filtering, a filter group that isn't active should not "auto-match" everything.
    // We OR the active filter groups together so results match *any* selected chapter/juz.
    const matchesChapter = chapterIdSet ? chapterIdSet.has(String(bookmark.key)) : false;
    // Juz lookup is skipped when no juz filter is active (juzSet is null).
    const matchesJuz = juzSet
      ? juzSet.has(
          String(getJuzNumberByVerse(Number(bookmark.key), bookmark.verseNumber ?? 1) ?? ''),
        )
      : false;
    return matchesChapter || matchesJuz;
  });
};

export default filterCollectionBookmarks;
