/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable import/prefer-default-export */
import { getPercentage } from './number';
import { formatSecondsToHumanReadable } from './time';
import { generateVerseKeysBetweenTwoVerseKeys } from './verseKeys';

import { ReadingDay } from '@/types/auth/ReadingDay';
import { ReadingGoal, ReadingGoalType } from '@/types/auth/ReadingGoal';
import ChaptersData from '@/types/ChaptersData';

export const formatGoal = (goal: ReadingGoal): string => {
  const { type, amount } = goal;

  if (type === ReadingGoalType.RANGE) {
    return 'Range';
  }

  const numberAmount = Number(amount);
  if (type === ReadingGoalType.PAGES) {
    return `${numberAmount} page${numberAmount > 1 ? 's' : ''}`;
  }

  return `${formatSecondsToHumanReadable(numberAmount)}`;
};

type Result = {
  percent: number;
  amountLeft: string;
};

export const getGoalProgress = (
  chaptersData: ChaptersData,
  goal: ReadingGoal,
  day?: ReadingDay,
): Result => {
  const { type, amount } = goal;
  const pages = day?.pagesRead || 0;
  const seconds = day?.secondsRead || 0;
  const ranges = day?.ranges || [];

  const numberAmount = Number(amount);

  if (type === ReadingGoalType.PAGES) {
    return {
      percent: getPercentage(pages, numberAmount),
      amountLeft: `${Math.max(numberAmount - pages, 0)} page${numberAmount > 1 ? 's' : ''}`,
    };
  }

  if (type === ReadingGoalType.RANGE) {
    const [from, to] = amount.split('-');
    const rangeVerses = new Set(generateVerseKeysBetweenTwoVerseKeys(chaptersData, from, to));
    const readVerses = new Set();

    ranges.forEach((range) => {
      const [fromVerseKey, toVerseKey] = range.split('-');

      // if the range is not in the goal range, skip it
      if (!rangeVerses.has(fromVerseKey) && !rangeVerses.has(toVerseKey)) return;

      const verseKeys = generateVerseKeysBetweenTwoVerseKeys(
        chaptersData,
        fromVerseKey,
        toVerseKey,
      );
      verseKeys.forEach((verseKey) => readVerses.add(verseKey));
    });

    const nextVerseToRead = Array.from(rangeVerses).find((verseKey) => !readVerses.has(verseKey));

    return {
      percent: getPercentage(readVerses.size, rangeVerses.size),
      amountLeft: nextVerseToRead || '',
    };
  }

  return {
    percent: getPercentage(seconds, numberAmount),
    amountLeft: formatSecondsToHumanReadable(Math.max(numberAmount - seconds, 0)),
  };
};
