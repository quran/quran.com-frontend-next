/* eslint-disable max-lines, react-func/max-lines-per-function */
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useAuthData from '@/hooks/auth/useAuthData';
import { logErrorToSentry } from '@/lib/sentry';
import UserProfile from '@/types/auth/UserProfile';
import AyahFeedItem from '@/types/QuranReflect/AyahFeedItem';
import { PostSortBy } from '@/types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from '@/types/QuranReflect/AyahReflectionsResponse';
import ContentType from '@/types/QuranReflect/ContentType';
import { getLoginNavigationUrl } from '@/utils/navigation';
import {
  followUser,
  getAyahReflections,
  isPostLiked,
  isUserFollowed,
  likePost,
  unlikePost,
} from '@/utils/quranReflect/apiPaths';
import {
  getLastAyahReflectionsPage,
  getQuranReflectFeedLanguages,
  getQuranReflectFeedPageUrl,
  getQuranReflectPageSize,
  mergeAdaptedAyahReflections,
} from '@/utils/quranReflect/feed';

const PENDING_ACTION_QUERY_PARAM = 'qrAction';
const PENDING_POST_ID_QUERY_PARAM = 'qrPostId';
const PENDING_FOLLOWEE_ID_QUERY_PARAM = 'qrFolloweeId';
const PENDING_USERNAME_QUERY_PARAM = 'qrUsername';

type PendingActionType = 'like' | 'unlike' | 'follow';

type PendingAction = {
  type: PendingActionType;
  postId?: number;
  followeeId?: string;
  username?: string;
};

type UseQuranReflectFeedParams = {
  chapterId: string;
  verseNumber: string;
  contentType: ContentType;
};

const buildRedirectPathWithPendingAction = (asPath: string, pendingAction: PendingAction) => {
  const [path, queryString = ''] = asPath.split('?');
  const searchParams = new URLSearchParams(queryString);

  searchParams.set(PENDING_ACTION_QUERY_PARAM, pendingAction.type);

  if (pendingAction.postId) {
    searchParams.set(PENDING_POST_ID_QUERY_PARAM, String(pendingAction.postId));
  }

  if (pendingAction.followeeId) {
    searchParams.set(PENDING_FOLLOWEE_ID_QUERY_PARAM, pendingAction.followeeId);
  }

  if (pendingAction.username) {
    searchParams.set(PENDING_USERNAME_QUERY_PARAM, pendingAction.username);
  }

  const nextQuery = searchParams.toString();
  return nextQuery ? `${path}?${nextQuery}` : path;
};

const removePendingActionFromPath = (asPath: string) => {
  const [path, queryString = ''] = asPath.split('?');
  const searchParams = new URLSearchParams(queryString);

  searchParams.delete(PENDING_ACTION_QUERY_PARAM);
  searchParams.delete(PENDING_POST_ID_QUERY_PARAM);
  searchParams.delete(PENDING_FOLLOWEE_ID_QUERY_PARAM);
  searchParams.delete(PENDING_USERNAME_QUERY_PARAM);

  const nextQuery = searchParams.toString();
  return nextQuery ? `${path}?${nextQuery}` : path;
};

const getPendingActionFromQuery = (query: Record<string, string | string[]>) => {
  const actionType = query[PENDING_ACTION_QUERY_PARAM];
  const postId = query[PENDING_POST_ID_QUERY_PARAM];
  const followeeId = query[PENDING_FOLLOWEE_ID_QUERY_PARAM];
  const username = query[PENDING_USERNAME_QUERY_PARAM];

  if (!actionType || Array.isArray(actionType)) return null;
  if (!['like', 'unlike', 'follow'].includes(actionType)) return null;

  return {
    type: actionType as PendingActionType,
    postId:
      postId && !Array.isArray(postId) && !Number.isNaN(Number(postId))
        ? Number(postId)
        : undefined,
    followeeId: followeeId && !Array.isArray(followeeId) ? followeeId : undefined,
    username: username && !Array.isArray(username) ? username : undefined,
  } satisfies PendingAction;
};

export const isCurrentUserPostAuthor = (
  post: AyahFeedItem,
  userData?: Pick<UserProfile, 'id' | 'username'>,
) => {
  if (!userData) return false;

  if (userData.id && post.author?.id === userData.id) {
    return true;
  }

  if (userData.username && post.author?.username === userData.username) {
    return true;
  }

  return false;
};

export const applyViewerFollowButtonVisibility = (
  items: AyahFeedItem[],
  userData?: Pick<UserProfile, 'id' | 'username'>,
) =>
  items.map((item) =>
    isCurrentUserPostAuthor(item, userData)
      ? {
          ...item,
          canShowFollowButton: false,
        }
      : item,
  );

