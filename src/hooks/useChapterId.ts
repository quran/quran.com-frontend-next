import { useState, useEffect, useContext } from 'react';

import { useRouter } from 'next/router';

import { getChapterIdsForJuz, getChapterIdsForPage } from '@/utils/chapter';
import { getChapterIdsForHizb } from '@/utils/hizb';
import { formatStringNumber } from '@/utils/number';
import { getChapterIdsForRub } from '@/utils/rub';
import { isValidChapterId, isValidVerseKey } from '@/utils/validator';
import { getChapterNumberFromKey } from '@/utils/verse';
import { getChapterIdBySlug } from 'src/api';
import DataContext from 'src/contexts/DataContext';

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
  const { chapterId, juzId, pageId, hizbId, rubId } = router.query;
  const [chapterIds, setChapterIds] = useState([]);
  const chaptersData = useContext(DataContext);
  useEffect(() => {
    (async () => {
      if (chapterId) {
        const chapterIdOrVerseKeyOrSlug = chapterId as string;
        // if it's a chapter id
        if (isValidChapterId(chapterIdOrVerseKeyOrSlug)) {
          setChapterIds([formatStringNumber(chapterIdOrVerseKeyOrSlug)]);
        } else if (isValidVerseKey(chaptersData, chapterIdOrVerseKeyOrSlug)) {
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
      } else if (hizbId) {
        setChapterIds(await getChapterIdsForHizb(formatStringNumber(hizbId as string)));
      } else if (rubId) {
        setChapterIds(await getChapterIdsForRub(formatStringNumber(rubId as string)));
      }
    })();
  }, [pageId, juzId, hizbId, rubId, lang, chapterId, chaptersData]);

  return chapterIds;
};

export default useChapterIdsByUrlPath;
