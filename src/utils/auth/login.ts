import Cookies from 'js-cookie';

import { NOTIFICATION_SUBSCRIBER_COOKIE_NAME, USER_ID_COOKIE_NAME } from './constants';

export const getUserIdCookie = () => Cookies.get(USER_ID_COOKIE_NAME);
export const isLoggedIn = () => !!getUserIdCookie();

export const getNotificationSubscriberHashCookie = () =>
  Cookies.get(NOTIFICATION_SUBSCRIBER_COOKIE_NAME);
