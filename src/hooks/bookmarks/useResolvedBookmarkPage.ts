import useSWR from 'swr';

import { Mushaf } from '@/types/QuranReader';
import { parsePageReadingBookmark } from '@/utils/bookmark';
import { getVersePageNumber } from '@/utils/verse';

const useResolvedBookmarkPage = (
  bookmark: string | null | undefined,
  mushafId: Mushaf,
): { resolvedPage: number | null } => {
  const parsed = bookmark ? parsePageReadingBookmark(bookmark) : null;
  const isExtendedPageBookmark = !!parsed;
  const storedPageFromBookmark = parsed?.pageNumber ?? null;
  const surahForBookmark = parsed?.surahNumber ?? null;
  const verseForBookmark = parsed?.verseNumber ?? null;
  const { data: mappedPageNumber } = useSWR(
    isExtendedPageBookmark
      ? `verse-to-page-${surahForBookmark}-${verseForBookmark}-${mushafId}`
      : null,
    () =>
      getVersePageNumber(
        { surahNumber: surahForBookmark as number, verseNumber: verseForBookmark as number },
        mushafId,
      ),
  );

  let resolvedPage: number | null = null;
  if (typeof mappedPageNumber === 'number') {
    resolvedPage = mappedPageNumber;
  } else if (isExtendedPageBookmark) {
    resolvedPage = storedPageFromBookmark as number;
  }

  return { resolvedPage };
};

export default useResolvedBookmarkPage;
