/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */
import { getQuranReflectTagUrl } from './navigation';

const URL_REGEX = /(?<!<a href=')((http|https):\/\/[^\s]+)(?![^<]*'>)/g;

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

export const parseReflectionBody = (reflectionBody: string, hashtagStyle: string): string => {
  return (
    reflectionBody
      // 1. Wraps URLs in links: Find all URLs starting with http or https. The captured URL is then used to create a link.
      .replace(URL_REGEX, "<a href='$1' target='_blank'>$1</a>")
      // 2. Replaces new lines: match all occurrences of new lines (\n) and carriage returns (\r) and replaces them with the <br> tag.
      .replace(/\r?\n/g, '<br>')
      .replace(/#(\w+)/g, (_, tag) => tagToLink(tag, hashtagStyle))
  );
};
