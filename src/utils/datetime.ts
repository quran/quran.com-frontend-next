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

export default secondsFormatter;
