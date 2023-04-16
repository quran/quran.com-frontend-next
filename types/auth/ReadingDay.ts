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
  date: Date;
};

export type UpdateReadingDayBody = {
  ranges?: string[];
  pages?: number;
  seconds?: number;
};

export type FilterReadingDaysParams = {
  from: string;
  to: string;
  limit?: number;
  cursor?: string;
};
