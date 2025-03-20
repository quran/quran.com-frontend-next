// Type definitions for the Quranic Calendar progress component
export interface CalendarWeek {
  weekNumber: string;
  hijriYear: string;
  hijriMonth: string;
  ranges: string;
}

export interface CalendarData {
  [key: string]: CalendarWeek[];
}

export interface ProcessedWeek {
  localWeekNumber: number;
  globalWeekNumber: number;
  isCompleted: boolean;
  isActive: boolean;
  hasPassed: boolean;
  data: CalendarWeek;
}

export interface ProcessedMonth {
  id: number;
  name: string;
  weeks: ProcessedWeek[];
  isRamadan: boolean;
  isCurrentMonth?: boolean;
}

// For backward compatibility
export type MonthData = ProcessedMonth;
