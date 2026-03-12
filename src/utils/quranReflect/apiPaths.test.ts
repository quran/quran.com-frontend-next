/* eslint-disable @typescript-eslint/naming-convention, max-lines, react-func/max-lines-per-function */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetcher } from '@/api';
import Language from '@/types/Language';
import { PostSortBy } from '@/types/QuranReflect/AyahReflectionsRequestParams';
import { privateFetcher } from '@/utils/auth/api';
import {
  followUser,
  getAyahReflections,
  isUserFollowed,
  isPostLiked,
  likePost,
  makeAyahReflectionsUrl,
  makeGetUserReflectionsUrl,
  unlikePost,
} from '@/utils/quranReflect/apiPaths';

vi.mock('@/api', () => ({
  fetcher: vi.fn(),
}));

vi.mock('@/utils/auth/api', () => ({
  privateFetcher: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('makeAyahReflectionsUrl', () => {
  it('builds a paginated QDC feed URL using the current locale languages and exact ayah filters', () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'qdc.test';

    const url = new URL(
      makeAyahReflectionsUrl({
        surahId: '2',
        ayahNumber: '5',
        locales: [Language.AR, Language.EN],
        page: 3,
        limit: 10,
        postTypeIds: ['2'],
        sortBy: PostSortBy.Popular,
      }),
    );

    expect(url.pathname).toBe('/api/proxy/quran-reflect/posts/feed');
    expect(url.searchParams.get('filter[references][0][chapterId]')).toBe('2');
    expect(url.searchParams.get('filter[references][0][from]')).toBe('5');
    expect(url.searchParams.get('filter[references][0][to]')).toBe('5');
    expect(url.searchParams.get('filter[postTypeIds]')).toBe('2');
    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('tab')).toBe('qdc');
    expect(url.searchParams.get('languages')).toBe('1,2');
    expect(url.searchParams.get('sortBy')).toBe(PostSortBy.Popular);
    expect(url.searchParams.get('filter[verifiedOnly]')).toBe('true');
  });

  it('uses the API gateway quran-reflect route during static builds', async () => {
    const previousIsBuildTime = process.env.IS_BUILD_TIME;
    const previousApiGatewayUrl = process.env.API_GATEWAY_URL;

    vi.resetModules();
    process.env.IS_BUILD_TIME = 'true';
    process.env.API_GATEWAY_URL = 'https://internal-api.test';

    try {
      const { makeAyahReflectionsUrl: buildTimeMakeAyahReflectionsUrl } = await import(
        '@/utils/quranReflect/apiPaths'
      );

      const url = new URL(
        buildTimeMakeAyahReflectionsUrl({
          surahId: '2',
          ayahNumber: '5',
          locales: [Language.EN],
          page: 1,
          limit: 10,
          postTypeIds: ['1'],
        }),
      );

      expect(url.origin).toBe('https://internal-api.test');
      expect(url.pathname).toBe('/quran-reflect/posts/feed');
    } finally {
      process.env.IS_BUILD_TIME = previousIsBuildTime;
      process.env.API_GATEWAY_URL = previousApiGatewayUrl;
      vi.resetModules();
    }
  });
});

describe('followUser', () => {
  it('uses the direct QR follow endpoint with auth', async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'development';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'localhost:3005';
    vi.mocked(privateFetcher).mockResolvedValue({ followed: true });

    await followUser('user-123');

    expect(privateFetcher).toHaveBeenCalledWith(
      'http://localhost:3005/api/proxy/quran-reflect/users/user-123/toggle-follow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'follow' }),
      },
    );
  });
});

describe('isUserFollowed', () => {
  it('uses the QR profile endpoint with auth and normalizes the followed state', async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'development';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'localhost:3005';
    vi.mocked(privateFetcher).mockResolvedValue({ followed: true });

    const response = await isUserFollowed('user-123');

    expect(privateFetcher).toHaveBeenCalledWith(
      'http://localhost:3005/api/proxy/quran-reflect/users/user-123/profile',
    );
    expect(response).toEqual({ followed: true });
  });
});

describe('makeGetUserReflectionsUrl', () => {
  it('uses the direct QR my-posts route', () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'development';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'localhost:3005';
    expect(makeGetUserReflectionsUrl({ page: 2, limit: 20 })).toBe(
      'http://localhost:3005/api/proxy/quran-reflect/posts/my-posts?page=2&limit=20',
    );
  });
});

describe('getAyahReflections', () => {
  it('uses privateFetcher for direct QR proxy feed URLs', async () => {
    vi.mocked(privateFetcher).mockResolvedValue({
      data: [],
      currentPage: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });

    await getAyahReflections('http://localhost:3005/api/proxy/quran-reflect/posts/feed?page=1');

    expect(privateFetcher).toHaveBeenCalledWith(
      'http://localhost:3005/api/proxy/quran-reflect/posts/feed?page=1',
    );
  });

  it('uses fetcher for non-proxied QR build-time URLs', async () => {
    vi.mocked(fetcher).mockResolvedValue({
      data: [],
      currentPage: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });

    await getAyahReflections('https://internal-api.test/quran-reflect/posts/feed?page=1');

    expect(fetcher).toHaveBeenCalledWith(
      'https://internal-api.test/quran-reflect/posts/feed?page=1',
    );
  });
});

describe('like APIs', () => {
  it('uses direct QR like endpoints with auth', async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'development';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'localhost:3005';
    vi.mocked(privateFetcher).mockResolvedValue({ liked: true });

    await likePost(42);
    await unlikePost(42);
    await isPostLiked(42);

    expect(privateFetcher).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3005/api/proxy/quran-reflect/posts/42/toggle-like',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );
    expect(privateFetcher).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3005/api/proxy/quran-reflect/posts/42/toggle-like',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );
    expect(privateFetcher).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3005/api/proxy/quran-reflect/posts/42/liked',
    );
  });
});
