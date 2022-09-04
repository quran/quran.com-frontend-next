import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type UserDataSyncState = {
  lastSyncAt: Date;
};

const initialState: UserDataSyncState = { lastSyncAt: undefined };

/**
 * A slice that will be used to keep track of data related to
 * local and remote syncing of user data.
 */
export const userDataSyncSlice = createSlice({
  name: SliceName.USER_DATA_SYNC,
  initialState,
  reducers: {
    setLastSyncAt: (state, action: PayloadAction<Date>) => ({
      ...state,
      lastSyncAt: action.payload,
    }),
    removeLastSyncAt: (state) => ({
      ...state,
      lastSyncAt: undefined,
    }),
  },
});

export const { setLastSyncAt, removeLastSyncAt } = userDataSyncSlice.actions;

export const selectLastSyncAt = (state: RootState) => state.userDataSync.lastSyncAt;

export default userDataSyncSlice.reducer;
