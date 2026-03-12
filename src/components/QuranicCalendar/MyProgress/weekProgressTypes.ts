export type WeekData = {
  weekNumber: string;
  hijriMonth: string;
  ranges: string;
};

export type WeekRow = {
  weekNumber: number;
  hijriMonth: number;
  monthName: string;
  monthOrder: number;
  startChapterNumber: number;
  startSurahName: string;
  startVerse: number;
  endChapterNumber: number;
  endSurahName: string;
  endVerse: number;
};

export type GroupedMonth = {
  monthNumber: number;
  monthName: string;
  monthOrder: number;
  weeks: WeekRow[];
};

export type WeekGroup = {
  key: string;
  title: string;
  startWeek: number;
  endWeek: number;
};

export type WeekGroupWithMonths = WeekGroup & {
  months: GroupedMonth[];
};
