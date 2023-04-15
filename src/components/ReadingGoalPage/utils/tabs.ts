import useReadingGoalReducer, { ReadingGoalPeriod } from '../hooks/useReadingGoalReducer';
import ReadingGoalExamplesTab from '../ReadingGoalExamplesTab';
import ReadingGoalTargetAmountTab from '../ReadingGoalTargetAmountTab';
import ReadingGoalTimeTab from '../ReadingGoalTimeTab';
import ReadingGoalTypeTab from '../ReadingGoalTypeTab';
import ReadingGoalWeekPreviewTab from '../ReadingGoalWeekPreviewTab';

import { ReadingGoalType } from '@/types/auth/ReadingGoal';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';

const tabs = {
  examples: ReadingGoalExamplesTab,
  continuity: ReadingGoalTimeTab,
  type: ReadingGoalTypeTab,
  amount: ReadingGoalTargetAmountTab,
  preview: ReadingGoalWeekPreviewTab,
} as const;

export const tabsArray = (Object.keys(tabs) as (keyof typeof tabs)[]).map((key) => ({
  key,
  Component: tabs[key],
}));

export const logTabClick = (
  tab: keyof typeof tabs,
  event: string,
  metadata?: Record<string, unknown>,
) => {
  logButtonClick(`create_goal_${tab}_tab_${event}`, metadata);
};

export const logTabNextClick = (
  tab: keyof typeof tabs,
  state: ReturnType<typeof useReadingGoalReducer>[0],
) => {
  let metadata: Record<string, unknown> | undefined;

  if (tab === 'examples') {
    metadata = { example: state.exampleKey };
  } else if (tab === 'type') {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    metadata = { goal_type: state.type };
  } else if (tab === 'amount') {
    metadata = {
      pages: state.type === ReadingGoalType.PAGES ? state.pages : null,
      seconds: state.type === ReadingGoalType.TIME ? state.seconds : null,
      range:
        state.type === ReadingGoalType.RANGE
          ? `${state.rangeStartVerse}-${state.rangeEndVerse}`
          : null,
      duration: state.period === ReadingGoalPeriod.Continuous ? state.duration : null,
    };
  } else if (tab === 'continuity') {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    metadata = { goal_period: state.period };
  }

  logTabClick(tab, 'next', metadata);
};

export const logTabInputChange = (
  tab: keyof typeof tabs,
  input: string,
  values: { currentValue: unknown; newValue: unknown },
  metadata?: Record<string, unknown>,
) => {
  logValueChange(`create_goal_${tab}_tab_${input}`, values.currentValue, values.newValue, metadata);
};
