import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export const initialState = {
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
});

export const selectIsReadingByRevelationOrder = (state: RootState): boolean =>
  state.revelationOrder.isReadingByRevelationOrder;

export const { setIsReadingByRevelationOrder } = revelationOrderSlice.actions;

export default revelationOrderSlice.reducer;
