import Cookies from 'js-cookie';

import { USER_ID_COOKIE_NAME } from './constants';

export const getUserIdCookie = () => Cookies.get(USER_ID_COOKIE_NAME);
export const isLoggedIn = () => !!getUserIdCookie();