const updatePostLikeState = (
  pages: AyahReflectionsResponse[] | undefined,
  postId: number,
  isLiked: boolean,
) => {
  if (!pages) return pages;

  return pages.map((page) => ({
    ...page,
    data: (page.data ?? []).map((post) => {
      if (post.id !== postId) return post;

      const nextLikesCount = Math.max(0, (post.likesCount ?? 0) + (isLiked ? 1 : -1));

      return {
        ...post,
        isLiked,
        likesCount: nextLikesCount,
      };
    }),
  }));
};

const updateAuthorFollowState = (
  pages: AyahReflectionsResponse[] | undefined,
  username: string,
  followed: boolean,
) => {
  if (!pages) return pages;

  return pages.map((page) => ({
    ...page,
    data: (page.data ?? []).map((post) => {
      if (post.author?.username !== username) return post;

      return {
        ...post,
        isByFollowedUser: followed,
        author: {
          ...post.author,
          followed,
          followersCount: Math.max(0, (post.author?.followersCount ?? 0) + (followed ? 1 : -1)),
        },
      };
    }),
  }));
};

const useQuranReflectFeed = ({
  chapterId,
  verseNumber,
  contentType,
}: UseQuranReflectFeedParams) => {
  const { lang } = useTranslation();
  const { t: tQuranReader } = useTranslation('quran-reader');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const router = useRouter();
  const { isAuthenticated, userData } = useAuthData();
  const [sortBy, setSortBy] = useState<PostSortBy>(PostSortBy.Latest);
  const [likeLoadingPostIds, setLikeLoadingPostIds] = useState<number[]>([]);
  const [followLoadingKeys, setFollowLoadingKeys] = useState<string[]>([]);
  const handledPendingActionRef = useRef(false);

  const locales = useMemo(() => getQuranReflectFeedLanguages(lang), [lang]);

  const getKey = useCallback(
    (pageIndex: number, previousPageData?: AyahReflectionsResponse) => {
      if (previousPageData && previousPageData.currentPage >= previousPageData.pages) {
        return null;
      }

      return getQuranReflectFeedPageUrl({
        chapterId,
        verseNumber,
        locales,
        page: pageIndex + 1,
        limit: getQuranReflectPageSize(),
        contentType,
        sortBy,
      });
    },
    [chapterId, verseNumber, locales, contentType, sortBy],
  );

  const {
    data: pagesData,
    size,
    setSize,
    mutate,
    isValidating,
    error,
  } = useSWRInfinite<AyahReflectionsResponse>(getKey, getAyahReflections, {
    revalidateFirstPage: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    persistSize: false,
  });

  const items = useMemo(
    () =>
      applyViewerFollowButtonVisibility(
        mergeAdaptedAyahReflections({
          responses: pagesData,
          locale: lang,
        }),
        userData,
      ),
    [pagesData, lang, userData],
  );

  const lastPage = useMemo(() => getLastAyahReflectionsPage(pagesData), [pagesData]);
  const hasMore = Boolean(lastPage && lastPage.currentPage < lastPage.pages);
  const isLoading = !pagesData && !error;
  const isLoadingMore =
    isValidating || (size > 0 && pagesData && typeof pagesData[size - 1] === 'undefined');

  const updateLikeLoadingState = useCallback((postId: number, isLoadingValue: boolean) => {
    setLikeLoadingPostIds((current) => {
      if (isLoadingValue) {
        return current.includes(postId) ? current : [...current, postId];
      }

      return current.filter((currentPostId) => currentPostId !== postId);
    });
  }, []);

  const updateFollowLoadingState = useCallback((followKey: string, isLoadingValue: boolean) => {
    setFollowLoadingKeys((current) => {
      if (isLoadingValue) {
        return current.includes(followKey) ? current : [...current, followKey];
      }

      return current.filter((currentFollowKey) => currentFollowKey !== followKey);
    });
  }, []);

  const cleanPendingActionQuery = useCallback(() => {
    const cleanedPath = removePendingActionFromPath(router.asPath);
    if (cleanedPath !== router.asPath) {
      router.replace(cleanedPath, undefined, { shallow: true });
    }
  }, [router]);

  const redirectGuestToLogin = useCallback(
    (pendingAction: PendingAction) => {
      const redirectPath = buildRedirectPathWithPendingAction(router.asPath, pendingAction);
      router.push(getLoginNavigationUrl(redirectPath));
    },
    [router],
  );

  const executeLikeMutation = useCallback(
    async ({ postId, shouldLike }: { postId: number; shouldLike: boolean }) => {
      const previousData = pagesData;
      updateLikeLoadingState(postId, true);
      await mutate(updatePostLikeState(previousData, postId, shouldLike), false);

      try {
        if (shouldLike) {
          await likePost(postId);
        } else {
          await unlikePost(postId);
        }
      } catch (requestError) {
        await mutate(previousData, false);
        toast(tCommon('error.network'), { status: ToastStatus.Warning });
        throw requestError;
      } finally {
        updateLikeLoadingState(postId, false);
      }
    },
    [mutate, pagesData, tCommon, toast, updateLikeLoadingState],
  );

  const executeFollowMutation = useCallback(
    async ({ followeeId, username }: { followeeId: string; username?: string }) => {
      const previousData = pagesData;
      const followKey = username || followeeId;
      updateFollowLoadingState(followKey, true);
      await mutate(
        username ? updateAuthorFollowState(previousData, username, true) : previousData,
        false,
      );

      try {
        await followUser(followeeId);
      } catch (requestError) {
        await mutate(previousData, false);
        toast(tCommon('error.network'), { status: ToastStatus.Warning });
        throw requestError;
      } finally {
        updateFollowLoadingState(followKey, false);
      }
    },
    [mutate, pagesData, tCommon, toast, updateFollowLoadingState],
  );

  const onLikeToggle = useCallback(
    async (post: AyahFeedItem) => {
      if (!isAuthenticated) {
        redirectGuestToLogin({
          type: post.isLiked ? 'unlike' : 'like',
          postId: post.id,
        });
        return;
      }

      await executeLikeMutation({ postId: post.id, shouldLike: !post.isLiked });
    },
    [executeLikeMutation, isAuthenticated, redirectGuestToLogin],
  );

  const onFollow = useCallback(
    async (post: AyahFeedItem) => {
      const followeeId = post.author?.id ?? post.authorId;
      const username = post.author?.username;
      if (!followeeId) return;
      if (isCurrentUserPostAuthor(post, userData)) return;

      if (!isAuthenticated) {
        redirectGuestToLogin({
          type: 'follow',
          followeeId,
          username,
        });
        return;
      }

      await executeFollowMutation({ followeeId, username });
    },
    [executeFollowMutation, isAuthenticated, redirectGuestToLogin, userData],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setSize(size + 1);
  }, [hasMore, isLoadingMore, setSize, size]);

  const onSortChange = useCallback((nextSortBy: PostSortBy) => {
    startTransition(() => {
      setSortBy(nextSortBy);
    });
  }, []);

  useEffect(() => {
    handledPendingActionRef.current = false;
  }, [chapterId, verseNumber, contentType]);

  useEffect(() => {
    if (!router.isReady || !isAuthenticated || handledPendingActionRef.current) {
      return;
    }

    const pendingAction = getPendingActionFromQuery(
      router.query as Record<string, string | string[]>,
    );
    if (!pendingAction) return;

    handledPendingActionRef.current = true;

    const applyPendingAction = async () => {
      try {
        if (
          pendingAction.postId &&
          (pendingAction.type === 'like' || pendingAction.type === 'unlike')
        ) {
          if (pendingAction.type === 'like') {
            const likeStatus = await isPostLiked(pendingAction.postId);
            if (!likeStatus.liked) {
              await executeLikeMutation({
                postId: pendingAction.postId,
                shouldLike: true,
              });
            }
          } else {
            const likeStatus = await isPostLiked(pendingAction.postId);
            if (likeStatus.liked) {
              await executeLikeMutation({
                postId: pendingAction.postId,
                shouldLike: false,
              });
            }
          }
        }

        if (pendingAction.followeeId && pendingAction.type === 'follow') {
          const followStatus = await isUserFollowed(pendingAction.followeeId);
          if (!followStatus.followed) {
            await executeFollowMutation({
              followeeId: pendingAction.followeeId,
              username: pendingAction.username,
            });
          }
        }
      } finally {
        cleanPendingActionQuery();
      }
    };

    applyPendingAction().catch((caughtError) => {
      logErrorToSentry(caughtError, { transactionName: 'quranReflectPendingAction' });
    });
  }, [
    cleanPendingActionQuery,
    executeFollowMutation,
    executeLikeMutation,
    isAuthenticated,
    router,
  ]);

  return {
    items,
    sortBy,
    onSortChange,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    onLikeToggle,
    onFollow,
    retry: () => mutate(),
    isLikeLoading: (postId: number) => likeLoadingPostIds.includes(postId),
    isFollowLoading: (username?: string) =>
      username ? followLoadingKeys.includes(username) : false,
    sortOptions: [
      {
        id: PostSortBy.Latest,
        label: tQuranReader('reflection-feed.sort.latest'),
      },
      {
        id: PostSortBy.Popular,
        label: tQuranReader('reflection-feed.sort.popular'),
      },
    ],
  };
};

export default useQuranReflectFeed;
