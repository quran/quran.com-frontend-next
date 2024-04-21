import { makeUrl } from '@/utils/auth/apiPaths';
import GetAllUserReflectionsQueryParams from '@/utils/auth/types/GetAllUserReflectionsQueryParams';

const getPrefixedUrl = (url: string) => `qf/${url}`;

export const makePostReflectionViewsUrl = (postId: string) =>
  makeUrl(getPrefixedUrl(`posts/${postId}/views`));

export const makeFollowUserUrl = (userNameOrId: string) =>
  makeUrl(getPrefixedUrl(`users/${userNameOrId}/follow`));

export const makeIsUserFollowedUrl = (userNameOrId: string) =>
  makeUrl(getPrefixedUrl(`users/${userNameOrId}/is-followed`));

export const makeGetUserReflectionsUrl = (params?: GetAllUserReflectionsQueryParams) =>
  makeUrl(getPrefixedUrl('posts'), params as any);

export const makeQuranicCalendarPostOfWeekUrl = (weekNumber: number) =>
  makeUrl(getPrefixedUrl(`quranic-calendar/${weekNumber}`));
