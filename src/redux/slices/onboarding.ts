import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import OnboardingGroup from '@/types/OnboardingGroup';

type ActiveStepPayload = {
  group: OnboardingGroup;
  index: number;
  isGroupCompleted?: boolean;
  indicesToMarkAsCompleted?: number[];
};

export type OnboardingState = {
  isChecklistVisible: boolean;
  checklistDismissals: number;
  lastChecklistDismissal: number | null;
  activeStep: ActiveStepPayload;
  completedGroups: Partial<
    Record<
      OnboardingGroup,
      {
        isCompleted: boolean;
        completedSteps: number[];
      }
    >
  >;
};

const initialState: OnboardingState = {
  isChecklistVisible: true,
  checklistDismissals: 0,
  lastChecklistDismissal: null,
  activeStep: {
    group: OnboardingGroup.HOMEPAGE,
    index: 0,
  },
  completedGroups: {},
};

export const onboardingSlice = createSlice({
  name: SliceName.ONBOARDING,
  initialState,
  reducers: {
    // checklist state
    dismissChecklist: (state: OnboardingState) => ({
      ...state,
      isChecklistVisible: false,
      checklistDismissals: state.checklistDismissals + 1,
      lastChecklistDismissal: new Date().getTime(),
    }),
    setIsChecklistVisible: (state: OnboardingState, action: PayloadAction<boolean>) => ({
      ...state,
      isChecklistVisible: action.payload,
    }),
    setActiveStepIndex: (state: OnboardingState, action: PayloadAction<ActiveStepPayload>) => {
      const group = state.completedGroups[action.payload.group];

      const newCompletedSteps = group?.completedSteps ? [...group.completedSteps] : [];
      if (!newCompletedSteps.includes(action.payload.index)) {
        newCompletedSteps.push(action.payload.index);
      }

      if (action.payload.indicesToMarkAsCompleted) {
        action.payload.indicesToMarkAsCompleted.forEach((index) => {
          if (!newCompletedSteps.includes(index)) {
            newCompletedSteps.push(index);
          }
        });
      }

      const newGroupData = {
        completedSteps: newCompletedSteps,
        isCompleted: action.payload.isGroupCompleted ?? group?.isCompleted,
      };

      return {
        ...state,
        activeStep: action.payload,
        completedGroups: {
          ...state.completedGroups,
          [action.payload.group]: newGroupData,
        },
      };
    },
  },
});

export const { dismissChecklist, setIsChecklistVisible, setActiveStepIndex } =
  onboardingSlice.actions;

export const selectOnboarding = (state: RootState) => state.onboarding;

export default onboardingSlice.reducer;
