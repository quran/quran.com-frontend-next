import { useRouter } from 'next/router';
/**
 * Given a url path such as /chapter/1, return the chapter id
 * This will also handle case where chapterId is not specified in the url path
 * For example: /juz/1, /pages/323. We will get the data for those url path from json files
 *
 * @param {string} urlPath
 * @returns {string[]} chapterIds
 */
const useChapterIdByUrlPath = (): [string] => {
  const router = useRouter();
  const { chapterId, juzId, pageId } = router.query;

  if (chapterId) return [chapterId as string];

  if (juzId) {
    // create json for juzId -> chapters
    return null;
  }

  if (pageId) {
    // create json for pages -> chapters
  }

  return null;
};

export default useChapterIdByUrlPath;
