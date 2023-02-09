export type ReadingGoal = {
  id: string;
  type: ReadingGoalType;
  amount: string;
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
    amountLeft: number;
    nextVerseToRead?: string;
    plan?: {
      amountPerDay: number;
      daysLeft: number;
    };
  };
};
