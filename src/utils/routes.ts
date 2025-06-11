/* eslint-disable import/prefer-default-export */
import { NextRouter } from 'next/router';

import { AUTH_ROUTES } from './navigation';

/**
 * Check if the current route is an authentication page
 *
 * @param {NextRouter} router - Next.js router object
 * @returns {boolean} - Indicates if current page is an auth page
 */

export const isAuthPage = (router: NextRouter): boolean => {
  return AUTH_ROUTES.includes(router.pathname);
};
