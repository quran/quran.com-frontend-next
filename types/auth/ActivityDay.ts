import { Mushaf } from '../QuranReader';

export enum ActivityDayType {
  QURAN = 'QURAN',
  LESSON = 'LESSON',
}

export type ActivityDay<T> = {
  id: string;
  date: Date;
  progress: number;
} & T;

export type QuranActivityDay = {
  ranges: string[];
  pagesRead: number;
  versesRead: number;
  secondsRead: number;
  manuallyAddedSeconds?: number;
  dailyTargetPages?: number;
  dailyTargetSeconds?: number;
  dailyTargetRanges: string[];
  remainingDailyTargetRanges: string[];
};

type ActivityDayBody = {
  type: ActivityDayType;
};

export type UpdateQuranActivityDayBody = {
  ranges?: string[];
  pages?: number;
  date?: string;
  seconds?: number;
  mushafId: Mushaf;
};

export type UpdateLessonActivityDayBody = {
  lessonId: string;
};

export type UpdateActivityDayBody<T> = ActivityDayBody & T;

export type UpdateActivityDayParams = UpdateActivityDayBody<
  UpdateQuranActivityDayBody | UpdateLessonActivityDayBody
>;

export type FilterActivityDaysParams = {
  from: string;
  to: string;
  limit?: number;
  cursor?: string;
  type: ActivityDayType;
};

export type CurrentQuranActivityDay = ActivityDay<QuranActivityDay> & { hasRead: boolean };
