import { getLangFullLocale, LANG_LOCALE_MAP } from './locale';

// Converts seconds to (hours), minutes, and seconds
export const secondsFormatter = (seconds: number, locale: string) => {
  if (!seconds || Number.isNaN(seconds)) {
    return '';
  }
  return new Date(seconds * 1000).toLocaleTimeString(getLangFullLocale(locale), {
    timeZone: 'Etc/UTC',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
    ...(seconds >= 3600 && { hour: '2-digit' }), // only include hours if the duration is more than 60 minutes
  });
};

/**
 * Convert milliseconds to seconds.
 *
 * @param {number} milliSeconds
 * @returns  {number}
 */
export const milliSecondsToSeconds = (milliSeconds: number): number => milliSeconds / 1000;

/**
 * Get the earliest date of a groups of date string.
 *
 * @param {string[]} dates
 * @returns {number}
 */
export const getEarliestDate = (dates: string[]): number =>
  dates.map((dateString) => parseDate(dateString)).sort((a, b) => a - b)[0];

/**
 * Parse a date string.
 *
 * @param {string} date
 * @returns {number}
 */
export const parseDate = (date: string): number => Date.parse(date);

/**
 * Format date to a string
 *
 * @param {Date} date
 * @param {string} locale
 * @returns {string} date
 */
export const formatDateRelatively = (date: Date, locale: string, now: Date = new Date()) => {
  const fullLocale = LANG_LOCALE_MAP[locale];

  // Formatter for "Today" and "Yesterday" etc
  const relative = new Intl.RelativeTimeFormat(fullLocale, { numeric: 'auto' });

  const nowDate = now.setHours(0, 0, 0, 0);
  const then = date.setHours(0, 0, 0, 0);
  const days = (then - nowDate) / 86400000;

  if (days < -365) {
    const years = Math.round(days / 365);
    return relative.format(years, 'year');
  }

  if (days < -7) {
    const weeks = Math.round(days / 7);
    return relative.format(weeks, 'weeks');
  }

  return relative.format(days, 'day');
};
