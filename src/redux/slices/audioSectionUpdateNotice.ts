import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export const initialState = {
  isVisible: true,
};

export const audioSectionUpdateNoticeSlice = createSlice({
  name: SliceName.AUDIO_SECTION_UPDATE_NOTICE,
  initialState,
  reducers: {
    setIsVisible: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
  },
});

export const selectAudioSectionUpdateNotice = (state: RootState) => state.audioSectionUpdateNotice;
export const { setIsVisible } = audioSectionUpdateNoticeSlice.actions;
export default audioSectionUpdateNoticeSlice.reducer;
