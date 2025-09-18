import Cookies from 'js-cookie';

import { getBasePath } from '../url';

import { NOTIFICATION_SUBSCRIBER_COOKIE_NAME, USER_ID_COOKIE_NAME } from './constants';

import QueryParam from '@/types/QueryParam';

export const getUserIdCookie = () => Cookies.get(USER_ID_COOKIE_NAME);
export const removeUserIdCookie = () => Cookies.remove(USER_ID_COOKIE_NAME);
export const isLoggedIn = () => !!getUserIdCookie();

export const getNotificationSubscriberHashCookie = () =>
  Cookies.get(NOTIFICATION_SUBSCRIBER_COOKIE_NAME);

export const buildRedirectBackUrl = (
  pathname: string,
  updatedVisited: string[],
  token?: string,
  redirectTo?: string,
): URL => {
  const url = new URL(pathname, getBasePath());
  url.searchParams.set(QueryParam.VISITEDPLATFORM, updatedVisited.toString());
  if (token) url.searchParams.set(QueryParam.TOKEN, token);
  if (redirectTo) url.searchParams.set(QueryParam.REDIRECT_TO, redirectTo);
  return url;
};

export const buildNextPlatformUrl = (
  nextPlatform: { id: string; url: string },
  redirectBackUrl: URL,
  token?: string,
): URL => {
  const nextPlatformUrl = new URL(nextPlatform.url);
  nextPlatformUrl.searchParams.set(
    QueryParam.REDIRECTBACK,
    encodeURIComponent(redirectBackUrl.toString()),
  );
  nextPlatformUrl.searchParams.set(QueryParam.SILENT, '1');
  if (token) nextPlatformUrl.searchParams.set(QueryParam.TOKEN, token);

  return nextPlatformUrl;
};
