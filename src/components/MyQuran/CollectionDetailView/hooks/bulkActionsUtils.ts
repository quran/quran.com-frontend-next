import { ToastFn, TranslateFn } from '../types';

import buildVerseCopyText from '@/components/Collection/CollectionDetail/utils/buildVerseCopyText';
import fetchVerseForCopy from '@/components/Collection/CollectionDetail/utils/fetchVerseForCopy';
import { ToastStatus } from '@/dls/Toast/Toast';
import Bookmark from '@/types/Bookmark';
import { deleteCollectionBookmarkById } from '@/utils/auth/api';
import { textToBlob } from '@/utils/blob';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';
import { QURAN_URL, getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { makeVerseKey } from '@/utils/verse';
import ChaptersData from 'types/ChaptersData';

const BULK_ACTIONS_CONCURRENCY_LIMIT = 5;

export const runWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];
  let index = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(null).map(async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentIndex = index;
      index += 1;
      if (currentIndex >= items.length) return;
      // eslint-disable-next-line no-await-in-loop
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  });
  await Promise.all(workers);
  return results;
};

export const buildBulkCopyBlobPromise = async (params: {
  chaptersData: ChaptersData;
  lang: string;
  selectedBookmarks: Bookmark[];
  selectedTranslations: number[];
}) => {
  const { chaptersData, lang, selectedBookmarks, selectedTranslations } = params;
  const verseKeys = selectedBookmarks
    .map((b) => (b.verseNumber ? makeVerseKey(b.key, b.verseNumber) : null))
    .filter(Boolean) as string[];

  const texts = await runWithConcurrency(verseKeys, BULK_ACTIONS_CONCURRENCY_LIMIT, async (vk) => {
    const verse = await fetchVerseForCopy(vk, selectedTranslations);
    const surahNumber = vk.split(':')[0];
    const chapter = getChapterData(chaptersData, surahNumber);
    const qdcUrl = `${QURAN_URL}${getVerseNavigationUrlByVerseKey(vk)}`;
    return buildVerseCopyText({ verse, chapter, lang, qdcUrl });
  });

  return textToBlob(texts.join('\n\n'));
};

export const deleteBookmarks = async (params: {
  numericCollectionId: string;
  bookmarkIds: string[];
}) => {
  const { numericCollectionId, bookmarkIds } = params;
  const results = await runWithConcurrency(
    bookmarkIds,
    BULK_ACTIONS_CONCURRENCY_LIMIT,
    async (bookmarkId) => {
      try {
        await deleteCollectionBookmarkById(numericCollectionId, bookmarkId);
        return { bookmarkId, ok: true as const };
      } catch {
        return { bookmarkId, ok: false as const };
      }
    },
  );

  return {
    deletedIds: results.filter((r) => r.ok).map((r) => r.bookmarkId),
    failedIds: results.filter((r) => !r.ok).map((r) => r.bookmarkId),
  };
};

export const showDeleteBookmarksSuccessToast = (params: {
  toast: ToastFn;
  t: TranslateFn;
  lang: string;
  count: number;
}) => {
  const { toast, t, lang, count } = params;
  toast(t('collection:delete-bookmark.success', { count: toLocalizedNumber(count, lang) }), {
    status: ToastStatus.Success,
  });
};
