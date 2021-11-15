import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

export enum CalculationMethod {
  MuslimWorldLeague = 'MuslimWorldLeague',
  Egyptian = 'Egyptian',
  Karachi = 'Karachi',
  UmmAlQura = 'UmmAlQura',
  Dubai = 'Dubai',
  Qatar = 'Qatark',
  Kuwait = 'Kuwait',
  MoonsightingCommittee = 'MoonsightingCommittee',
  Singapore = 'Singapore',
  Turkey = 'Turkey',
  Tehran = 'Tehran',
  NorthAmerica = 'NorthAmerica',
}

export enum Madhab {
  Shafi = 'Shafi',
  Hanafi = 'Hanafi',
}

type GeoLocation = {
  latitude: number;
  longitude: number;
};

export enum GeoPermission {
  Granted = 'granted',
  Denied = 'denied',
  Undetermined = 'Undetermined',
}

export const initialState = {
  calculationMethod: CalculationMethod.MuslimWorldLeague,
  madhab: Madhab.Shafi,
  geoLocation: null as GeoLocation,
  geoPermission: GeoPermission.Undetermined,
};

const prayerTimes = createSlice({
  name: 'prayerTimes',
  initialState,
  reducers: {
    setGeoLocation: (state, action: PayloadAction<GeoLocation>) => ({
      ...state,
      geoLocation: action.payload,
      geoPermission: GeoPermission.Granted,
    }),
    setGeoPermission: (state, action: PayloadAction<GeoPermission>) => ({
      ...state,
      geoPermission: action.payload,
    }),
    setCalculationMethod: (state, action: PayloadAction<CalculationMethod>) => ({
      ...state,
      calculationMethod: action.payload,
    }),
    setMadhab: (state, action: PayloadAction<Madhab>) => ({
      ...state,
      madhab: action.payload,
    }),
  },
});

export const selectCalculationMethod = (state: RootState) => state.prayerTimes.calculationMethod;
export const selectMadhab = (state: RootState) => state.prayerTimes.madhab;
export const selectGeoLocation = (state: RootState) => state.prayerTimes.geoLocation;
export const selectGeoPermission = (state: RootState) => state.prayerTimes.geoPermission;
export const { setCalculationMethod, setMadhab, setGeoLocation, setGeoPermission } =
  prayerTimes.actions;
export default prayerTimes.reducer;
