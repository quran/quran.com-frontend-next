import Cookies from 'js-cookie';

import { getBasePath } from '../url';

import { NOTIFICATION_SUBSCRIBER_COOKIE_NAME, USER_ID_COOKIE_NAME } from './constants';
import QueryParams from './types/QueryParams';

export const getUserIdCookie = () => Cookies.get(USER_ID_COOKIE_NAME);
export const removeUserIdCookie = () => Cookies.remove(USER_ID_COOKIE_NAME);
export const isLoggedIn = () => !!getUserIdCookie();

export const getNotificationSubscriberHashCookie = () =>
  Cookies.get(NOTIFICATION_SUBSCRIBER_COOKIE_NAME);

export const buildRedirectBackUrl = (
  pathname: string,
  updatedVisited: string[],
  token?: string,
): URL => {
  const url = new URL(pathname, getBasePath());
  url.searchParams.set(QueryParams.VisitedPlatform, updatedVisited.toString());
  if (token) url.searchParams.set(QueryParams.Token, token);
  return url;
};

export const buildNextPlatformUrl = (
  nextPlatform: { id: string; url: string },
  redirectBackUrl: URL,
  token?: string,
): URL => {
  const nextPlatformUrl = new URL(nextPlatform.url);
  nextPlatformUrl.searchParams.set(
    QueryParams.RedirectBack,
    encodeURIComponent(redirectBackUrl.toString()),
  );
  nextPlatformUrl.searchParams.set(QueryParams.Silent, '1');
  if (token) nextPlatformUrl.searchParams.set(QueryParams.Token, token);

  return nextPlatformUrl;
};
