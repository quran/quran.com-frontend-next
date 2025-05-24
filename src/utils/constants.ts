/* eslint-disable import/prefer-default-export */

/**
 * all routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORGET_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COMPLETE_SIGNUP: '/complete-signup',
  PRIVACY: '/privacy',
  TERMS: '/terms-and-conditions',
  SITEMAP: '/sitemap.xml',
};

/**
 * auth routes
 */
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.FORGET_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.COMPLETE_SIGNUP,
];
