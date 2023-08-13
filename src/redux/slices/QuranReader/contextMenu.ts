import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type ContextMenu = {
  isExpanded: boolean;
  showReadingPreferenceSwitcher: boolean;
};

const initialState: ContextMenu = { isExpanded: true, showReadingPreferenceSwitcher: false };

export const contextMenuSlice = createSlice({
  name: SliceName.CONTEXT_MENU,
  initialState,
  reducers: {
    setIsExpanded: (state: ContextMenu, action: PayloadAction<boolean>) => ({
      ...state,
      isExpanded: action.payload,
    }),
    setShowReadingPreferenceSwitcher: (state: ContextMenu, action: PayloadAction<boolean>) => ({
      ...state,
      showReadingPreferenceSwitcher: action.payload,
    }),
  },
});

export const { setIsExpanded, setShowReadingPreferenceSwitcher } = contextMenuSlice.actions;

export const selectContextMenu = (state: RootState) => state.contextMenu;

export default contextMenuSlice.reducer;
