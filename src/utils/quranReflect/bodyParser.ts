/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */
import { getQuranReflectTagUrl } from './navigation';

/**
 * Wraps hashtags in links: It finds all hashtags starting with # followed
 * by one or more word characters (\w+). The captured hashtag is then
 * used to create a link.
 *
 * @param {string} tag
 * @param {string} hashtagStyle
 * @returns {string}
 */
const tagToLink = (tag: string, hashtagStyle: string): string => {
  const tagWithHashTag = `#${tag}`;
  return `<a target="_blank" href="${getQuranReflectTagUrl(
    tagWithHashTag,
  )}" class="${hashtagStyle}">${tagWithHashTag}</a>`;
};

/**
 * Replaces URLs in a given text with HTML anchor tags.
 *
 * @param {string} text - The input text containing URLs.
 * @returns {string} The text with URLs replaced by anchor tags.
 */
const replaceUrlsWithLinks = (text: string): string => {
  const regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  return text.replace(regex, (url) => {
    // Check if URL is already linked
    const surroundingLength = 100; // Number of characters around the URL to check for <a> tag
    const index = text.indexOf(url);

    const beforeText = text.slice(Math.max(0, index - surroundingLength), index);
    const afterText = text.slice(index + url.length, index + url.length + surroundingLength);

    if (beforeText.includes('<a href=') && afterText.includes('</a>')) {
      // URL is already inside an anchor tag, return as is
      return url;
    }

    // Convert URL to a link
    return `<a href='${url}' target='_blank'>${url}</a>`;
  });
};

export const parseReflectionBody = (reflectionBody: string, hashtagStyle: string): string => {
  return (
    // 1. Wraps URLs in links: Find all URLs starting with http or https. The captured URL is then used to create a link.
    replaceUrlsWithLinks(reflectionBody)
      // 2. Replaces new lines: match all occurrences of new lines (\n) and carriage returns (\r) and replaces them with the <br> tag.
      .replace(/\r?\n/g, '<br>')
      // 3. Wraps hashtags in links: Find all hashtags starting with # followed by one or more word characters (\w+). The captured hashtag is then used to create a link.
      .replace(/#(\w+)/g, (_, tag) => tagToLink(tag, hashtagStyle))
  );
};
