import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type Notes = {
  isVisible: boolean;
};

const initialState: Notes = { isVisible: false };

export const notesSlice = createSlice({
  name: SliceName.NOTES,
  initialState,
  reducers: {
    setIsVisible: (state: Notes, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
  },
});

export const { setIsVisible } = notesSlice.actions;

export const selectNotes = (state: RootState) => state.notes;

export default notesSlice.reducer;
