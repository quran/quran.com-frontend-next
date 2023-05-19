import { Mushaf } from '../QuranReader';

export enum GoalCategory {
  QURAN = 'QURAN',
}

export enum GoalType {
  TIME = 'QURAN_TIME',
  PAGES = 'QURAN_PAGES',
  RANGE = 'QURAN_RANGE',
}

export type Goal = {
  id: string;
  type: GoalType;
  targetAmount: string;
  duration?: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateGoalRequest = {
  type: GoalType;
  amount: string | number;
  duration?: number;
  mushafId: Mushaf;
  category: GoalCategory;
};

export type EstimateGoalRequest = Omit<CreateGoalRequest, 'category'>;

export type UpdateGoalRequest = Partial<CreateGoalRequest>;

export type QuranGoalStatus = Goal & {
  progress: {
    percent: number;

    // this will be either a number of pages (for PAGES and RANGE goals) or a number of seconds (for TIME goals)
    amountLeft: number;

    nextVerseToRead?: string;
    daysLeft?: number;
  };
};

export interface EstimatedGoalDay {
  date: string;
  amount: number;
}

export type RangeEstimatedQuranGoalDay = Omit<EstimatedGoalDay, 'amount'> & {
  amount: string;
};

export type EstimatedQuranGoal =
  | {
      week: EstimatedGoalDay[];
    }
  | {
      week: RangeEstimatedQuranGoalDay[];
    };

export enum QuranGoalPeriod {
  Daily = 'DAILY',
  Continuous = 'CONTINUOUS',
}
