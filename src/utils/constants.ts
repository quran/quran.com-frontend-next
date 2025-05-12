/* eslint-disable import/prefer-default-export */

/**
 * all routes
 */
export const ROUTES = {
  LOGIN: '/login',
  FORGET_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

/**
 * auth routes
 */
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.FORGET_PASSWORD, ROUTES.RESET_PASSWORD];
