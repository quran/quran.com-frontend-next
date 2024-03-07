import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import { selectOnboarding, setIsChecklistVisible } from '@/redux/slices/onboarding';
import { logEvent } from '@/utils/eventLogger';

const SHOW_CHECKLIST_INTERVAL = 1000 * 60 * 60 * 24 * 30; // 1 month
const MAX_CHECKLIST_DISMISSALS = 3;

const useShowChecklistAfterInterval = () => {
  const dispatch = useDispatch();
  const { allGroups } = useOnboarding();
  const { isChecklistVisible, checklistDismissals, lastChecklistDismissal, completedGroups } =
    useSelector(selectOnboarding);

  useEffect(() => {
    // If the user didn’t finish onboarding then we should show the onboarding again after 1 month from the last time. Repeat this behaviuor for 3 months (once per month) and finally, the system should not alert the user anymore for this onboarding.
    const isOnboardingNotFinished = !!allGroups.find(
      (group) => !completedGroups[group] || !completedGroups[group].isCompleted,
    );

    if (
      checklistDismissals >= MAX_CHECKLIST_DISMISSALS ||
      isChecklistVisible ||
      !lastChecklistDismissal ||
      !isOnboardingNotFinished
    ) {
      return;
    }

    const now = Date.now();

    const lastDismissal = new Date(lastChecklistDismissal);

    // invalid date
    if (Number.isNaN(lastDismissal.getTime())) {
      return;
    }

    if (now - lastDismissal.getTime() > SHOW_CHECKLIST_INTERVAL) {
      dispatch(setIsChecklistVisible(true));
      logEvent('onboarding_checklist_auto_open', {
        totalDismissals: checklistDismissals,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedGroups, checklistDismissals, lastChecklistDismissal]);
};

export default useShowChecklistAfterInterval;
