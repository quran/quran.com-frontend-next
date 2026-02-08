import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AyahWidgetOverrides } from '@/components/AyahWidget/widget-config';
import type { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

/**
 * Redux state for the Ayah Widget feature.
 */
export type AyahWidgetState = {
  /**
   * Per-user overrides applied on top of the widget defaults.
   * These are merged so partial updates persist across navigation/sessions.
   */
  overrides: AyahWidgetOverrides;
};

const initialState: AyahWidgetState = {
  overrides: {},
};

/**
 * Ayah Widget slice.
 *
 * Stores user overrides for the widget builder/runtime.
 * The updates are merged to allow partial updates without losing previous values.
 */
export const ayahWidgetSlice = createSlice({
  name: SliceName.AYAH_WIDGET,
  initialState,
  reducers: {
    /**
     * Merge user overrides into the existing overrides object.
     *
     * @param {AyahWidgetState} state - Current slice state.
     * @param {PayloadAction<AyahWidgetOverrides>} action - Redux action carrying a partial/full overrides object.
     * @returns {AyahWidgetState} The next slice state with merged overrides.
     */
    updateAyahWidgetOverrides: (
      state: AyahWidgetState,
      action: PayloadAction<AyahWidgetOverrides>,
    ): AyahWidgetState => {
      const nextOverrides: AyahWidgetOverrides = { ...state.overrides, ...action.payload };

      return {
        ...state,
        overrides: nextOverrides,
      };
    },

    /**
     * Reset the slice back to the initial state.
     *
     * @returns {AyahWidgetState} The initial slice state.
     */
    resetAyahWidgetOverrides: (): AyahWidgetState => initialState,
  },
});

export const { updateAyahWidgetOverrides, resetAyahWidgetOverrides } = ayahWidgetSlice.actions;

/**
 * Selector: returns the Ayah Widget overrides from the store.
 *
 * @param {RootState} state - Root Redux state.
 * @returns {AyahWidgetOverrides} Current widget overrides.
 */
export const selectAyahWidgetOverrides = (state: RootState): AyahWidgetOverrides =>
  state.ayahWidget.overrides;

export default ayahWidgetSlice.reducer;
