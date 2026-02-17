/**
 * Decodes HTML entities in a string (e.g., &gt; to >, &lt; to <, &amp; to &)
 * @param {string} text - The text containing HTML entities
 * @returns {string} The decoded text
 */
export const decodeHTMLEntities = (text: string): string => {
  if (typeof text !== 'string') return text;
  if (typeof document === 'undefined') return text;
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

export default decodeHTMLEntities;
