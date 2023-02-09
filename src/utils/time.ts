/* eslint-disable import/prefer-default-export */

// Intl.DateTimeFormat is performance heavy so we are caching the formatter.
let dateTimeFormatter: Intl.DateTimeFormat = null;
let timezone: string = null;

/**
 * Returns the current timezone.
 *
 * @example `Europe/London`
 * @returns {string}
 */
export const getTimezone = (): string => {
  if (timezone) return timezone;
  if (!dateTimeFormatter) dateTimeFormatter = new Intl.DateTimeFormat();

  timezone = dateTimeFormatter.resolvedOptions().timeZone;
  return timezone;
};

export const formatSecondsToHumanReadable = (s: number): string => {
  const date = new Date(s * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getSeconds();

  const hoursString = hours ? `${hours}h ` : '';
  const minutesString = minutes ? `${minutes}m ` : '';
  const secondsString = seconds ? `${seconds}s` : '';

  return `${hoursString}${minutesString}${secondsString}`.trim();
};
