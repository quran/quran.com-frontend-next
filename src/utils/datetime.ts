import { Translate } from 'next-translate';

import { getLangFullLocale, LANG_LOCALE_MAP, toLocalizedNumber } from './locale';
import { convertNumberToDecimal } from './number';

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
 * Convert seconds to the format of `x hours, y minutes, z seconds`.
 * Or any combination of the three.
 *
 * @param {numbers} s seconds
 * @param {Translate} t translate function
 * @param {string} locale locale
 * @returns {string}
 */
// eslint-disable-next-line react-func/max-lines-per-function
export const secondsToReadableFormat = (s: number, t: Translate, locale: string): string => {
  const results: string[] = [];

  let seconds = s;
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    results.push(
      t('reading-goal:x-hours', {
        count: hours,
        hours: toLocalizedNumber(convertNumberToDecimal(hours), locale),
      }),
    );
    minutes %= 60;
    seconds %= 60;
  }

  if (minutes > 0) {
    results.push(
      t('reading-goal:x-minutes', {
        count: minutes,
        minutes: toLocalizedNumber(convertNumberToDecimal(minutes), locale),
      }),
    );
    seconds %= 60;
  }

  // if there are seconds left, or if the duration is 0 (in this case, `results.length` = 0), add seconds
  if (seconds > 0 || results.length === 0) {
    results.push(
      t('reading-goal:x-seconds', {
        count: seconds,
        seconds: toLocalizedNumber(convertNumberToDecimal(seconds), locale),
      }),
    );
  }

  return results.join(', ');
};

/**
 * Convert milliseconds to seconds.
 *
 * @param {number} milliSeconds
 * @returns  {number}
 */
export const milliSecondsToSeconds = (milliSeconds: number): number => milliSeconds / 1000;

/**
 * Convert milliseconds to seconds.
 *
 * @param {number} seconds
 * @returns  {number}
 */
export const secondsToMilliSeconds = (seconds: number): number => seconds * 1000;

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
export const formatDateRelatively = (
  date: Date,
  locale: string,
  now: Date = new Date(),
): string => {
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

/**
 * Given a Date, return the year, month and day values
 *
 * @param {Date} date
 * @returns {{year: number, month: number, day: number}}
 */
export const dateToYearMonthDay = (date: Date): { year: number; month: number; day: number } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return { year, month, day };
};

export const getCurrentMonth = () => new Date().getMonth() + 1;

export const getCurrentDay = () => new Date().getDate();

/**
 * Converts a date instance to a string in this format: YYYY-MM-DD
 *
 * @param {Date} date
 * @returns {string}
 */
export const dateToDateString = (
  date: Date | { day: number; month: number; year: number },
): string => {
  const { year, month, day } = date instanceof Date ? dateToYearMonthDay(date) : date;
  return `${year}-${numberToPaddedString(month)}-${numberToPaddedString(day)}`;
};

/**
 * Gets the full day name in a given locale.
 * Example: `Monday` in `en`
 *
 * @param {Date} day
 * @param {string} locale
 * @returns {string}
 *
 */
export const getFullDayName = (day: Date, locale: string): string => {
  return day.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' });
};

/**
 * Gets the full month name in a given locale.
 * Example: `April` in `en`
 *
 * @param {Date} month
 * @param {string} locale
 * @returns {string}
 *
 */
export const getFullMonthName = (month: Date, locale: string): string => {
  return month.toLocaleDateString(locale, { month: 'long', timeZone: 'UTC' });
};

/**
 * Formats a date to a readable format.
 *
 * Example output: `Sunday, April 16`
 *
 * @param {Date | string} date Date instance or date string
 * @param {string} locale
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 *
 */
export const dateToReadableFormat = (
  date: Date | string,
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const dateInstance = typeof date === 'string' ? new Date(date) : date;

  return dateInstance.toLocaleDateString(getLangFullLocale(locale), {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    timeZone: 'UTC',
    ...options,
  });
};

/**
 * Convert a number into a padded string with 0. E.g. 1 -> 01
 *
 * @param {number} number
 * @returns {string}
 */
export const numberToPaddedString = (number: number): string => {
  return number.toString().padStart(2, '0');
};

type DateRange = { from: string; to: string };

/**
 * Given a month and a year, this function returns the first and last day of the month in format: YYYY-MM-DD.
 *
 * @param {number} month
 * @param {number} year
 * @returns {DateRange}
 */
export const makeDateRangeFromMonth = (month: number, year: number): DateRange => {
  const from = `${year}-${numberToPaddedString(month)}-01`;
  const to = `${year}-${numberToPaddedString(month)}-${numberToPaddedString(
    new Date(year, month, 0).getDate(),
  )}`;

  return { from, to };
};

type Month = { id: number; name: string; daysCount: number };

/**
 * Get a Date out of year and month numbers.
 *
 * @param {year} year
 * @param {month} month
 * @returns {Date}
 */
export const getMonthDateObject = (year: number, month: number): Date => {
  return new Date(year, month, 0);
};

/**
 * This function returns an array of months in a given year.
 *
 * @param {number} year
 * @param {string} locale
 * @returns {Month[]}
 */
export const getMonthsInYear = (year: number, locale: string): Month[] => {
  const all: Month[] = [];

  for (let i = 1; i <= 12; i += 1) {
    const monthDate = getMonthDateObject(year, i);
    const daysInMonth = monthDate.getDate();

    all.push({ id: i, name: getFullMonthName(monthDate, locale), daysCount: daysInMonth });
  }

  return all;
};
