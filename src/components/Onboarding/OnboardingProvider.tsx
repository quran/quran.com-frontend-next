import React, { useMemo, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Joyride from 'react-joyride';
import { useSelector, useDispatch } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import OnboardingStep from './OnboardingStep';
import { checklistIndexToOnboardingSteps } from './steps';

import { selectOnboarding, setActiveStepIndex } from '@/redux/slices/onboarding';
import OnboardingGroup from '@/types/OnboardingGroup';

interface OnboardingContextType {
  startTour: (group?: OnboardingGroup) => void;
  stopTour: () => void;
  setStep: (group: OnboardingGroup, index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  activeStepGroup: OnboardingGroup;
  activeStepIndex: number;
  isActive: boolean;
  allSteps: ReturnType<typeof checklistIndexToOnboardingSteps>;
}

const OnboardingContext = React.createContext<OnboardingContextType>(null);

export const useOnboarding = () => React.useContext(OnboardingContext);

export const OnboardingProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const [isOnboarding, setIsOnboarding] = React.useState(false);
  const { activeStep } = useSelector(selectOnboarding);
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const startTour = useCallback(
    (group = OnboardingGroup.HOMEPAGE) => {
      setIsOnboarding(true);

      setTimeout(() => {
        dispatch(
          setActiveStepIndex({
            group,
            index: 0,
          }),
        );
      }, 0);
    },
    [dispatch],
  );

  const stopTour = useCallback(() => {
    setTimeout(() => {
      setIsOnboarding(false);
    }, 0);
  }, []);

  const setStep = useCallback(
    (group: OnboardingGroup, step: number) => {
      setTimeout(() => dispatch(setActiveStepIndex({ group, index: step })), 0);
    },
    [dispatch],
  );

  const nextStep = useCallback(() => {
    setStep(activeStep.group, activeStep.index + 1);
  }, [activeStep, setStep]);

  const prevStep = useCallback(() => {
    if (activeStep.index === 0) return;

    setStep(activeStep.group, activeStep.index - 1);
  }, [activeStep, setStep]);

  const allSteps = useMemo(() => {
    return checklistIndexToOnboardingSteps(t, OnboardingStep);
  }, [t]);

  const value = useMemo(
    () => ({
      startTour,
      stopTour,
      activeStepGroup: activeStep.group,
      activeStepIndex: activeStep.index,
      setStep,
      isActive: isOnboarding,
      nextStep,
      prevStep,
      allSteps,
    }),
    [startTour, stopTour, setStep, activeStep, isOnboarding, nextStep, prevStep, allSteps],
  );

  const steps = useMemo(() => {
    return allSteps[activeStep.group].map((s) => s.step);
  }, [allSteps, activeStep.group]);

  const hasSteps = steps.length > 0;
  const shouldRun = isOnboarding && hasSteps;

  return (
    <OnboardingContext.Provider value={value}>
      {shouldRun && (
        <Joyride
          run
          stepIndex={activeStep.index}
          steps={steps as any}
          continuous
          scrollOffset={100}
          // showSkipButton
          disableOverlayClose
          disableCloseOnEsc
          scrollToFirstStep
          disableOverlay={false}
          // beaconComponent={null}
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
      )}
      {children}
    </OnboardingContext.Provider>
  );
});
