import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Notes = {
  isVisible: boolean;
};

const initialState: Notes = { isVisible: false };

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setIsVisible: (state: Notes, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
  },
});

export const { setIsVisible } = notesSlice.actions;

export const selectNotes = (state) => state.notes;

export default notesSlice.reducer;
