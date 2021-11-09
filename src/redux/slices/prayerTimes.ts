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

export const initialState = {
  calculationMethod: CalculationMethod.MuslimWorldLeague,
  madhab: Madhab.Shafi,
};

const prayerTimes = createSlice({
  name: 'prayerTimes',
  initialState,
  reducers: {
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
export const { setCalculationMethod, setMadhab } = prayerTimes.actions;
export default prayerTimes.reducer;
