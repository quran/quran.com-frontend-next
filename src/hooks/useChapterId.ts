import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { getChapterIdsForJuz, getChapterIdsForPage } from 'src/utils/chapter';

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
const useChapterIdsByUrlPath = (): string[] => {
  const router = useRouter();
  const { chapterId, juzId, pageId } = router.query;
  const [chapterIds, setChapterIds] = useState([]);

  useEffect(() => {
    (async () => {
      if (chapterId) {
        setChapterIds([chapterId as string]);
      }
      if (pageId) {
        const chapterIdsForPage = await getChapterIdsForPage(pageId as string);
        setChapterIds(chapterIdsForPage);
      }
      if (juzId) {
        setChapterIds(await getChapterIdsForJuz(juzId as string));
      }
    })();
  }, [pageId, juzId, chapterId]);

  return chapterIds;
};

export default useChapterIdsByUrlPath;
