/* eslint-disable import/prefer-default-export */
import { NextRouter } from 'next/router';

import { AUTH_ROUTES } from './navigation';

export const QURAN_READER_ROUTE_PATHNAMES = new Set([
  '/[chapterId]',
  '/[chapterId]/[verseId]',
  '/[chapterId]/[verseId]/tafsirs',
  '/[chapterId]/answers',
  '/[chapterId]/answers/[questionId]',
  '/[chapterId]/hadith',
  '/[chapterId]/layers',
  '/[chapterId]/lessons',
  '/[chapterId]/qiraat',
  '/[chapterId]/reflections',
  '/[chapterId]/related-verses',
  '/[chapterId]/tafsirs/[tafsirId]',
  '/hizb/[hizbId]',
  '/juz/[juzId]',
  '/page/[pageId]',
  '/rub/[rubId]',
  '/surah/[chapterId]/[...info]',
]);

/**
 * Check if the current route is an authentication page
 *
 * @param {NextRouter} router - Next.js router object
 * @returns {boolean} - Indicates if current page is an auth page
 */

export const isAuthPage = (router: NextRouter): boolean => {
  return AUTH_ROUTES.includes(router.pathname);
};

export const isQuranReaderRoutePathname = (pathname: string): boolean => {
  return QURAN_READER_ROUTE_PATHNAMES.has(pathname);
};

// Routes whose page content renders on the "elevated" background surface
// (--color-background-elevated-new) instead of the default one, so any UI
// that sits right after them (e.g. the footer) needs to match that surface
// to avoid a seam in themes like Sepia where the two tokens differ (#3326).
export const ELEVATED_BACKGROUND_ROUTE_PATHNAMES = new Set([
  ...QURAN_READER_ROUTE_PATHNAMES,
  '/collections/all',
  '/collections/[collectionId]',
]);

export const isElevatedBackgroundRoutePathname = (pathname: string): boolean => {
  return ELEVATED_BACKGROUND_ROUTE_PATHNAMES.has(pathname);
};
