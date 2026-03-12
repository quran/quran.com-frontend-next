/* eslint-disable max-lines, react-func/max-lines-per-function */

import Language from '@/types/Language';
import AyahFeedItem from '@/types/QuranReflect/AyahFeedItem';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { PostSortBy } from '@/types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from '@/types/QuranReflect/AyahReflectionsResponse';
import ContentType from '@/types/QuranReflect/ContentType';
import {
  LESSON_POST_TYPE_ID,
  makeAyahReflectionsUrl,
  REFLECTION_POST_TYPE_ID,
} from '@/utils/quranReflect/apiPaths';
import {
  getQuranReflectFeedLocales,
  quranReflectLanguageIDToLocale,
} from '@/utils/quranReflect/locale';

const PAGE_SIZE = 10;

type AdaptAyahReflectionsPageParams = {
  response?: AyahReflectionsResponse;
  locale: string;
};

type MergeAdaptedAyahReflectionsParams = {
  responses?: AyahReflectionsResponse[];
  locale: string;
};

type QuranReflectFeedPageUrlParams = {
  chapterId: string;
  verseNumber: string;
  locales: string[];
  contentType: ContentType;
  page?: number;
  limit?: number;
  sortBy?: PostSortBy;
};

const getPostTypeId = (contentType: ContentType) =>
  contentType === ContentType.REFLECTIONS ? REFLECTION_POST_TYPE_ID : LESSON_POST_TYPE_ID;

export const getQuranReflectFeedPageUrl = ({
  chapterId,
  verseNumber,
  locales,
  contentType,
  page = 1,
  limit = PAGE_SIZE,
  sortBy = PostSortBy.Latest,
}: QuranReflectFeedPageUrlParams) =>
  makeAyahReflectionsUrl({
    surahId: chapterId,
    ayahNumber: verseNumber,
    locales,
    page,
    limit,
    postTypeIds: [getPostTypeId(contentType)],
    sortBy,
  });

const normalizeFeedItem = (post: AyahReflection, currentLocale: string): AyahFeedItem => {
  const locale = quranReflectLanguageIDToLocale(post.languageId) ?? Language.EN;
  const isAuthorFollowed = Boolean(post.isByFollowedUser || post.author?.followed);
  const normalizedAuthor = {
    id: post.author?.id ?? post.authorId,
    username: post.author?.username ?? '',
    firstName: post.author?.firstName ?? '',
    lastName: post.author?.lastName ?? '',
    followed: isAuthorFollowed,
    followersCount: post.author?.followersCount ?? 0,
    avatarUrls: {
      small: post.author?.avatarUrls?.small ?? '',
      medium: post.author?.avatarUrls?.medium ?? '',
      large: post.author?.avatarUrls?.large ?? '',
    },
  };

  return {
    id: post.id,
    authorId: post.authorId,
    body: post.body ?? '',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    hidden: post.hidden ?? false,
    reported: post.reported ?? false,
    removed: post.removed ?? false,
    verified: post.verified ?? false,
    roomPostStatus: post.roomPostStatus,
    commentsCount: post.commentsCount ?? 0,
    likesCount: post.likesCount ?? 0,
    viewsCount: post.viewsCount ?? 0,
    languageId: post.languageId,
    languageName: post.languageName,
    moderationStatus: post.moderationStatus,
    reviewStatus: post.reviewStatus,
    estimatedReadingTime: post.estimatedReadingTime,
    roomId: post.roomId,
    postTypeId: post.postTypeId,
    postTypeName: post.postTypeName,
    isLiked: post.isLiked ?? false,
    isSaved: post.isSaved ?? false,
    isCommentedOn: post.isCommentedOn ?? false,
    isByFollowedUser: post.isByFollowedUser ?? false,
    author: normalizedAuthor,
    room: post.room,
    references: post.references ?? [],
    locale,
    isEnglish: locale === Language.EN,
    isPreferredLocale: locale === currentLocale,
    canShowFollowButton: !isAuthorFollowed,
    isAuthorFollowed,
  };
};

export const getQuranReflectPageSize = () => PAGE_SIZE;

export const getQuranReflectFeedLanguages = (locale: string) => getQuranReflectFeedLocales(locale);

export const adaptAyahReflectionsPage = ({
  response,
  locale,
}: AdaptAyahReflectionsPageParams): AyahFeedItem[] => {
  const currentLocale = getQuranReflectFeedLocales(locale)[0] ?? Language.EN;

  return (response?.data ?? []).map((post) => normalizeFeedItem(post, currentLocale));
};

export const mergeAdaptedAyahReflections = ({
  responses,
  locale,
}: MergeAdaptedAyahReflectionsParams): AyahFeedItem[] => {
  const currentLocale = getQuranReflectFeedLocales(locale)[0] ?? Language.EN;

  return (responses ?? []).flatMap((response) =>
    (response.data ?? []).map((post) => normalizeFeedItem(post, currentLocale)),
  );
};

export const getLastAyahReflectionsPage = (responses?: AyahReflectionsResponse[]) => {
  if (!responses?.length) return undefined;
  return responses[responses.length - 1];
};
