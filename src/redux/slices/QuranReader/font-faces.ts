import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

interface FontFaceState {
  loadedFontFaces: string[];
}

export const initialState: FontFaceState = {
  loadedFontFaces: [],
};

export const fontFacesSlice = createSlice({
  name: 'fontFaces',
  initialState,
  reducers: {
    addLoadedFontFace: (state: FontFaceState, action: PayloadAction<string>) => {
      if (state.loadedFontFaces.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        loadedFontFaces: [...state.loadedFontFaces, action.payload],
      };
    },
    resetLoadedFontFaces: (state: FontFaceState) => ({
      ...state,
      loadedFontFaces: [],
    }),
  },
});

export const selectLoadedFontFaces = (state: RootState) => state.fontFaces.loadedFontFaces;
export const { addLoadedFontFace, resetLoadedFontFaces } = fontFacesSlice.actions;
export default fontFacesSlice.reducer;
