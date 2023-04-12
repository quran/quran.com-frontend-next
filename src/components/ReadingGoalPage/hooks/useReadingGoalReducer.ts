/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { Dispatch, SetStateAction, useReducer } from 'react';

import BookIcon from '@/icons/book.svg';
import ClockIcon from '@/icons/clock.svg';
import SettingsIcon from '@/icons/settings-stroke.svg';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';

export enum ReadingGoalPeriod {
  Daily = 'daily',
  Continuous = 'continuous',
}

interface ReadingGoalState {
  period: ReadingGoalPeriod;
  type: ReadingGoalType;
  pages: number;
  seconds: number;
  exampleKey: keyof typeof readingGoalExamples | null;
  duration: number | null;
  rangeStartVerse: string | null;
  rangeEndVerse: string | null;
}

type ReadingGoalAction =
  | {
      type: 'SET_PERIOD';
      payload: {
        period: ReadingGoalState['period'];
      };
    }
  | {
      type: 'SET_TYPE';
      payload: {
        type: ReadingGoalState['type'];
      };
    }
  | {
      type: 'SET_PAGES';
      payload: {
        pages: ReadingGoalState['pages'];
      };
    }
  | {
      type: 'SET_SECONDS';
      payload: {
        seconds: ReadingGoalState['seconds'];
      };
    }
  | {
      type: 'SET_DURATION';
      payload: {
        duration: ReadingGoalState['duration'];
      };
    }
  | {
      type: 'SET_RANGE';
      payload:
        | {
            startVerse: ReadingGoalState['rangeStartVerse'];
            endVerse: ReadingGoalState['rangeEndVerse'];
          }
        | {
            startVerse: NonNullable<ReadingGoalState['rangeStartVerse']>;
            endVerse: NonNullable<ReadingGoalState['rangeEndVerse']>;
          };
    }
  | {
      type: 'SET_EXAMPLE';
      payload: {
        exampleKey: NonNullable<ReadingGoalState['exampleKey']>;
      };
    };

const reducer = (state: ReadingGoalState, action: ReadingGoalAction): ReadingGoalState => {
  switch (action.type) {
    case 'SET_PERIOD':
      return {
        ...state,
        duration: action.payload.period === ReadingGoalPeriod.Continuous ? 30 : null,
        period: action.payload.period,
      };
    case 'SET_TYPE':
      return {
        ...state,
        type: action.payload.type,
      };
    case 'SET_PAGES':
      return {
        ...state,
        pages: action.payload.pages,
      };
    case 'SET_SECONDS':
      return {
        ...state,
        seconds: action.payload.seconds,
      };
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload.duration,
        period: action.payload.duration ? ReadingGoalPeriod.Continuous : ReadingGoalPeriod.Daily,
      };
    case 'SET_RANGE':
      return {
        ...state,
        rangeStartVerse: action.payload.startVerse,
        rangeEndVerse: action.payload.endVerse,
      };
    case 'SET_EXAMPLE': {
      const example = readingGoalExamples[action.payload.exampleKey];
      let values = {};
      if ('values' in example) {
        values = { ...example.values };
      }

      return {
        ...state,
        exampleKey: action.payload.exampleKey,
        ...values,
      };
    }
    default:
      return state;
  }
};

export const readingGoalExamples = {
  time: {
    i18nKey: 'time',
    icon: ClockIcon,
    recommended: true,
    values: {
      type: ReadingGoalType.TIME,
      seconds: 10 * 60,
      period: ReadingGoalPeriod.Daily,
    },
  },
  khatm: {
    i18nKey: 'khatm',
    icon: BookIcon,
    values: {
      type: ReadingGoalType.RANGE,
      rangeStartVerse: '1:1',
      rangeEndVerse: '114:6',
      duration: 30,
      period: ReadingGoalPeriod.Continuous,
    },
  },
  custom: {
    i18nKey: 'custom',
    icon: SettingsIcon,
  },
} as const;

const initialState: ReadingGoalState = {
  period: ReadingGoalPeriod.Daily,
  type: ReadingGoalType.PAGES,
  exampleKey: null,
  pages: 1,
  seconds: 60,
  duration: null,
  rangeStartVerse: '1:1',
  rangeEndVerse: '114:6',
};

const useReadingGoalReducer = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return [state, dispatch] as const;
};

export interface ReadingGoalTabProps {
  onTabChange: Dispatch<SetStateAction<number>>;
  state: ReturnType<typeof useReadingGoalReducer>[0];
  dispatch: ReturnType<typeof useReadingGoalReducer>[1];
  nav: React.ReactNode;
  logTabEvent: (event: string) => void;
}

export default useReadingGoalReducer;
