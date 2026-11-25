import { RecentReadingSessions } from '@/redux/slices/QuranReader/readingTracker';
import ReadingSession from 'types/ReadingSession';

/**
 * Get the timestamp of the newest reading session the account already has.
 *
 * @param {ReadingSession[]} serverSessions - The account's reading sessions.
 * @returns {number} The newest updatedAt in ms, or 0 if there are none.
 */
export const getNewestServerSessionTime = (serverSessions?: ReadingSession[]): number => {
  const times = (serverSessions || [])
    .map((session) => new Date(session.updatedAt).getTime())
    .filter((time) => !Number.isNaN(time));
  return times.length ? Math.max(...times) : 0;
};

/**
 * Keep only the local reading sessions that are newer than every session the account
 * already has, so stale local sessions never replace a newer place read on another device.
 *
 * @param {RecentReadingSessions} localSessions - verseKey -> timestamp (ms), from Redux.
 * @param {ReadingSession[]} serverSessions - The account's reading sessions.
 * @returns {RecentReadingSessions} The local sessions that are safe to upload.
 */
export const getLocalSessionsNewerThanServer = (
  localSessions: RecentReadingSessions,
  serverSessions?: ReadingSession[],
): RecentReadingSessions => {
  const newestServerTime = getNewestServerSessionTime(serverSessions);
  return Object.fromEntries(
    Object.entries(localSessions).filter(([, timestamp]) => timestamp > newestServerTime),
  );
};
