import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StationState } from 'src/components/Radio/types';
import { RootState } from 'src/redux/RootState';

export const radioStation = createSlice({
  name: 'radioStation',
  initialState: {} as StationState,
  reducers: {
    setRadioStationState: (state, action: PayloadAction<StationState>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { setRadioStationState } = radioStation.actions;

export const selectRadioStation = (state: RootState) => state.radioStation;

export default radioStation.reducer;
