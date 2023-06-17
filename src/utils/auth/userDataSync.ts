import Cookies from 'js-cookie';

import { USER_DATA_SYNC_COOKIE_NAME } from './constants';

export const getLastSyncAt = (): Date | null => {
  const value = Cookies.get(USER_DATA_SYNC_COOKIE_NAME);
  if (!value) {
    return null;
  }

  const dateValue = Date.parse(value);
  return !Number.isNaN(dateValue) ? new Date(dateValue) : null;
};

export const removeLastSyncAt = () => Cookies.remove(USER_DATA_SYNC_COOKIE_NAME);

export const setLastSyncAt = (lastSyncAt: Date) =>
  Cookies.set(USER_DATA_SYNC_COOKIE_NAME, lastSyncAt.getTime().toString());
