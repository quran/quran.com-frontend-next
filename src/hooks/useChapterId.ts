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

  if (chapterId) return [chapterId as string];
  if (juzId) return getChapterIdsForJuz(juzId as string);
  if (pageId) return getChapterIdsForPage(pageId as string);

  return [];
};

export default useChapterIdsByUrlPath;
