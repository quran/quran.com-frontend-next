/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it, vi } from 'vitest';

import {
  DONATION_POPUP_HIDE_DURATION_MS,
  getDonationPopupCutoffMs,
  getNextDonationPopupMidnightMs,
  getNextDonationPopupReevaluationMs,
  isDonationPopupSuppressed,
  shouldShowDonationPopup,
} from './utils';

import { DonationPopupState } from '@/redux/slices/fundraisingBanner';

describe('DonatePopup utils', () => {
  const defaultPopupState: DonationPopupState = {
    hiddenUntilMs: null,
    permanentlyDismissed: false,
  };

  it('shows the popup before March 20, 2026 on eligible routes', () => {
    const nowMs = new Date(2026, 2, 19, 23, 59, 59).getTime();

    expect(
      shouldShowDonationPopup({
        nowMs,
        isAuthPage: false,
        isEmbedPage: false,
        popupState: defaultPopupState,
      }),
    ).toBe(true);
  });

  it('hides the popup exactly when the local date becomes March 20, 2026', () => {
    const cutoffMs = getDonationPopupCutoffMs();

    expect(
      shouldShowDonationPopup({
        nowMs: cutoffMs,
        isAuthPage: false,
        isEmbedPage: false,
        popupState: defaultPopupState,
      }),
    ).toBe(false);
  });

  it('shows the popup again once the 24 hour suppression expires', () => {
    const nowMs = new Date(2026, 2, 10, 12, 0, 0).getTime();
    const popupState: DonationPopupState = {
      hiddenUntilMs: nowMs + DONATION_POPUP_HIDE_DURATION_MS,
      permanentlyDismissed: false,
    };

    expect(isDonationPopupSuppressed(popupState, nowMs)).toBe(true);
    expect(
      shouldShowDonationPopup({
        nowMs,
        isAuthPage: false,
        isEmbedPage: false,
        popupState,
      }),
    ).toBe(false);
    expect(isDonationPopupSuppressed(popupState, popupState.hiddenUntilMs!)).toBe(false);
    expect(
      shouldShowDonationPopup({
        nowMs: popupState.hiddenUntilMs!,
        isAuthPage: false,
        isEmbedPage: false,
        popupState,
      }),
    ).toBe(true);
  });

  it('keeps the popup hidden when permanently dismissed', () => {
    expect(
      shouldShowDonationPopup({
        nowMs: new Date(2026, 2, 10).getTime(),
        isAuthPage: false,
        isEmbedPage: false,
        popupState: {
          hiddenUntilMs: null,
          permanentlyDismissed: true,
        },
      }),
    ).toBe(false);
  });

  it('returns the next reevaluation boundary from suppression expiry or cutoff', () => {
    const nowMs = new Date(2026, 2, 10, 8, 0, 0).getTime();
    const hiddenUntilMs = nowMs + DONATION_POPUP_HIDE_DURATION_MS;
    const nextMidnightMs = getNextDonationPopupMidnightMs(nowMs);

    expect(
      getNextDonationPopupReevaluationMs(
        {
          hiddenUntilMs,
          permanentlyDismissed: false,
        },
        nowMs,
      ),
    ).toBe(nextMidnightMs);

    expect(getNextDonationPopupReevaluationMs(defaultPopupState, nowMs)).toBe(nextMidnightMs);

    expect(nextMidnightMs).toBeLessThan(hiddenUntilMs);
    expect(nextMidnightMs).toBeLessThan(getDonationPopupCutoffMs());
  });

  it('does not depend on the real clock for suppression checks', () => {
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234);

    expect(
      isDonationPopupSuppressed({
        hiddenUntilMs: 1235,
        permanentlyDismissed: false,
      }),
    ).toBe(true);

    dateNowSpy.mockRestore();
  });
});
