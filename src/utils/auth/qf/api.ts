import {
  makeFollowUserUrl,
  makeGetUserReflectionsUrl,
  makePostReflectionViewsUrl,
  makeIsUserFollowedUrl,
  makeQuranicCalendarPostOfWeekUrl,
} from './apiPaths';

import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { postRequest, privateFetcher } from '@/utils/auth/api';
import GetAllUserReflectionsQueryParams from '@/utils/auth/types/GetAllUserReflectionsQueryParams';

export const postReflectionViews = async (postId: string): Promise<{ success: boolean }> =>
  postRequest(makePostReflectionViewsUrl(postId), {});

export const followUser = async (usernameOrId: string): Promise<{ success: boolean }> =>
  postRequest(makeFollowUserUrl(usernameOrId), {});

export const isUserFollowed = async (
  usernameOrId: string,
): Promise<{ success: boolean; followed: boolean }> => {
  return privateFetcher(makeIsUserFollowedUrl(usernameOrId));
};

export const getAllUserReflections = async (params: GetAllUserReflectionsQueryParams) => {
  return privateFetcher(makeGetUserReflectionsUrl(params));
};

export const getQuranicCalendarPostOfWeek = async (
  weekNumber: number,
): Promise<{ post: AyahReflection }> => {
  return privateFetcher(makeQuranicCalendarPostOfWeekUrl(weekNumber));
};
