/* eslint-disable import/prefer-default-export */
/**
 * Shorten a text by setting the maximum number of characters
 * by the value of the parameter and adding "..." at the end.
 *
 * @param {string} rawString
 * @param {number} length
 * @returns {string}
 */
export const shortenString = (rawString: string, length = 150): string => {
  const characters = rawString.split('', length);
  let shortenedText = '';
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (shortenedText.length === length - 1) {
      shortenedText = `${shortenedText}${character}...`;
      break;
    }
    shortenedText = `${shortenedText}${character}`;
  }
  return shortenedText;
};
