/* eslint-disable import/prefer-default-export */
import { getAuthApiPath } from 'src/utils/url';

const makeUrl = (url: string): string => getAuthApiPath(url);

export const makeUserProfileUrl = (): string => makeUrl('users/profile');

export const makeCompleteSignupUrl = (): string => makeUrl('users/completeSignup');

export const makeSendMagicLinkUrl = (): string => makeUrl('auth/magiclogin');

export const makeGoogleLoginUrl = (): string => makeUrl('auth/google');

export const makeFacebookLoginUrl = (): string => makeUrl('auth/facebook');

export const makeAppleLoginUrl = () => makeUrl('auth/apple');

export const makeBookmarksUrl = (): string => makeUrl('bookmarks');
