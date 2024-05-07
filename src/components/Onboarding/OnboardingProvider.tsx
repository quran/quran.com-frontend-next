/* eslint-disable max-lines */
import React, { useMemo, useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { ACTIONS, Callback, EVENTS, STATUS, StoreHelpers } from 'react-joyride';
import { useSelector, useDispatch } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import OnboardingStep from './OnboardingStep';
import { checklistIndexToOnboardingSteps } from './steps';

import useScrollToTop from '@/hooks/useScrollToTop';
import { selectOnboardingActiveStep, setActiveStepIndex } from '@/redux/slices/onboarding';
import OnboardingGroup from '@/types/OnboardingGroup';
import { isLoggedIn } from '@/utils/auth/login';

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });
interface OnboardingContextType {
  startTour: (group?: OnboardingGroup, startIndex?: number) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  activeStepGroup: OnboardingGroup;
  activeStepIndex: number;
  isActive: boolean;
  allSteps: ReturnType<typeof checklistIndexToOnboardingSteps>;
  allGroups: OnboardingGroup[];
}

const OnboardingContext = React.createContext<OnboardingContextType>(null);

export const useOnboarding = () => React.useContext(OnboardingContext);

export const OnboardingProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const [isOnboarding, setIsOnboarding] = React.useState(false);
  const activeStep = useSelector(selectOnboardingActiveStep);
  const [joyride, setJoyride] = useState<StoreHelpers>();
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const scrollToTop = useScrollToTop();

  const allSteps = useMemo(() => {
    return checklistIndexToOnboardingSteps(t, OnboardingStep);
  }, [t]);

  const startTour = useCallback(
    (group = OnboardingGroup.HOMEPAGE, startIndex = 0) => {
      const statePayload = setActiveStepIndex({
        group,
        index: startIndex,
        // Mark all previous steps as completed
        ...(startIndex !== 0 && {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          indicesToMarkAsCompleted: new Array(startIndex).fill(null).map((_, i) => i),
        }),
      });

      if (group === OnboardingGroup.SETTINGS || group === OnboardingGroup.READING_EXPERIENCE) {
        scrollToTop();
        setTimeout(() => {
          setIsOnboarding(true);
          dispatch(statePayload);
        }, 400);
      } else {
        setIsOnboarding(true);
        dispatch(statePayload);
      }
    },
    [dispatch, scrollToTop],
  );

  const stopTour = useCallback(() => {
    setIsOnboarding(false);
  }, []);

  const setStep = useCallback(
    (group: OnboardingGroup, step: number) => {
      let totalSteps = allSteps[group].length;
      if (isLoggedIn() && group === OnboardingGroup.PERSONALIZED_FEATURES) {
        // don't count the first step (login button)
        totalSteps -= 1;
      }
      dispatch(setActiveStepIndex({ group, index: step, totalSteps }));
    },
    [dispatch, allSteps],
  );

  const nextStep = useCallback(() => {
    setStep(activeStep.group, activeStep.index + 1);
  }, [activeStep, setStep]);

  const prevStep = useCallback(() => {
    if (activeStep.index === 0) return;

    setStep(activeStep.group, activeStep.index - 1);
  }, [activeStep, setStep]);

  const steps = useMemo(() => {
    const result = allSteps[activeStep.group].map((s) => s.step);
    if (activeStep.group === OnboardingGroup.PERSONALIZED_FEATURES) {
      if (isLoggedIn()) {
        // show all but the first step (login button)
        return result.slice(1);
      }

      // only show the first step (login button)
      return [result[0]];
    }
    return result;
  }, [allSteps, activeStep.group]);

  const hasSteps = steps.length > 0;
  const shouldRun = isOnboarding && hasSteps;

  const joyrideCallback: Callback = (data) => {
    const { action, status, type } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      if (action === ACTIONS.PREV) {
        prevStep();
      } else if (action === ACTIONS.NEXT) {
        if (activeStep.index < steps.length - 1) {
          nextStep();
        } else {
          stopTour();
          setStep(activeStep.group, 0);
        }
      }
    } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
      joyride.reset(true);
    }
  };

  const value = useMemo(
    () => ({
      startTour,
      stopTour: () => joyride.close(),
      nextStep: () => joyride.next(),
      prevStep: () => joyride.prev(),
      activeStepGroup: activeStep.group,
      activeStepIndex: activeStep.index,
      isActive: isOnboarding,
      allSteps,
      allGroups: Object.keys(allSteps) as OnboardingGroup[],
    }),
    [startTour, activeStep, isOnboarding, joyride, allSteps],
  );

  return (
    <OnboardingContext.Provider value={value}>
      <Joyride
        callback={joyrideCallback}
        key={activeStep.group}
        run={shouldRun}
        stepIndex={activeStep.index}
        steps={steps as any}
        continuous
        scrollOffset={130}
        getHelpers={setJoyride}
        disableOverlayClose
        disableCloseOnEsc
        scrollToFirstStep
        disableOverlay={false}
        floaterProps={{
          offset: 0,
          styles: {
            floaterWithAnimation: {
              transition: 'opacity .5s ease-out',
            },
            floater: {
              zIndex: 'var(--z-index-onboarding-step)' as any,
            },
          },
        }}
        styles={{
          spotlight: {
            borderRadius: 0,
            zIndex: 'var(--z-index-onboarding-spotlight)' as any,
          },
          overlay: {
            zIndex: 'var(--z-index-onboarding-overlay)' as any,
          },
        }}
      />
      {children}
    </OnboardingContext.Provider>
  );
});
