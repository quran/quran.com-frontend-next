/* eslint-disable max-lines */
import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Step, TooltipRenderProps } from 'react-joyride';

import useHandleOnboardingEvents from '../OnboardingChecklist/hooks/useHandleOnboardingEvents';

import styles from './OnboardingStep.module.scss';

// eslint-disable-next-line import/no-cycle
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import OnboardingGroup from '@/types/OnboardingGroup';
import { isLoggedIn } from '@/utils/auth/login';
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
  backProps,
  isLastStep,
  index,
  step: { showSkipButton = true, showNextButton = true, showPrevButton = true },
}: OnboardingStepProps) => {
  const { t } = useTranslation('onboarding');
  const isFirstStep = index === 0;
  const { activeStepGroup, allSteps } = useOnboarding();

  const { beforePrev, beforeNext, beforeSkip } = useHandleOnboardingEvents({
    group: activeStepGroup,
    index,
    isLastStep,
  });

  const stepData = useMemo(() => {
    // show all but the first step (login button)
    if (activeStepGroup === OnboardingGroup.PERSONALIZED_FEATURES && isLoggedIn()) {
      return allSteps[activeStepGroup].slice(1)[index];
    }

    return allSteps[activeStepGroup][index];
  }, [activeStepGroup, allSteps, index]);

  const handleSkipClick = (e) => {
    logButtonClick('onboarding_step_skip', {
      group: activeStepGroup,
      step: index,
    });

    const result = beforeSkip();
    if (result.automaticallyProceed !== false) {
      if (result.delay) {
        setTimeout(() => {
          skipProps.onClick(e);
        }, result.delay);
      } else {
        skipProps.onClick(e);
      }
    }
  };

  const handlePrevClick = (e) => {
    logButtonClick('onboarding_step_previous', {
      group: activeStepGroup,
      step: index,
    });

    const result = beforePrev();
    if (result.automaticallyProceed !== false) {
      if (result?.delay) {
        setTimeout(() => {
          backProps.onClick(e);
        }, result.delay);
      } else {
        backProps.onClick(e);
      }
    }
  };

  const handleNextClick = (e) => {
    if (isLastStep) {
      logButtonClick('onboarding_step_finish', {
        group: activeStepGroup,
      });
    } else {
      logButtonClick('onboarding_step_next', {
        group: activeStepGroup,
        step: index,
      });
    }

    const result = beforeNext();
    if (result.automaticallyProceed !== false) {
      if (result?.delay) {
        setTimeout(() => {
          primaryProps.onClick(e);
        }, result.delay);
      } else {
        primaryProps.onClick(e);
      }
    }
  };

  return (
    <div ref={tooltipProps.ref} className={styles.tooltipContainer}>
      <h4 className={styles.title}>{stepData.title}</h4>
      <p className={styles.description}>{stepData.description}</p>

      {(showSkipButton || showNextButton || showPrevButton) && (
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
              {isLastStep ? t('finish') : t('common:next')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OnboardingStep;
