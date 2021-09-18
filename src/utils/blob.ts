/**
 * Convert text to blob
 *
 * @param {string} text
 * @returns {Blob} textBlob
 */
export const textToBlob = (text: string): Blob => new Blob([text], { type: 'text/plain' });

/**
 * Convert text to blob
 *
 * @param {Blob} blob
 * @returns {Promise<string>} text
 */
export const blobToText = (blob: Blob): Promise<string> => blob.text();
