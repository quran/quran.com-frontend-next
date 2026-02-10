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

const runWithConcurrencySettled = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> => {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let index = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(null).map(async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentIndex = index;
      index += 1;
      if (currentIndex >= items.length) return;

      try {
        // eslint-disable-next-line no-await-in-loop
        const value = await mapper(items[currentIndex]);
        results[currentIndex] = { status: 'fulfilled', value };
      } catch (reason) {
        results[currentIndex] = { status: 'rejected', reason };
      }
    }
  });
  await Promise.allSettled(workers);
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

  const settledTexts = await runWithConcurrencySettled(
    verseKeys,
    BULK_ACTIONS_CONCURRENCY_LIMIT,
    async (vk) => {
      const verse = await fetchVerseForCopy(vk, selectedTranslations);
      const surahNumber = vk.split(':')[0];
      const chapter = getChapterData(chaptersData, surahNumber);
      const qdcUrl = `${QURAN_URL}${getVerseNavigationUrlByVerseKey(vk)}`;
      return buildVerseCopyText({ verse, chapter, lang, qdcUrl });
    },
  );

  const rejected = settledTexts.find((r) => r.status === 'rejected');
  if (rejected) throw rejected.reason;

  const texts = settledTexts.map((r) => (r as PromiseFulfilledResult<string>).value);

  return textToBlob(texts.join('\n\n'));
};

export const deleteBookmarks = async (params: {
  numericCollectionId: string;
  bookmarkIds: string[];
}) => {
  const { numericCollectionId, bookmarkIds } = params;
  const results = await runWithConcurrencySettled(
    bookmarkIds,
    BULK_ACTIONS_CONCURRENCY_LIMIT,
    async (bookmarkId) => deleteCollectionBookmarkById(numericCollectionId, bookmarkId),
  );

  return {
    deletedIds: results
      .map((r, idx) => (r.status === 'fulfilled' ? bookmarkIds[idx] : null))
      .filter((id): id is string => id !== null),
    failedIds: results
      .map((r, idx) => (r.status === 'rejected' ? bookmarkIds[idx] : null))
      .filter((id): id is string => id !== null),
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
