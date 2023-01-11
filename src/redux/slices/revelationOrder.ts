import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import syncUserPreferences from '../actions/sync-user-preferences';
import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';
import PreferenceGroup from '@/types/auth/PreferenceGroup';

type RevelationOrderState = {
  isReadingByRevelationOrder: boolean;
};

export const initialState: RevelationOrderState = {
  isReadingByRevelationOrder: false,
};

export const revelationOrderSlice = createSlice({
  name: SliceName.REVELATION_ORDER,
  initialState,
  reducers: {
    setIsReadingByRevelationOrder: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isReadingByRevelationOrder: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(syncUserPreferences, (state, action) => {
      const {
        payload: { userPreferences },
      } = action;
      const remoteReadingPreferences = userPreferences[
        PreferenceGroup.READING
      ] as RevelationOrderState;
      // if there are any reading preferences stored in the DB.
      if (remoteReadingPreferences) {
        return {
          ...state,
          isReadingByRevelationOrder: !!remoteReadingPreferences.isReadingByRevelationOrder,
        };
      }
      return state;
    });
  },
});

export const selectIsReadingByRevelationOrder = (state: RootState): boolean =>
  state.revelationOrder.isReadingByRevelationOrder;

export const { setIsReadingByRevelationOrder } = revelationOrderSlice.actions;

export default revelationOrderSlice.reducer;
