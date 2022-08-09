import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import sample from 'lodash/sample';

import curatedStations from 'src/components/Radio/curatedStations';
import { StationState, StationType } from 'src/components/Radio/types';
import resetSettings from 'src/redux/actions/reset-settings';
import { RootState } from 'src/redux/RootState';
import SliceName from 'src/redux/types/SliceName';

const POPULAR_STATION_ID = '1';
const popularStation = curatedStations[POPULAR_STATION_ID];
const randomAudioTrack = sample(popularStation.audioTracks);
const initialState: StationState = {
  id: POPULAR_STATION_ID,
  type: StationType.Curated,
  chapterId: randomAudioTrack.chapterId,
  reciterId: randomAudioTrack.reciterId,
};

export const radioSlice = createSlice({
  name: SliceName.RADIO,
  initialState,
  reducers: {
    setRadioStationState: (state, action: PayloadAction<StationState>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetSettings, () => {
      return initialState;
    });
  },
});

export const { setRadioStationState } = radioSlice.actions;

export const selectRadioStation = (state: RootState) => state.radio;

export default radioSlice.reducer;
