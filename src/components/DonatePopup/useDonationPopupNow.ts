import { useEffect, useState } from 'react';

import { getNextDonationPopupReevaluationMs } from './utils';

import { DonationPopupState } from '@/redux/slices/fundraisingBanner';

const useDonationPopupNow = (popupState: DonationPopupState) => {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { hiddenUntilMs, permanentlyDismissed } = popupState;

  useEffect(() => {
    const nextReevaluationMs = getNextDonationPopupReevaluationMs(popupState, nowMs);
    if (!nextReevaluationMs) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNowMs(Date.now());
    }, Math.max(nextReevaluationMs - nowMs, 0));

    return () => window.clearTimeout(timeoutId);
  }, [hiddenUntilMs, nowMs, permanentlyDismissed, popupState]);

  return nowMs;
};

export default useDonationPopupNow;
