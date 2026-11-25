import Cookies from 'js-cookie';

import { USER_DATA_SYNC_COOKIE_NAME } from './constants';

export const getLastSyncAt = (): Date | null => {
  const value = Cookies.get(USER_DATA_SYNC_COOKIE_NAME);
  if (!value) {
    return null;
  }

  const dateValue = new Date(value);
  return !Number.isNaN(dateValue.getTime()) ? dateValue : null;
};

export const removeLastSyncAt = () => {
  // Remove with path '/' to ensure cookie is removed regardless of current path
  Cookies.remove(USER_DATA_SYNC_COOKIE_NAME, { path: '/' });
};

// Keep the cookie across browser/PWA restarts. Without an expiry it is a session cookie,
// which installed PWAs drop when the app is closed, so local data was re-synced on every start.
const LAST_SYNC_AT_COOKIE_EXPIRY_DAYS = 365;

export const setLastSyncAt = (lastSyncAt: Date) =>
  Cookies.set(USER_DATA_SYNC_COOKIE_NAME, lastSyncAt.toString(), {
    path: '/',
    expires: LAST_SYNC_AT_COOKIE_EXPIRY_DAYS,
  });
