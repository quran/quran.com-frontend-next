/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import reducer, {
  selectDonationPopupHiddenUntilMs,
  selectDonationPopupPermanentlyDismissed,
  selectDonationPopupState,
  setDonationPopupHiddenUntilMs,
  setDonationPopupPermanentlyDismissed,
  setIsHomepageBannerVisible,
} from './fundraisingBanner';

describe('fundraisingBanner slice', () => {
  it('updates homepage banner visibility', () => {
    const nextState = reducer(undefined, setIsHomepageBannerVisible(false));

    expect(nextState.isHomepageBannerVisible).toBe(false);
  });

  it('stores the popup temporary suppression timestamp', () => {
    const state = reducer(undefined, setDonationPopupHiddenUntilMs(12345));

    expect(state.donationPopup).toEqual({
      hiddenUntilMs: 12345,
      permanentlyDismissed: false,
    });
  });

  it('clears the temporary suppression when permanently dismissed', () => {
    const withHiddenUntil = reducer(undefined, setDonationPopupHiddenUntilMs(12345));
    const dismissed = reducer(withHiddenUntil, setDonationPopupPermanentlyDismissed(true));

    expect(dismissed.donationPopup).toEqual({
      hiddenUntilMs: null,
      permanentlyDismissed: true,
    });
  });

  it('exposes popup selectors from redux state', () => {
    const state = {
      fundraisingBanner: {
        isHomepageBannerVisible: true,
        donationPopup: {
          hiddenUntilMs: 999,
          permanentlyDismissed: true,
        },
      },
    } as any;

    expect(selectDonationPopupState(state)).toEqual({
      hiddenUntilMs: 999,
      permanentlyDismissed: true,
    });
    expect(selectDonationPopupHiddenUntilMs(state)).toBe(999);
    expect(selectDonationPopupPermanentlyDismissed(state)).toBe(true);
  });
});
