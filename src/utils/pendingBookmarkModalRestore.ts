import Verse from '@/types/Verse';
import QueryParam from 'types/QueryParam';

const STORAGE_KEY = 'pending-bookmark-modal-restore';
const MAX_PENDING_AGE_MS = 30 * 60 * 1000; // 30 minutes

export interface PendingBookmarkModalRestorePayload {
  verse: Verse;
  verseKey: string;
  redirectUrl: string;
  createdAt: number;
}

const isBrowser = (): boolean => typeof window !== 'undefined';

const normalizePathname = (pathname: string): string => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
};

const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url, 'https://quran.com');
  } catch {
    return null;
  }
};

const stripLocalePrefix = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return pathname;
  if (segments[0].length > 2 || segments[0].includes('-')) return pathname;

  const pathWithoutLocale = `/${segments.slice(1).join('/')}`;
  return pathWithoutLocale || '/';
};

const doesCurrentPathMatchRedirect = (currentPath: string, redirectUrl: string): boolean => {
  const current = parseUrl(currentPath);
  const redirect = parseUrl(redirectUrl);

  if (!current || !redirect) return false;

  const expectedPath = normalizePathname(redirect.pathname);
  const currentPathname = normalizePathname(current.pathname);
  const currentPathWithoutLocale = normalizePathname(stripLocalePrefix(currentPathname));

  if (
    currentPathname !== expectedPath &&
    currentPathWithoutLocale !== expectedPath &&
    !currentPathname.endsWith(expectedPath)
  ) {
    return false;
  }

  const expectedStartingVerse = redirect.searchParams.get(QueryParam.STARTING_VERSE);
  if (!expectedStartingVerse) return true;

  return current.searchParams.get(QueryParam.STARTING_VERSE) === expectedStartingVerse;
};

const hasValidVerseData = (verse: Partial<Verse> | null | undefined): verse is Verse => {
  if (!verse) return false;
  if (!verse.chapterId) return false;
  if (!Number.isFinite(Number(verse.verseNumber))) return false;
  if (!verse.verseKey) return false;
  return true;
};

const isValidPayload = (
  payload: Partial<PendingBookmarkModalRestorePayload> | null | undefined,
): payload is PendingBookmarkModalRestorePayload => {
  if (!payload) return false;
  if (!hasValidVerseData(payload.verse)) return false;
  if (!payload.verseKey || typeof payload.verseKey !== 'string') return false;
  if (!payload.redirectUrl || typeof payload.redirectUrl !== 'string') return false;
  if (!Number.isFinite(payload.createdAt)) return false;
  if (Date.now() - payload.createdAt > MAX_PENDING_AGE_MS) return false;
  return true;
};

export const setPendingBookmarkModalRestore = (
  payload: Omit<PendingBookmarkModalRestorePayload, 'createdAt'>,
): void => {
  if (!isBrowser()) return;

  try {
    const payloadWithCreatedAt: PendingBookmarkModalRestorePayload = {
      ...payload,
      createdAt: Date.now(),
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payloadWithCreatedAt));
  } catch {
    // Ignore sessionStorage errors (private mode, quota, etc.)
  }
};

export const clearPendingBookmarkModalRestore = (): void => {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore sessionStorage errors
  }
};

export const consumePendingBookmarkModalRestore = (
  currentPath: string,
): PendingBookmarkModalRestorePayload | null => {
  if (!isBrowser()) return null;

  try {
    const rawPayload = window.sessionStorage.getItem(STORAGE_KEY);
    if (!rawPayload) return null;

    const parsedPayload = JSON.parse(rawPayload) as PendingBookmarkModalRestorePayload;
    if (!isValidPayload(parsedPayload)) {
      clearPendingBookmarkModalRestore();
      return null;
    }

    if (!doesCurrentPathMatchRedirect(currentPath, parsedPayload.redirectUrl)) {
      return null;
    }

    clearPendingBookmarkModalRestore();
    return parsedPayload;
  } catch {
    clearPendingBookmarkModalRestore();
    return null;
  }
};
