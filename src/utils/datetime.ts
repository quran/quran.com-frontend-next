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
export const formatDate = (date: Date, locale) => {
  const fullLocale = LANG_LOCALE_MAP[locale];

  // Formatter for "Today" and "Yesterday" etc
  const relative = new Intl.RelativeTimeFormat(fullLocale, { numeric: 'auto' });

  // Formatter for weekdays, e.g. "Monday"
  const short = new Intl.DateTimeFormat(fullLocale, { weekday: 'long' });

  // Formatter for dates, e.g. "Mon, 31 May 2021"
  const long = new Intl.DateTimeFormat(fullLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const now = new Date().setHours(0, 0, 0, 0);
  const then = date.setHours(0, 0, 0, 0);
  const days = (then - now) / 86400000;
  if (days > -6) {
    if (days > -2) {
      return relative.format(days, 'day');
    }
    return short.format(date);
  }
  return long.format(date);
};
