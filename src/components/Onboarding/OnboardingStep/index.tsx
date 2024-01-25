/* eslint-disable max-lines */
import useTranslation from 'next-translate/useTranslation';
import { Step, TooltipRenderProps } from 'react-joyride';
import { useDispatch } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import { useOnboarding } from '../OnboardingProvider';

import styles from './OnboardingStep.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { setIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import OnboardingGroup from '@/types/OnboardingGroup';
import { logButtonClick } from '@/utils/eventLogger';

type OnboardingStepProps = TooltipRenderProps & {
  step: Step & {
    showNextButton?: boolean;
    showPrevButton?: boolean;
  };
};

const OnboardingStep = ({
  tooltipProps,
  primaryProps,
  skipProps,
  isLastStep,
  index,
  step: { showSkipButton = true, showNextButton = true, showPrevButton = true },
}: OnboardingStepProps) => {
  const { t } = useTranslation('onboarding');
  const isFirstStep = index === 0;
  const { stopTour, activeStepGroup, nextStep, prevStep, allSteps } = useOnboarding();
  const dispatch = useDispatch();

  const stepData = allSteps[activeStepGroup][index];

  const handleSkipClick = () => {
    logButtonClick('onboarding_step_skip', {
      group: activeStepGroup,
      step: index,
    });
    stopTour();
  };

  const handlePrevClick = () => {
    logButtonClick('onboarding_step_previous', {
      group: activeStepGroup,
      step: index,
    });
    if (activeStepGroup === OnboardingGroup.SETTINGS && index === 1) {
      // close sidebar
      dispatch(setIsSettingsDrawerOpen(false));
    }

    setTimeout(() => {
      prevStep();
    }, 400);
  };

  const handleNextClick = () => {
    if (isLastStep) {
      logButtonClick('onboarding_step_finish', {
        group: activeStepGroup,
      });
      stopTour();

      if (activeStepGroup === OnboardingGroup.SETTINGS) {
        // close sidebar
        dispatch(setIsSettingsDrawerOpen(false));
      }

      return;
    }

    logButtonClick('onboarding_step_next', {
      group: activeStepGroup,
      step: index,
    });
    nextStep();
  };

  return (
    <div ref={tooltipProps.ref} className={styles.tooltipContainer}>
      <h4 className={styles.title}>{stepData.title}</h4>
      <p className={styles.description}>{stepData.description}</p>

      {(showSkipButton || showNextButton) && (
        <div className={styles.actionContainer}>
          {isFirstStep && showSkipButton && (
            <Button
              {...skipProps}
              onClick={handleSkipClick}
              variant={ButtonVariant.Ghost}
              type={ButtonType.Inverse}
              size={ButtonSize.Small}
            >
              {t('skip')}
            </Button>
          )}

          {!isFirstStep && showPrevButton && (
            <Button
              variant={ButtonVariant.Outlined}
              type={ButtonType.Inverse}
              size={ButtonSize.Small}
              onClick={handlePrevClick}
              prefix={<ChevronLeftIcon className={styles.icon} />}
            >
              {t('previous')}
            </Button>
          )}

          {showNextButton && (
            <Button
              {...primaryProps}
              variant={ButtonVariant.Outlined}
              type={ButtonType.Inverse}
              size={ButtonSize.Small}
              onClick={handleNextClick}
              suffix={isLastStep ? null : <ChevronRightIcon className={styles.icon} />}
            >
              {isLastStep ? t('finish') : t('next')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OnboardingStep;
