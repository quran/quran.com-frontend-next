import { Mushaf } from '../QuranReader';

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
  mushafId: Mushaf;
};

export type UpdateReadingGoalRequest = Partial<CreateReadingGoalRequest>;

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

export interface EstimatedReadingGoalDay {
  date: string;
  amount: number;
}

export type RangeEstimatedReadingGoalDay = Omit<EstimatedReadingGoalDay, 'amount'> & {
  amount: string;
};

export type EstimatedReadingGoal =
  | {
      week: EstimatedReadingGoalDay[];
    }
  | {
      week: RangeEstimatedReadingGoalDay[];
    };
