import Cookies from 'js-cookie';

import { USER_ID_COOKIE_NAME } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const isLoggedIn = () => !!Cookies.get(USER_ID_COOKIE_NAME);
