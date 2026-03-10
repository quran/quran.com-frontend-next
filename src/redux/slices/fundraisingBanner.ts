import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type DonationPopupState = {
  hiddenUntilMs: number | null;
  permanentlyDismissed: boolean;
};

export type FundraisingBannerState = {
  isHomepageBannerVisible: boolean;
  donationPopup: DonationPopupState;
};

const initialState: FundraisingBannerState = {
  isHomepageBannerVisible: true,
  donationPopup: {
    hiddenUntilMs: null,
    permanentlyDismissed: false,
  },
};

export const fundraisingBannerSlice = createSlice({
  name: SliceName.FUNDRAISING_BANNER,
  initialState,
  reducers: {
    setIsHomepageBannerVisible: (
      state: FundraisingBannerState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      isHomepageBannerVisible: action.payload,
    }),
    setDonationPopupHiddenUntilMs: (
      state: FundraisingBannerState,
      action: PayloadAction<number | null>,
    ) => ({
      ...state,
      donationPopup: {
        ...state.donationPopup,
        hiddenUntilMs: action.payload,
      },
    }),
    setDonationPopupPermanentlyDismissed: (
      state: FundraisingBannerState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      donationPopup: {
        hiddenUntilMs: action.payload ? null : state.donationPopup.hiddenUntilMs,
        permanentlyDismissed: action.payload,
      },
    }),
  },
});

export const {
  setIsHomepageBannerVisible,
  setDonationPopupHiddenUntilMs,
  setDonationPopupPermanentlyDismissed,
} = fundraisingBannerSlice.actions;

export const selectIsHomepageBannerVisible = (state: RootState) =>
  state.fundraisingBanner.isHomepageBannerVisible ?? true;

export const selectDonationPopupState = (state: RootState): DonationPopupState =>
  state.fundraisingBanner.donationPopup ?? initialState.donationPopup;

export const selectDonationPopupHiddenUntilMs = (state: RootState) =>
  selectDonationPopupState(state).hiddenUntilMs;

export const selectDonationPopupPermanentlyDismissed = (state: RootState) =>
  selectDonationPopupState(state).permanentlyDismissed;

export default fundraisingBannerSlice.reducer;
