import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ContextMenu = {
  isExpanded: boolean;
};

const initialState: ContextMenu = { isExpanded: true };

export const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    setIsExpanded: (state: ContextMenu, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isExpanded: action.payload,
      };
    },
  },
});

export const { setIsExpanded } = contextMenuSlice.actions;

export const selectContextMenu = (state) => state.contextMenu;

export default contextMenuSlice.reducer;
