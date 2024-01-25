import { useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { useOnboarding } from '../OnboardingProvider';
import { onboardingChecklist } from '../steps';

import styles from './OnboardingChecklist.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CheckIcon from '@/icons/check.svg';
import IconClose from '@/icons/close.svg';
import IconQuestionMark from '@/icons/question-mark-icon.svg';
import {
  dismissChecklist,
  selectOnboarding,
  setIsChecklistVisible,
} from '@/redux/slices/onboarding';
import OnboardingGroup from '@/types/OnboardingGroup';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

const OnboardingChecklist = () => {
  const { t } = useTranslation('common');
  const checklistItems = onboardingChecklist(t);
  const router = useRouter();

  const dispatch = useDispatch();
  const { allSteps, startTour, isActive } = useOnboarding();
  const {
    isChecklistVisible,
    checklistDismissals,
    lastChecklistDismissal,
    groups: completedGroups,
  } = useSelector(selectOnboarding);

  const handleDismiss = () => {
    logButtonClick('onboarding_checklist_dismiss', { totalDismissals: checklistDismissals + 1 });
    dispatch(dismissChecklist({ countDismiss: true }));
  };

  const openChecklist = () => {
    logButtonClick('onboarding_checklist_open');
    dispatch(setIsChecklistVisible(true));
  };

  useEffect(() => {
    // If the user didn’t finish onboarding then we should show the onboarding again after 1 month from the last time. Repeat this behaviuor for 3 months (once per month) and finally, the system should not alert the user anymore for this onboarding.
    const didNotFinishOnboarding = !!checklistItems.find(({ group }) => {
      const completedSteps = completedGroups[group]?.completedSteps;
      return completedSteps?.length !== allSteps[group].length;
    });

    if (
      checklistDismissals >= 3 ||
      isChecklistVisible ||
      !lastChecklistDismissal ||
      !didNotFinishOnboarding
    ) {
      return;
    }

    const now = Date.now();
    const oneMonth = 1000 * 60 * 60 * 24 * 30;
    const lastDismissal = new Date(lastChecklistDismissal);

    if (now - lastDismissal.getTime() > oneMonth) {
      dispatch(setIsChecklistVisible(true));
      logEvent('onboarding_checklist_auto_open', {
        totalDismissals: checklistDismissals,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedGroups, checklistDismissals, lastChecklistDismissal]);

  // If the onboarding is active, don't show the checklist
  if (isActive) {
    return null;
  }

  if (!isChecklistVisible) {
    if (router.pathname === '/') {
      return (
        <Button
          shape={ButtonShape.Circle}
          className={classNames(styles.checklistPosition)}
          tooltip={t('onboarding:onboarding-checklist')}
          onClick={openChecklist}
          size={ButtonSize.Large}
        >
          <IconQuestionMark className={styles.helpIcon} />
        </Button>
      );
    }

    return null;
  }

  const handleChecklistItemClick = async (group: OnboardingGroup) => {
    const item = checklistItems.find((i) => i.group === group);
    if (!item) return;

    if (item.href) {
      await router.push(item.href);
      startTour(group);
    }

    logButtonClick('onboarding_checklist_item', {
      group,
    });
  };

  return (
    <div className={classNames(styles.checklist, styles.checklistPosition)}>
      <div className={styles.checklistHeader}>
        <h4>{t('onboarding:onboarding-checklist')}</h4>

        <Button
          tooltip={t('close')}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          ariaLabel={t('close')}
          size={ButtonSize.Small}
          onClick={handleDismiss}
        >
          <IconClose />
        </Button>
      </div>

      <ul>
        {checklistItems.map((item) => {
          const checked =
            completedGroups[item.group]?.completedSteps?.length === allSteps[item.group].length;

          return (
            <li key={item.group}>
              <button
                onClick={() => handleChecklistItemClick(item.group)}
                type="button"
                className={classNames(checked && styles.completed)}
              >
                <div className={classNames(styles.checkCircle, checked && styles.filled)}>
                  {checked ? <CheckIcon /> : null}
                </div>

                <p>{item.title}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OnboardingChecklist;
