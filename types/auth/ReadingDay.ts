export type ReadingDay = {
  ranges: string[];
  pagesRead: number;
  secondsRead: number;
  date: Date;
};

export type UpdateReadingDayBody = {
  ranges?: string[];
  pages?: number;
  seconds?: number;
  timezone: string;
};
