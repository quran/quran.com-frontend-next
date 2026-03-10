import { DonationPopupState } from '@/redux/slices/fundraisingBanner';

export const DONATION_POPUP_HIDE_DURATION_MS = 24 * 60 * 60 * 1000;
export const RAMADAN_DONATION_POPUP_CUTOFF_DATE = {
  year: 2026,
  monthIndex: 2,
  day: 20,
} as const;

type DonationPopupEligibilityInput = {
  nowMs?: number;
  isAuthPage: boolean;
  isEmbedPage: boolean;
  popupState: DonationPopupState;
};

export const getDonationPopupCutoffMs = (): number =>
  new Date(
    RAMADAN_DONATION_POPUP_CUTOFF_DATE.year,
    RAMADAN_DONATION_POPUP_CUTOFF_DATE.monthIndex,
    RAMADAN_DONATION_POPUP_CUTOFF_DATE.day,
  ).getTime();

export const getNextDonationPopupMidnightMs = (nowMs: number = Date.now()): number => {
  const nextMidnight = new Date(nowMs);
  nextMidnight.setHours(24, 0, 0, 0);

  return nextMidnight.getTime();
};

export const isDonationPopupRouteEligible = ({
  isAuthPage,
  isEmbedPage,
}: Pick<DonationPopupEligibilityInput, 'isAuthPage' | 'isEmbedPage'>): boolean =>
  !isAuthPage && !isEmbedPage;

export const isDonationPopupSuppressed = (
  popupState: DonationPopupState,
  nowMs: number = Date.now(),
): boolean => {
  if (popupState.permanentlyDismissed) {
    return true;
  }

  return popupState.hiddenUntilMs !== null && popupState.hiddenUntilMs > nowMs;
};

export const shouldShowDonationPopup = ({
  nowMs = Date.now(),
  isAuthPage,
  isEmbedPage,
  popupState,
}: DonationPopupEligibilityInput): boolean => {
  if (!isDonationPopupRouteEligible({ isAuthPage, isEmbedPage })) {
    return false;
  }

  if (nowMs >= getDonationPopupCutoffMs()) {
    return false;
  }

  return !isDonationPopupSuppressed(popupState, nowMs);
};

export const getNextDonationPopupReevaluationMs = (
  popupState: DonationPopupState,
  nowMs: number = Date.now(),
): number | null => {
  const futureBoundaries = [getDonationPopupCutoffMs(), getNextDonationPopupMidnightMs(nowMs)];

  if (popupState.hiddenUntilMs && popupState.hiddenUntilMs > nowMs) {
    futureBoundaries.push(popupState.hiddenUntilMs);
  }

  const nextBoundary = futureBoundaries.filter((value) => value > nowMs).sort((a, b) => a - b)[0];

  return nextBoundary ?? null;
};
