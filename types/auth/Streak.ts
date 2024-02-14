import { Mushaf } from '../QuranReader';

import { ActivityDay, QuranActivityDay } from './ActivityDay';
import { QuranGoalStatus } from './Goal';

export enum StreakType {
  QURAN = 'QURAN',
}

export type StreakWithUserMetadata = {
  streak: number;
  goal?: QuranGoalStatus;
  activityDays: (Omit<ActivityDay<QuranActivityDay>, 'date'> & {
    date: string;
  })[];
};

export type StreakWithMetadataParams = {
  from: string;
  to: string;
  mushafId: Mushaf;
  type: StreakType;
};
