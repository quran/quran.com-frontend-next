export type ReadingGoal = {
  id: string;
  type: ReadingGoalType;
  targetAmount: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateReadingGoalRequest = {
  type: ReadingGoalType;
  amount: string | number;
  duration?: number;
};

export enum ReadingGoalType {
  TIME = 'TIME',
  PAGES = 'PAGES',
  RANGE = 'RANGE',
}

export type ReadingGoalStatus = ReadingGoal & {
  progress: {
    percent: number;

    // this will be either a number of pages (for PAGES and RANGE goals) or a number of seconds (for TIME goals)
    amountLeft: number;

    nextVerseToRead?: string;
    daysLeft?: number;
  };
};

export type EstimatedReadingGoal =
  | {
      type: ReadingGoalType.PAGES | ReadingGoalType.TIME;
      dailyAmount: number;
    }
  | {
      type: ReadingGoalType.RANGE;
      dailyAmount: number; // number of verses
      ranges: string[];
    }
  | {
      type: ReadingGoalType.RANGE;
      dailyAmount: string; // single range
    };
