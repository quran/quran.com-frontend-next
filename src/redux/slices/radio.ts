import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StationState } from 'src/components/Radio/types';
import { RootState } from 'src/redux/RootState';

const initialState = {} as StationState;

export const radioSlice = createSlice({
  name: 'radio',
  initialState,
  reducers: {
    setRadioStationState: (state, action: PayloadAction<StationState>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { setRadioStationState } = radioSlice.actions;

export const selectRadioStation = (state: RootState) => state.radio;

export default radioSlice.reducer;
