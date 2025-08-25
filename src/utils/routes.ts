/* eslint-disable import/prefer-default-export */
import { AUTH_ROUTES } from './navigation';

/**
 * Check if the current route is an authentication page
 *
 * @param {string} pathname - Route pathname
 * @returns {boolean} - Indicates if current page is an auth page
 */

export const isAuthPage = (pathname: string): boolean => {
  return AUTH_ROUTES.includes(pathname);
};
