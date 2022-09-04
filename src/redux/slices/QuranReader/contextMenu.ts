import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type ContextMenu = {
  isExpanded: boolean;
};

const initialState: ContextMenu = { isExpanded: true };

export const contextMenuSlice = createSlice({
  name: SliceName.CONTEXT_MENU,
  initialState,
  reducers: {
    setIsExpanded: (state: ContextMenu, action: PayloadAction<boolean>) => ({
      ...state,
      isExpanded: action.payload,
    }),
  },
});

export const { setIsExpanded } = contextMenuSlice.actions;

export const selectContextMenu = (state: RootState) => state.contextMenu;

export default contextMenuSlice.reducer;
