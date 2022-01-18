import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StationState } from 'src/components/Radio/types';
import { RootState } from 'src/redux/RootState';

const initialState = {} as StationState;

export const radioStation = createSlice({
  name: 'radioStation',
  initialState,
  reducers: {
    exitRadioMode: () => initialState,
    setRadioStationState: (state, action: PayloadAction<StationState>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { setRadioStationState, exitRadioMode } = radioStation.actions;

export const selectRadioStation = (state: RootState) => state.radioStation;

// taking one of the property as indicator, if `type` is empty that mean we're not in radio mode
export const selectIsInRadioMode = (state: RootState) => !!state.radioStation?.type;

export default radioStation.reducer;
