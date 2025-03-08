/**
 * Cleans a transcript by removing left-to-right and right-to-left marks
 *
 * @param {string} text - The text to clean
 * @returns {string} The cleaned text
 */
const cleanTranscript = (text: string): string => {
  return text.replace(/[\u200E\u200F]/g, '');
};

export default cleanTranscript;
