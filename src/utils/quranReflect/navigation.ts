import stringify from '@/utils/qs-stringify';

export const API_HOST = process.env.NEXT_PUBLIC_QURAN_REFLECT_URL;

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

export const getLearningPlanBannerUrl = (slug: string) => `/learning-plans/${slug}`;
