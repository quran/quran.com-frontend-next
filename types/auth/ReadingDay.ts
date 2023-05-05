import { Mushaf } from '../QuranReader';

export type ReadingDay = {
  id: string;
  ranges: string[];
  pagesRead: number;
  versesRead: number;
  secondsRead: number;
  progress: number;
  dailyTargetPages?: number;
  dailyTargetSeconds?: number;
  dailyTargetRanges: string[];
  remainingDailyTargetRanges: string[];
  date: Date;
};

export type UpdateReadingDayBody = {
  ranges?: string[];
  pages?: number;
  seconds?: number;
  mushafId: Mushaf;
};

export type FilterReadingDaysParams = {
  from: string;
  to: string;
  limit?: number;
  cursor?: string;
};
