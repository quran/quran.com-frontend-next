import stringify from '@/utils/qs-stringify';

const getQuranReflectFilteredVerseUrl = (chapterId: string, verseNumber: string, params) => {
  return `https://quranreflect.com?filters=${chapterId}:${verseNumber}&${stringify(params)}`;
};

export const getQuranReflectVerseUrl = (chapterId: string, verseNumber: string) => {
  return getQuranReflectFilteredVerseUrl(chapterId, verseNumber, { feed: true });
};

export const getQuranReflectEditUrl = (chapterId: string, verseNumber: string) => {
  return getQuranReflectFilteredVerseUrl(chapterId, verseNumber, { edit: true });
};

export const getQuranReflectAuthorUrl = (username: string) => {
  return `https://quranreflect.com/${username}`;
};

export const getQuranReflectPostUrl = (postId: number, viewComments = false) =>
  `https://quranreflect.com/posts/${postId}${viewComments ? '#comments' : ''}`;

export const getQuranReflectTagUrl = (tag: string) =>
  `https://quranreflect.com/?tags=${encodeURIComponent(tag)}`;
