import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type MicrophoneState = {
  isActive: boolean;
};

const initialState: MicrophoneState = {
  isActive: false,
};

const microphoneSlice = createSlice({
  name: SliceName.MICROPHONE,
  initialState,
  reducers: {
    setMicrophoneActive: (state: MicrophoneState, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isActive: action.payload,
      };
    },
    stopMicrophone: (state: MicrophoneState) => {
      return {
        ...state,
        isActive: false,
      };
    },
  },
});

// Export actions
export const { setMicrophoneActive, stopMicrophone } = microphoneSlice.actions;

// Export selectors
export const selectMicrophoneActive = (state: RootState) => state.microphone.isActive;

export default microphoneSlice.reducer;
