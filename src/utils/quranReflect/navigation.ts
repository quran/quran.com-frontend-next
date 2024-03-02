import stringify from '@/utils/qs-stringify';

const STAGING_API_HOST = 'https://quranreflect.org';
const PRODUCTION_API_HOST = 'https://quranreflect.com';

// env variables in Vercel can't be dynamic, we have to hardcode the urls here. https://stackoverflow.com/questions/44342226/next-js-error-only-absolute-urls-are-supported
export const API_HOST =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? PRODUCTION_API_HOST : STAGING_API_HOST;

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
