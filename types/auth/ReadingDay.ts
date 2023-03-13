export type ReadingDay = {
  ranges: string[];
  pagesRead: number;
  secondsRead: number;
  progress: number;
  dailyTargetPages?: number;
  dailyTargetSeconds?: number;
  dailyTargetRanges: string[];
  date: Date;
};

export type UpdateReadingDayBody = {
  ranges?: string[];
  pages?: number;
  seconds?: number;
  timezone: string;
};
