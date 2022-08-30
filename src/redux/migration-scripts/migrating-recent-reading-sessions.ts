type OldRecentReadingSessions = Record<string, boolean>;
type NewRecentReadingSessions = Record<string, number>;

/**
 * Migrate recent recent reading sessions from OldRecentReadingSessions to NewRecentReadingSessions
 * use date instead of boolean
 */

// eslint-disable-next-line import/prefer-default-export
export const migrateRecentReadingSessions = (
  recentReadingSessions: OldRecentReadingSessions,
  defaultTime = new Date(),
): NewRecentReadingSessions => {
  // eslint-disable-next-line unicorn/no-array-reduce
  return Object.entries(recentReadingSessions).reduce((acc, session) => {
    const [key] = session;
    return {
      [key]: defaultTime.getTime(),
      ...acc,
    };
  }, {});
};
