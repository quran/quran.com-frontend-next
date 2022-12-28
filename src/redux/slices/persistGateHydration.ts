import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type PersistGateHydrationState = {
  isPersistGateHydrationInProgress: boolean;
  isPersistGateHydrationComplete: boolean;
};

const initialState: PersistGateHydrationState = {
  isPersistGateHydrationInProgress: false,
  isPersistGateHydrationComplete: false,
};

// This slice checks if redux-persist has finished hydrating the store.
// Hydration happens a bit after the page loads, useful for preventing
// the animations until the state is settled in.
export const persistGateHydrationSlice = createSlice({
  name: SliceName.PERSIST_GATE_HYDRATION,
  initialState,
  reducers: {
    setIsPersistGateHydrationInProgress: (
      state: PersistGateHydrationState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      isPersistGateHydrationInProgress: action.payload,
    }),
    setIsPersistGateHydrationComplete: (
      state: PersistGateHydrationState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      isPersistGateHydrationComplete: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state: PersistGateHydrationState) => {
      return {
        ...state,
        isPersistGateHydrationInProgress: true,
      };
    });
  },
});

export const { setIsPersistGateHydrationInProgress, setIsPersistGateHydrationComplete } =
  persistGateHydrationSlice.actions;

export const selectIsPersistGateHydrationInProgress = (state: RootState) =>
  state.persistGateHydration.isPersistGateHydrationInProgress;
export const selectIsPersistGateHydrationComplete = (state: RootState) =>
  state.persistGateHydration.isPersistGateHydrationComplete;

export default persistGateHydrationSlice.reducer;
