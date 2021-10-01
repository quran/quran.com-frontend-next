import VerseTiming from 'types/VerseTiming';

// eslint-disable-next-line import/prefer-default-export
export const getVerseTimingByVerseKey = (verseKey: string, verseTimings: VerseTiming[]) => {
  return verseTimings.find((verseTiming) => verseTiming.verseKey === verseKey);
};
