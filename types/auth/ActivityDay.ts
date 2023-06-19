import { Mushaf } from '../QuranReader';

export enum ActivityDayType {
  QURAN = 'QURAN',
}

export type ActivityDay = {
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

export type UpdateActivityDayBody = {
  ranges?: string[];
  pages?: number;
  seconds?: number;
  mushafId: Mushaf;
  type: ActivityDayType;
};

export type FilterActivityDaysParams = {
  from: string;
  to: string;
  limit?: number;
  cursor?: string;
  type: ActivityDayType;
};
