import { getEarliestDate, parseDate } from './datetime';
import { ONE_DAY_REVALIDATION_PERIOD_SECONDS } from './staticPageGeneration';

export const getPageTitle = (page) => {
  if (!page) {
    return null;
  }
  let title = '';
  page.properties.Name.title.forEach((titleObject) => {
    title = `${title} ${titleObject.plain_text}`;
  });
  return title;
};

/**
 * Get the revalidation time for the notion Incrementally Static Regenerated page:
 *
 * 1. If there are no image blocks, return the default value (1 day).
 * 2. If there are some images, each will have an expiry date which
 *    is 1 hour from the time it was requested. We get the one that will
 *    expire the soonest (there will be slight difference between them e.g. '2021-12-06T06:04:59.684Z', '2021-12-06T06:04:59.731Z').
 *    and then we calculate the difference in seconds between the time the page is about
 *    to be statically generated and the soonest time an image will expire.
 *
 * @param {any[]} pagesBlocks
 * @returns {number}
 */
export const getRevalidationTime = (pagesBlocks): number => {
  let filesExpiryTime = [];
  pagesBlocks.forEach((pageBlocks) => {
    filesExpiryTime = [...filesExpiryTime, ...getPageBlocksImageExpiryTime(pageBlocks)];
  });
  // if the are no image block, we use the default value
  if (!filesExpiryTime.length) {
    return ONE_DAY_REVALIDATION_PERIOD_SECONDS;
  }
  // the difference in seconds between the soonest expiry time and now (the time the page is being statically generated)
  return Math.floor(
    (getEarliestDate(filesExpiryTime) - parseDate(new Date().toUTCString())) / 1000,
  );
};

const getPageBlocksImageExpiryTime = (pageBlocks) => {
  const filesExpiryTime = [];
  pageBlocks.forEach((pageBlock) => {
    if (pageBlock.type === 'image') {
      filesExpiryTime.push(pageBlock.image.file.expiry_time);
    }
  });
  return filesExpiryTime;
};
