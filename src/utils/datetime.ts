// Converts seconds to (hours), minutes, and seconds
export const secondsFormatter = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) {
    return '';
  }
  let formattedTime = new Date(seconds * 1000).toISOString().substr(12, 7);

  // remove hours when the duration is less than 60 minutes
  if (formattedTime.substring(0, 2) === '0:') {
    formattedTime = formattedTime.substring(2, formattedTime.length);
  }

  return formattedTime;
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
