import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import OnboardingGroup from '@/types/OnboardingGroup';

type ActiveStepPayload = { group: OnboardingGroup; index: number };

export type OnboardingState = {
  isChecklistVisible: boolean;
  checklistDismissals: number;
  lastChecklistDismissal: Date | null;
  activeStep: ActiveStepPayload;
  groups: Partial<
    Record<
      OnboardingGroup,
      {
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
  groups: {},
};

export const onboardingSlice = createSlice({
  name: SliceName.ONBOARDING,
  initialState,
  reducers: {
    // checklist state
    dismissChecklist: (
      state: OnboardingState,
      action: PayloadAction<{ countDismiss: boolean }>,
    ) => ({
      ...state,
      isChecklistVisible: false,
      ...(action.payload.countDismiss && {
        checklistDismissals: state.checklistDismissals + 1,
        lastChecklistDismissal: new Date(),
      }),
    }),
    setIsChecklistVisible: (state: OnboardingState, action: PayloadAction<boolean>) => ({
      ...state,
      isChecklistVisible: action.payload,
    }),
    setActiveStepIndex: (state: OnboardingState, action: PayloadAction<ActiveStepPayload>) => {
      const group = state.groups[action.payload.group];

      const newCompletedSteps = group?.completedSteps ? [...group.completedSteps] : [];
      if (!newCompletedSteps.includes(action.payload.index)) {
        newCompletedSteps.push(action.payload.index);
      }

      const newGroupData = {
        completedSteps: newCompletedSteps,
      };

      return {
        ...state,
        activeStep: action.payload,
        groups: {
          ...state.groups,
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
