import { describe, expect, it } from 'vitest';

import {
  applyViewerFollowButtonVisibility,
  isCurrentUserPostAuthor,
} from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer/useQuranReflectFeed';
import AyahFeedItem from '@/types/QuranReflect/AyahFeedItem';

const buildAuthor = (overrides: Partial<AyahFeedItem['author']> = {}) => ({
  id: overrides.id ?? 'author-1',
  username: overrides.username ?? 'author-1',
  firstName: overrides.firstName ?? 'Author',
  lastName: overrides.lastName ?? 'One',
  avatarUrls: overrides.avatarUrls ?? {
    small: '',
    medium: '',
    large: '',
  },
  followed: overrides.followed ?? false,
  followersCount: overrides.followersCount ?? 0,
});

const buildItem = (overrides: Partial<AyahFeedItem> = {}): AyahFeedItem => {
  return {
    id: overrides.id ?? 1,
    authorId: overrides.authorId ?? 'author-1',
    body: overrides.body ?? 'Reflection body',
    createdAt: overrides.createdAt ?? '2026-03-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? new Date('2026-03-01T00:00:00.000Z'),
    publishedAt: overrides.publishedAt ?? new Date('2026-03-01T00:00:00.000Z'),
    hidden: overrides.hidden ?? false,
    reported: overrides.reported ?? false,
    removed: overrides.removed ?? false,
    verified: overrides.verified ?? true,
    commentsCount: overrides.commentsCount ?? 0,
    likesCount: overrides.likesCount ?? 0,
    viewsCount: overrides.viewsCount ?? 0,
    roomId: overrides.roomId ?? 1,
    postTypeId: overrides.postTypeId ?? 1,
    isLiked: overrides.isLiked ?? false,
    isSaved: overrides.isSaved ?? false,
    isCommentedOn: overrides.isCommentedOn ?? false,
    isByFollowedUser: overrides.isByFollowedUser ?? false,
    references: overrides.references ?? [],
    locale: overrides.locale ?? 'en',
    isEnglish: overrides.isEnglish ?? true,
    isPreferredLocale: overrides.isPreferredLocale ?? true,
    canShowFollowButton: overrides.canShowFollowButton ?? true,
    isAuthorFollowed: overrides.isAuthorFollowed ?? false,
    author: overrides.author ?? buildAuthor(),
  } as AyahFeedItem;
};

describe('isCurrentUserPostAuthor', () => {
  it('matches by author id', () => {
    expect(
      isCurrentUserPostAuthor(buildItem(), {
        id: 'author-1',
      }),
    ).toBe(true);
  });

  it('matches by username when ids differ', () => {
    expect(
      isCurrentUserPostAuthor(buildItem(), {
        id: 'someone-else',
        username: 'author-1',
      }),
    ).toBe(true);
  });
});

describe('applyViewerFollowButtonVisibility', () => {
  it('hides the follow button for the current user posts only', () => {
    const items = applyViewerFollowButtonVisibility(
      [
        buildItem(),
        buildItem({
          id: 2,
          authorId: 'author-2',
          author: buildAuthor({
            id: 'author-2',
            username: 'author-2',
            lastName: 'Two',
          }),
        }),
      ],
      {
        id: 'author-1',
        username: 'author-1',
      },
    );

    expect(items[0].canShowFollowButton).toBe(false);
    expect(items[1].canShowFollowButton).toBe(true);
  });
});
