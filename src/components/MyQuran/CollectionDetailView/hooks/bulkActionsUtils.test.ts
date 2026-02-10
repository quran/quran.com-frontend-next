/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildBulkCopyBlobPromise,
  deleteBookmarks,
  showDeleteBookmarksSuccessToast,
} from './bulkActionsUtils';

import buildVerseCopyText from '@/components/Collection/CollectionDetail/utils/buildVerseCopyText';
import fetchVerseForCopy from '@/components/Collection/CollectionDetail/utils/fetchVerseForCopy';
import { ToastStatus } from '@/dls/Toast/Toast';
import Verse from '@/types/Verse';
import { deleteCollectionBookmarkById } from '@/utils/auth/api';
import { textToBlob } from '@/utils/blob';
import { getChapterData } from '@/utils/chapter';
import { getVerseNavigationUrlByVerseKey, QURAN_URL } from '@/utils/navigation';

vi.mock('@/components/Collection/CollectionDetail/utils/fetchVerseForCopy', () => ({
  default: vi.fn(),
}));

vi.mock('@/components/Collection/CollectionDetail/utils/buildVerseCopyText', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/blob', () => ({
  textToBlob: vi.fn(),
}));

vi.mock('@/utils/chapter', () => ({
  getChapterData: vi.fn(),
}));

vi.mock('@/utils/navigation', () => ({
  QURAN_URL: 'https://quran.com',
  getVerseNavigationUrlByVerseKey: vi.fn((vk: string) => `/v/${vk}`),
}));

vi.mock('@/utils/auth/api', () => ({
  deleteCollectionBookmarkById: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
}));

describe('bulkActionsUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildBulkCopyBlobPromise', () => {
    it('builds a blob from selected bookmarks with verse numbers and joins texts with blank lines', async () => {
      vi.mocked(fetchVerseForCopy).mockImplementation(
        async (vk: string) => ({ verseKey: vk } as Verse),
      );
      vi.mocked(getChapterData).mockReturnValue({ id: 1, nameSimple: 'Al-Fatihah' } as any);
      vi.mocked(buildVerseCopyText).mockImplementation(({ qdcUrl }: any) => `TEXT:${qdcUrl}`);
      vi.mocked(textToBlob).mockImplementation((text: string) => ({ text } as any));

      const chaptersData = {} as any;

      const blob = await buildBulkCopyBlobPromise({
        chaptersData,
        lang: 'en',
        selectedBookmarks: [
          { id: 'b1', key: '1', verseNumber: 1 } as any,
          { id: 'b2', key: '1', verseNumber: 2 } as any,
          // Should be ignored (missing verseNumber)
          { id: 'b3', key: '2' } as any,
        ],
        selectedTranslations: [20, 131],
      });

      expect(fetchVerseForCopy).toHaveBeenCalledWith('1:1', [20, 131]);
      expect(fetchVerseForCopy).toHaveBeenCalledWith('1:2', [20, 131]);
      expect(getChapterData).toHaveBeenCalledWith(chaptersData, '1');
      expect(getVerseNavigationUrlByVerseKey).toHaveBeenCalledWith('1:1');
      expect(getVerseNavigationUrlByVerseKey).toHaveBeenCalledWith('1:2');

      const expected1 = `${QURAN_URL}/v/1:1`;
      const expected2 = `${QURAN_URL}/v/1:2`;
      expect(buildVerseCopyText).toHaveBeenCalledWith(
        expect.objectContaining({ lang: 'en', qdcUrl: expected1 }),
      );
      expect(buildVerseCopyText).toHaveBeenCalledWith(
        expect.objectContaining({ lang: 'en', qdcUrl: expected2 }),
      );

      expect(textToBlob).toHaveBeenCalledWith(`TEXT:${expected1}\n\nTEXT:${expected2}`);
      expect(blob).toEqual({ text: `TEXT:${expected1}\n\nTEXT:${expected2}` });
    });

    it('preserves bookmark order even when verse fetch resolves out-of-order', async () => {
      vi.useFakeTimers();

      vi.mocked(fetchVerseForCopy).mockImplementation(
        (vk: string) =>
          new Promise<any>((resolve) => {
            const delayMs = vk === '1:1' ? 30 : 10; // 1:2 resolves first
            setTimeout(() => resolve({ verseKey: vk }), delayMs);
          }),
      );
      vi.mocked(getChapterData).mockReturnValue({ id: 1, nameSimple: 'Al-Fatihah' } as any);
      vi.mocked(buildVerseCopyText).mockImplementation(({ qdcUrl }: any) => qdcUrl);
      vi.mocked(textToBlob).mockImplementation((text: string) => ({ text } as any));

      const chaptersData = {} as any;

      const p = buildBulkCopyBlobPromise({
        chaptersData,
        lang: 'en',
        selectedBookmarks: [
          { id: 'b1', key: '1', verseNumber: 1 } as any,
          { id: 'b2', key: '1', verseNumber: 2 } as any,
        ],
        selectedTranslations: [20],
      });

      await vi.runAllTimersAsync();

      await expect(p).resolves.toEqual({ text: `${QURAN_URL}/v/1:1\n\n${QURAN_URL}/v/1:2` });

      vi.useRealTimers();
    });
  });

  describe('deleteBookmarks', () => {
    it('returns deleted and failed ids based on API results', async () => {
      vi.mocked(deleteCollectionBookmarkById).mockImplementation(
        async (_cid: string, bid: string) => {
          if (bid === 'b2') throw new Error('fail');
          return undefined as any;
        },
      );

      await expect(
        deleteBookmarks({ numericCollectionId: '123', bookmarkIds: ['b1', 'b2', 'b3'] }),
      ).resolves.toEqual({
        deletedIds: ['b1', 'b3'],
        failedIds: ['b2'],
      });
    });
  });

  describe('showDeleteBookmarksSuccessToast', () => {
    it('shows a success toast with localized count', () => {
      const toast = vi.fn();
      const t = vi.fn((key: string, query?: Record<string, unknown>) => `${key}:${query?.count}`);

      showDeleteBookmarksSuccessToast({ toast: toast as any, t: t as any, lang: 'en', count: 3 });

      expect(toast).toHaveBeenCalledWith('collection:delete-bookmark.success:3', {
        status: ToastStatus.Success,
      });
    });
  });
});
