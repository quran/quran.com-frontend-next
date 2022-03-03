import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { getChapterIdBySlug } from 'src/api';
import { getChapterIdsForJuz, getChapterIdsForPage } from 'src/utils/chapter';
import { formatStringNumber } from 'src/utils/number';
import { isValidChapterId, isValidVerseKey } from 'src/utils/validator';
import { getChapterNumberFromKey } from 'src/utils/verse';

/**
 * Given a url path such as `/chapter/1`, return the chapters id
 * This will also handle case where chapterId is not specified in the url path
 * For example: `/juz/1`, `/pages/323`. We will get the data for those url path from json files
 *
 * @returns {string[]} chapterIds
 *
 * example:
 * - /juz/1 => ["1", "2"]
 * - /page/2 => ["2"]
 * - /chapter/1 => ["1"]
 */
const AYAH_KURSI_SLUGS = ['ayatul-kursi', 'آیت الکرسی']; // TODO: this needs to be refactored when we localize Ayatul Kursi
const useChapterIdsByUrlPath = (lang: string): string[] => {
  const router = useRouter();
  const { chapterId, juzId, pageId } = router.query;
  const [chapterIds, setChapterIds] = useState([]);
  useEffect(() => {
    (async () => {
      if (chapterId) {
        const chapterIdOrVerseKeyOrSlug = chapterId as string;
        // if it's a chapter id
        if (isValidChapterId(chapterIdOrVerseKeyOrSlug)) {
          setChapterIds([formatStringNumber(chapterIdOrVerseKeyOrSlug)]);
        } else if (isValidVerseKey(chapterIdOrVerseKeyOrSlug)) {
          // if it's a verse key e.g 5:1
          setChapterIds([getChapterNumberFromKey(chapterIdOrVerseKeyOrSlug).toString()]);
        } else if (AYAH_KURSI_SLUGS.includes(chapterIdOrVerseKeyOrSlug.toLowerCase())) {
          // if it's Ayatul Kursi
          setChapterIds(['2']);
        } else {
          // we need to convert the slug into a chapterId by calling BE
          const sluggedChapterId = await getChapterIdBySlug(chapterIdOrVerseKeyOrSlug, lang);
          // if it's a valid slug and the call doesn't have any errors
          if (sluggedChapterId) {
            setChapterIds([sluggedChapterId.toString()]);
          }
        }
      } else if (pageId) {
        const chapterIdsForPage = await getChapterIdsForPage(formatStringNumber(pageId as string));
        setChapterIds(chapterIdsForPage);
      } else if (juzId) {
        setChapterIds(await getChapterIdsForJuz(formatStringNumber(juzId as string)));
      }
    })();
  }, [pageId, juzId, lang, chapterId]);

  return chapterIds;
};

export default useChapterIdsByUrlPath;
