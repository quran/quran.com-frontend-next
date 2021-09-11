/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import { useRouter } from 'next/router';
/**
 * Given a url path such as /chapter/1, return the chapter id
 * This will also handle case where chapterId is not specified in the url path
 * For example: /juz/1, /pages/323. We will get the data for those url path from json files
 *
 * @param {string} urlPath
 * @returns {string[]} chapterIds
 */
const useChapterIdByUrlPath = (): string[] => {
  const router = useRouter();
  const { chapterId, juzId, pageId } = router.query;

  if (chapterId) return [chapterId as string];

  if (juzId) {
    const juzsData = require('../../public/data/juzs.json');
    return Object.keys(juzsData[juzId as string].verseMapping);
  }

  if (pageId) {
    const juzsData = require('../../public/data/pages.json');
    return Object.keys(juzsData[juzId as string].verseMapping);
  }

  return null;
};

export default useChapterIdByUrlPath;
