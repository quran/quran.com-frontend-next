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
 * Strip HTML tags from a string using regex.
 * For simple cases where a quick strip is needed.
 *
 * @param {string} rawString
 * @returns {string}
 */
export const stripHTMLTags = (rawString: string): string => rawString.replace(/(<([^>]+)>)/gi, '');

/**
 * Strip HTML tags from a string, extracting only the text content.
 * Uses DOMParser in browser for accurate parsing, regex fallback for SSR.
 * Handles complex HTML with nested tags, attributes, and special characters.
 *
 * @param {string} html - The HTML string to strip
 * @returns {string} - Plain text content without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';

  // Use DOMParser in browser for accurate HTML parsing
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch {
      // Fallback to regex if DOMParser fails
    }
  }

  // Server-side fallback: regex strip
  // This handles most HTML but may not be 100% accurate for malformed HTML
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags and content
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Get the text length of HTML content (excluding tags).
 * Useful for determining if content should be truncated.
 *
 * @param {string} html - The HTML string to measure
 * @returns {number} - Length of the text content
 */
export const getHtmlTextLength = (html: string): number => {
  return stripHtml(html).length;
};

/**
 * Truncate HTML content safely while preserving the original HTML structure.
 * Counts only visible text characters and properly closes any open tags.
 * Returns original HTML if text content is within limit.
 *
 * @param {string} html - The HTML string to truncate
 * @param {number} maxLength - Maximum length of text content allowed
 * @param {string} suffix - Suffix to add when truncating (default: '...')
 * @returns {string} - Truncated HTML with preserved structure or original HTML
 */
export const truncateHtml = (html: string, maxLength: number, suffix = '...'): string => {
  if (!html) return '';

  const text = stripHtml(html);

  // If text is within limit, return original HTML
  if (text.length <= maxLength) {
    return html;
  }

  // Track open tags to close them properly
  const openTags: string[] = [];
  let charCount = 0;
  let result = '';
  let i = 0;

  while (i < html.length && charCount < maxLength) {
    const char = html[i];

    if (char === '<') {
      // Find the end of the tag
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) break;

      const fullTag = html.slice(i, tagEnd + 1);

      // Check if it's a closing tag
      if (fullTag.startsWith('</')) {
        const tagName = fullTag.slice(2, -1).toLowerCase();
        // Remove the matching open tag
        const lastIndex = openTags.lastIndexOf(tagName);
        if (lastIndex !== -1) {
          openTags.splice(lastIndex, 1);
        }
        result += fullTag;
      }
      // Check if it's a self-closing tag (like <br/>, <img/>)
      else if (fullTag.endsWith('/>') || /^<(br|hr|img|input|meta|link)[\s>]/i.test(fullTag)) {
        result += fullTag;
      }
      // It's an opening tag
      else {
        // Extract just the tag name (handle attributes)
        const tagNameMatch = fullTag.match(/^<(\w+)/);
        if (tagNameMatch) {
          openTags.push(tagNameMatch[1].toLowerCase());
        }
        result += fullTag;
      }

      i = tagEnd + 1;
    } else {
      result += char;
      charCount += 1;
      i += 1;
    }
  }

  // Close any remaining open tags in reverse order
  for (let j = openTags.length - 1; j >= 0; j -= 1) {
    result += `</${openTags[j]}>`;
  }

  return `${result}${suffix}`;
};

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

/**
 * Cleans a transcript by removing left-to-right and right-to-left marks
 *
 * @param {string} text - The text to clean
 * @returns {string} The cleaned text
 */
export const cleanTranscript = (text: string): string => {
  return text.replace(/[\u200E\u200F]/g, '');
};

/**
 * Converts verse references in text to clickable links.
 * Example: "1:1" or "1:1-2" or "1:1-2:3" will be converted to HTML anchor tags.
 *
 * @param {string} text - The text containing verse references
 * @returns {string} The text with verse references converted to links
 */
export const formatVerseReferencesToLinks = (text: string): string => {
  if (!text) return '';
  return text.replace(
    /(\d{1,3}[:-]\d{1,3}(?:-\d{1,3}(?::\d{1,3})?)?)(?![^<]*<\/a>)/g,
    (match) => `<a href="${`/${match}`}" target="_blank">${match}</a>`,
  );
};

/**
 * Count the number of words in a text string.
 *
 * @param {string} text
 * @returns {number}
 */
export const getWordCount = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

/**
 * Check if a string contains only numeric digits (0-9).
 * Returns false for empty strings, strings with decimals, negatives, or whitespace.
 *
 * @param {string} value - The string to check
 * @returns {boolean} True if the string contains only digits
 *
 * @example
 * isNumericString('123')    // true
 * isNumericString('0')      // true
 * isNumericString('')       // false
 * isNumericString('12.3')   // false
 * isNumericString('-5')     // false
 * isNumericString('12 ')    // false
 * isNumericString('abc')    // false
 */
export const isNumericString = (value: string): boolean => /^\d+$/.test(value);
