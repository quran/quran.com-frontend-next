import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type InitialState = {
  isSearchDrawerVoiceFlowStarted: boolean;
  isCommandBardVoiceFlowStarted: boolean;
};

export const initialState: InitialState = {
  isSearchDrawerVoiceFlowStarted: false,
  isCommandBardVoiceFlowStarted: false,
};

export const voiceSearchSlice = createSlice({
  name: SliceName.VOICE_SEARCH,
  initialState,
  reducers: {
    toggleIsSearchDrawerVoiceFlowStarted: (state) => ({
      ...state,
      isSearchDrawerVoiceFlowStarted: !state.isSearchDrawerVoiceFlowStarted,
    }),
    stopSearchDrawerVoiceFlow: (state) => ({
      ...state,
      isSearchDrawerVoiceFlowStarted: false,
    }),
    stopCommandBarVoiceFlow: (state) => ({
      ...state,
      isCommandBardVoiceFlowStarted: false,
    }),
    toggleIsCommandBarVoiceFlowStarted: (state) => ({
      ...state,
      isCommandBardVoiceFlowStarted: !state.isCommandBardVoiceFlowStarted,
    }),
  },
});

export const selectIsSearchDrawerVoiceFlowStarted = (state: RootState) =>
  state.voiceSearch.isSearchDrawerVoiceFlowStarted;
export const selectIsCommandBarVoiceFlowStarted = (state: RootState) =>
  state.voiceSearch.isCommandBardVoiceFlowStarted;
export const {
  toggleIsSearchDrawerVoiceFlowStarted,
  toggleIsCommandBarVoiceFlowStarted,
  stopSearchDrawerVoiceFlow,
  stopCommandBarVoiceFlow,
} = voiceSearchSlice.actions;
export default voiceSearchSlice.reducer;
