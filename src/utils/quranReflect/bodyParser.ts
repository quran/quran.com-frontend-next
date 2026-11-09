/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */
import { getQuranReflectTagUrl } from './navigation';

// Matches any letter/number from any language (equivalent to [\p{L}\p{N}_-] without ES6 unicode flag)
const HASHTAG_REGEX = /#([^\s!@#$%^&*()=+[\]{};:'",.<>?/\\|`~]+)/g;

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
// HTML tag names are case-insensitive and an end tag may have spaces before `>`
const ANCHOR_OPEN_REGEX = /<a[\s>]/gi;
const ANCHOR_CLOSE_REGEX = /<\/a\s*>/gi;

const lastMatchIndex = (text: string, pattern: RegExp): number => {
  const matches = Array.from(text.matchAll(pattern));
  return matches.length ? matches[matches.length - 1].index : -1;
};

const replaceUrlsWithLinks = (text: string): string => {
  const regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;#]*[-A-Z0-9+&@#/%=~_])/gi;
  return text.replace(regex, (url, ...args) => {
    // `replace` passes the match offset right before the full string.
    const offset = args[args.length - 2] as number;
    const beforeText = text.slice(0, offset);
    const lastAnchorOpen = lastMatchIndex(beforeText, ANCHOR_OPEN_REGEX);
    const lastAnchorClose = lastMatchIndex(beforeText, ANCHOR_CLOSE_REGEX);

    // URL is inside an anchor tag (its href or its link text), return as is
    if (lastAnchorOpen !== -1 && lastAnchorOpen > lastAnchorClose) {
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
      // 3. Wraps hashtags in links: Find all hashtags starting with # followed by one or more word characters. Skip hashtags inside anchor tags.
      .replace(HASHTAG_REGEX, (match, tag, offset, string) => {
        // Check if this hashtag is inside an anchor tag (href or link text)
        const beforeText = string.slice(0, offset);
        const lastAnchorOpen = beforeText.lastIndexOf('<a ');
        const lastAnchorClose = beforeText.lastIndexOf('</a>');

        // If we're inside an anchor tag (opened but not yet closed), don't convert to hashtag link
        if (lastAnchorOpen !== -1 && lastAnchorOpen > lastAnchorClose) {
          return match;
        }

        return tagToLink(tag, hashtagStyle);
      })
  );
};
