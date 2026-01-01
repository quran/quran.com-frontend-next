import { logErrorToSentry } from '@/lib/sentry';
import Room, { RoomType } from '@/types/QuranReflect/Room';
import stringify from '@/utils/qs-stringify';

export const API_HOST = process.env.NEXT_PUBLIC_QURAN_REFLECT_URL;

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const buildSubdomainUrl = (baseUrl: string, subdomain: string) => {
  const sanitizedBase = stripTrailingSlash(baseUrl || '');
  const trimmedSubdomain = (subdomain || '').trim();

  if (!sanitizedBase) return '';
  if (!trimmedSubdomain) return sanitizedBase;

  try {
    const parsedUrl = new URL(sanitizedBase);
    const portSegment = parsedUrl.port ? `:${parsedUrl.port}` : '';
    const hostWithSubdomain = `${trimmedSubdomain}.${parsedUrl.hostname}${portSegment}`;
    const pathSegment = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname;
    return `${parsedUrl.protocol}//${hostWithSubdomain}${pathSegment}${parsedUrl.search}${parsedUrl.hash}`;
  } catch (error) {
    logErrorToSentry(error as Error, {
      metadata: { baseUrl, subdomain },
      transactionName: 'getReflectionGroupLink',
    });
    const protocolMatch = sanitizedBase.match(/^(https?:\/\/)/i);
    const protocol = protocolMatch?.[1] ?? 'https://';
    const hostWithoutProtocol = sanitizedBase.replace(/^(https?:\/\/)/i, '');
    return `${protocol}${trimmedSubdomain}.${hostWithoutProtocol}`;
  }
};

const getQuranReflectFilteredVerseUrl = (chapterId: string, verseNumber: string, params) => {
  return `${API_HOST}?filters=${chapterId}:${verseNumber}&${stringify(params)}`;
};

export const getQuranReflectVerseUrl = (chapterId: string, verseNumber: string) => {
  return getQuranReflectFilteredVerseUrl(chapterId, verseNumber, { feed: true });
};

export const getQuranReflectEditUrl = (chapterId: string, verseNumber: string) => {
  return getQuranReflectFilteredVerseUrl(chapterId, verseNumber, { edit: true });
};

export const getQuranReflectAuthorUrl = (username: string) => {
  return `${API_HOST}/${username}`;
};

export const getQuranReflectPostUrl = (postId: number | string, viewComments = false) =>
  `${API_HOST}/posts/${postId}${viewComments ? '#comments' : ''}`;

export const getQuranReflectTagUrl = (tag: string) =>
  `${API_HOST}/?tags=${encodeURIComponent(tag)}`;

export const getQRNavigationUrl = () => `${API_HOST}`;

/**
 *  Get the link to a reflection group or page.
 * If it's a page, return the subdomain link.
 * If it's a group, return the groups link.
 * @param {Room} groupOrPage - The reflection group or page object.
 * @returns {string} - The link to the reflection group or page.
 */
export const getReflectionGroupLink = (groupOrPage: Room) => {
  if (!API_HOST) return '';

  if (groupOrPage?.roomType === RoomType.PAGE) {
    return buildSubdomainUrl(API_HOST, groupOrPage?.subdomain ?? '');
  }

  // if it's a group, return the groups link
  return `${API_HOST}/groups/${groupOrPage?.url || ''}`;
};
