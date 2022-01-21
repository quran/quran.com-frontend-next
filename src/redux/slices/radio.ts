import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import sample from 'lodash/sample';

import resetSettings from './reset-settings';

import curatedStations from 'src/components/Radio/curatedStations';
import { StationState, StationType } from 'src/components/Radio/types';
import { RootState } from 'src/redux/RootState';

const POPULAR_STATION_ID = '1';
const popularStation = curatedStations[POPULAR_STATION_ID];
const randomAudioTrack = sample(popularStation.audioTracks);
const initialState = {
  id: POPULAR_STATION_ID,
  type: StationType.Curated,
  title: popularStation.title,
  description: popularStation.description,
  chapterId: randomAudioTrack.chapterId,
  reciterId: randomAudioTrack.reciterId,
} as StationState;

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
  extraReducers: (builder) => {
    builder.addCase(resetSettings, () => {
      return initialState;
    });
  },
});

export const { setRadioStationState } = radioSlice.actions;

export const selectRadioStation = (state: RootState) => state.radio;

export default radioSlice.reducer;
