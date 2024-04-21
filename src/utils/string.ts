/**
 * Shorten a text by setting the maximum number of characters
 * by the value of the parameter and adding "..." at the end.
 *
 * @param {string} rawString
 * @param {number} length
 * @param {string} suffix
 * @returns {string}
 */
export const truncateString = (rawString: string, length: number, suffix = '...'): string => {
  const characters = rawString.split('', length);
  let shortenedText = '';
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (shortenedText.length === length - 1) {
      shortenedText = `${shortenedText}${character}${suffix}`;
      break;
    }
    shortenedText = `${shortenedText}${character}`;
  }
  return shortenedText;
};

/**
 * Strip HTML tags from a string.
 *
 * @param {string} rawString
 * @returns {string}
 */
export const stripHTMLTags = (rawString: string): string => rawString.replace(/(<([^>]+)>)/gi, '');

/**
 * Convert a slugified collection id to collection id only after
 * removing the slug.
 *
 * @param {string} slugifiedCollectionId
 * @returns {string}
 */
export const slugifiedCollectionIdToCollectionId = (slugifiedCollectionId: string): string => {
  if (!slugifiedCollectionId) {
    return '';
  }
  const splits = slugifiedCollectionId.split('-');
  // if there is no slug in the url (collections with a name that cannot be slugified e.g. emoticons)
  if (splits.length === 1) {
    return splits[0];
  }
  return splits[splits.length - 1];
};
