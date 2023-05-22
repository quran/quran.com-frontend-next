import useReadingGoalReducer from '../hooks/useReadingGoalReducer';
import ReadingGoalExamplesTab from '../ReadingGoalExamplesTab';
import ReadingGoalTargetAmountTab from '../ReadingGoalTargetAmountTab';
import ReadingGoalTimeTab from '../ReadingGoalTimeTab';
import ReadingGoalTypeTab from '../ReadingGoalTypeTab';
import ReadingGoalWeekPreviewTab from '../ReadingGoalWeekPreviewTab';

import { QuranGoalPeriod, GoalType } from '@/types/auth/Goal';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';

export enum TabKey {
  ExamplesTab = 'examples',
  ContinuityTab = 'continuity',
  TypeTab = 'type',
  AmountTab = 'amount',
  PreviewTab = 'preview',
}

const tabs = {
  [TabKey.ExamplesTab]: ReadingGoalExamplesTab,
  [TabKey.ContinuityTab]: ReadingGoalTimeTab,
  [TabKey.TypeTab]: ReadingGoalTypeTab,
  [TabKey.AmountTab]: ReadingGoalTargetAmountTab,
  [TabKey.PreviewTab]: ReadingGoalWeekPreviewTab,
};

export const tabsArray = (Object.keys(tabs) as TabKey[]).map((key) => ({
  key,
  Component: tabs[key],
}));

export const logTabClick = (tab: TabKey, event: string, metadata?: Record<string, unknown>) => {
  logButtonClick(`create_goal_${tab}_tab_${event}`, metadata);
};

export const logTabNextClick = (
  tab: TabKey,
  state: ReturnType<typeof useReadingGoalReducer>[0],
) => {
  let metadata: Record<string, unknown> | undefined;

  if (tab === TabKey.ExamplesTab) {
    metadata = { example: state.exampleKey };
  } else if (tab === TabKey.TypeTab) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    metadata = { goal_type: state.type };
  } else if (tab === TabKey.AmountTab) {
    metadata = {
      pages: state.type === GoalType.PAGES ? state.pages : null,
      seconds: state.type === GoalType.TIME ? state.seconds : null,
      range:
        state.type === GoalType.RANGE ? `${state.rangeStartVerse}-${state.rangeEndVerse}` : null,
      duration: state.period === QuranGoalPeriod.Continuous ? state.duration : null,
    };
  } else if (tab === TabKey.ContinuityTab) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    metadata = { goal_period: state.period };
  }

  logTabClick(tab, 'next', metadata);
};

export const logTabInputChange = (
  tab: TabKey,
  input: string,
  values: { currentValue: unknown; newValue: unknown },
  metadata?: Record<string, unknown>,
) => {
  logValueChange(`create_goal_${tab}_tab_${input}`, values.currentValue, values.newValue, metadata);
};
