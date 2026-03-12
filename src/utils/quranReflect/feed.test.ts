/* eslint-disable max-lines, react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import Language from '@/types/Language';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import AyahReflectionsResponse from '@/types/QuranReflect/AyahReflectionsResponse';
import ContentType from '@/types/QuranReflect/ContentType';
import {
  adaptAyahReflectionsPage,
  getLastAyahReflectionsPage,
  getQuranReflectFeedLanguages,
  getQuranReflectFeedPageUrl,
  mergeAdaptedAyahReflections,
} from '@/utils/quranReflect/feed';

const buildPost = (
  overrides: Partial<AyahReflection> = {},
  referenceOverrides: Partial<AyahReflection['references'][number]> = {},
): AyahReflection => ({
  id: overrides.id ?? 1,
  authorId: overrides.authorId ?? 'author-1',
  body: overrides.body ?? 'Reflection body',
  createdAt: overrides.createdAt ?? '2026-03-01T00:00:00.000Z',
  updatedAt: overrides.updatedAt ?? new Date('2026-03-01T00:00:00.000Z'),
  publishedAt: overrides.publishedAt ?? new Date('2026-03-01T00:00:00.000Z'),
  commentsCount: overrides.commentsCount ?? 0,
  likesCount: overrides.likesCount ?? 0,
  viewsCount: overrides.viewsCount ?? 0,
  verified: overrides.verified ?? true,
  hidden: overrides.hidden ?? false,
  reported: overrides.reported ?? false,
  removed: overrides.removed ?? false,
  draft: overrides.draft ?? false,
  roomId: overrides.roomId ?? 1,
  postTypeId: overrides.postTypeId ?? 1,
  languageId: overrides.languageId ?? 2,
  author: overrides.author ?? {
    id: 'author-1',
    username: 'author-1',
    firstName: 'Author',
    lastName: 'One',
    avatarUrls: {
      small: '',
      medium: '',
      large: '',
    },
    followed: false,
    followersCount: 0,
    banned: false,
  },
  room: overrides.room,
  isLiked: overrides.isLiked ?? false,
  isByFollowedUser: overrides.isByFollowedUser ?? false,
  references: overrides.references ?? [
    {
      id: '2-5-5',
      chapterId: 2,
      from: 5,
      to: 5,
      ...referenceOverrides,
    },
  ],
});

const buildResponse = (
  data: AyahReflection[],
  overrides: Partial<AyahReflectionsResponse> = {},
): AyahReflectionsResponse => ({
  data,
  currentPage: overrides.currentPage ?? 1,
  limit: overrides.limit ?? 10,
  total: overrides.total ?? data.length,
  pages: overrides.pages ?? 1,
  status: overrides.status,
  error: overrides.error,
});

describe('getQuranReflectFeedLanguages', () => {
  it('returns english only for english locales', () => {
    expect(getQuranReflectFeedLanguages('en-US')).toEqual([Language.EN]);
  });

  it('returns the current locale first, then english for non-english locales', () => {
    expect(getQuranReflectFeedLanguages('ar-EG')).toEqual([Language.AR, Language.EN]);
  });
});

describe('Quran Reflect SWR keys', () => {
  it('builds the same first-page URL used by the feed hook', () => {
    expect(
      getQuranReflectFeedPageUrl({
        chapterId: '1',
        verseNumber: '7',
        locales: [Language.EN],
        contentType: ContentType.LESSONS,
      }),
    ).toContain('filter%5BpostTypeIds%5D=2');
  });
});

describe('adaptAyahReflectionsPage', () => {
  it('preserves backend ordering and normalizes locale metadata', () => {
    const response = buildResponse([
      buildPost({ id: 1, languageId: 1 }),
      buildPost({ id: 2, languageId: 2 }),
      buildPost({ id: 3, languageId: 3 }),
    ]);

    const items = adaptAyahReflectionsPage({
      response,
      locale: Language.AR,
    });

    expect(items.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(items.map((item) => item.locale)).toEqual([Language.AR, Language.EN, Language.ES]);
    expect(items.map((item) => item.isPreferredLocale)).toEqual([true, false, false]);
    expect(items.map((item) => item.isEnglish)).toEqual([false, true, false]);
  });

  it('hides the follow button when the backend marks the post as authored by a followed user', () => {
    const response = buildResponse([
      buildPost({
        id: 1,
        isByFollowedUser: true,
        author: {
          id: 'author-1',
          username: 'author-1',
          firstName: 'Author',
          lastName: 'One',
          avatarUrls: {
            small: '',
            medium: '',
            large: '',
          },
          followed: false,
          followersCount: 0,
          banned: false,
        },
      }),
    ]);

    const [item] = adaptAyahReflectionsPage({
      response,
      locale: Language.EN,
    });

    expect(item.isAuthorFollowed).toBe(true);
    expect(item.author.followed).toBe(true);
    expect(item.canShowFollowButton).toBe(false);
  });

  it('hides the follow button when the optimistic post state marks the author as followed', () => {
    const response = buildResponse([
      buildPost({
        id: 1,
        isByFollowedUser: false,
        author: {
          id: 'author-1',
          username: 'author-1',
          firstName: 'Author',
          lastName: 'One',
          avatarUrls: {
            small: '',
            medium: '',
            large: '',
          },
          followed: true,
          followersCount: 1,
          banned: false,
        },
      }),
    ]);

    const [item] = adaptAyahReflectionsPage({
      response,
      locale: Language.EN,
    });

    expect(item.isAuthorFollowed).toBe(true);
    expect(item.author.followed).toBe(true);
    expect(item.canShowFollowButton).toBe(false);
  });
});

describe('mergeAdaptedAyahReflections', () => {
  it('merges pages in backend order', () => {
    const responses = [
      buildResponse([buildPost({ id: 1 })], { currentPage: 1, pages: 2, total: 2 }),
      buildResponse([buildPost({ id: 2 })], { currentPage: 2, pages: 2, total: 2 }),
    ];

    const items = mergeAdaptedAyahReflections({
      responses,
      locale: Language.AR,
    });

    expect(items.map((item) => item.id)).toEqual([1, 2]);
  });
});

describe('getLastAyahReflectionsPage', () => {
  it('returns the last page in the loaded sequence', () => {
    const firstPage = buildResponse([], { currentPage: 1, pages: 3 });
    const secondPage = buildResponse([], { currentPage: 2, pages: 3 });

    expect(getLastAyahReflectionsPage([firstPage, secondPage])).toBe(secondPage);
  });
});
