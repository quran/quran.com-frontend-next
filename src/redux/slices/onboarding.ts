import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import OnboardingGroup from '@/types/OnboardingGroup';

type ActiveStepPayload = {
  group: OnboardingGroup;
  index: number;
  totalSteps?: number;
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
      const { group: groupKey, index, indicesToMarkAsCompleted, totalSteps } = action.payload;

      const group = state.completedGroups[groupKey];

      const newCompletedSteps = group?.completedSteps ? [...group.completedSteps] : [];
      if (!newCompletedSteps.includes(index)) {
        newCompletedSteps.push(index);
      }

      if (indicesToMarkAsCompleted) {
        indicesToMarkAsCompleted.forEach((stepIdx) => {
          if (!newCompletedSteps.includes(stepIdx)) {
            newCompletedSteps.push(stepIdx);
          }
        });
      }

      const newGroupData = {
        completedSteps: newCompletedSteps,
        isCompleted: totalSteps ? newCompletedSteps.length === totalSteps : group?.isCompleted,
      };

      return {
        ...state,
        activeStep: action.payload,
        completedGroups: {
          ...state.completedGroups,
          [groupKey]: newGroupData,
        },
      };
    },
  },
});

export const { dismissChecklist, setIsChecklistVisible, setActiveStepIndex } =
  onboardingSlice.actions;

export const selectOnboarding = (state: RootState) => state.onboarding;
export const selectOnboardingActiveStep = (state: RootState) => state.onboarding.activeStep;

export default onboardingSlice.reducer;
