import { describe, expect, it } from 'vitest';

import {
  MOBILE_FONT_SCALE_CAP,
  clampQuranScaleForViewport,
  getMaxQuranScaleForViewport,
} from './quran-font-scale';

describe('quran-font-scale', () => {
  describe('getMaxQuranScaleForViewport', () => {
    it('returns mobile cap for widths < 768', () => {
      expect(getMaxQuranScaleForViewport(320)).toBe(MOBILE_FONT_SCALE_CAP);
      expect(getMaxQuranScaleForViewport(375)).toBe(MOBILE_FONT_SCALE_CAP);
      expect(getMaxQuranScaleForViewport(390)).toBe(MOBILE_FONT_SCALE_CAP);
      expect(getMaxQuranScaleForViewport(767)).toBe(MOBILE_FONT_SCALE_CAP);
    });

    it('returns desktop max for widths >= 768', () => {
      expect(getMaxQuranScaleForViewport(768)).toBe(10);
      expect(getMaxQuranScaleForViewport(1200)).toBe(10);
    });
  });

  describe('clampQuranScaleForViewport', () => {
    it('clamps values above the mobile cap', () => {
      expect(clampQuranScaleForViewport(10, 320)).toBe(MOBILE_FONT_SCALE_CAP);
      expect(clampQuranScaleForViewport(10, 500)).toBe(MOBILE_FONT_SCALE_CAP);
    });

    it('preserves values at or below the viewport cap', () => {
      expect(clampQuranScaleForViewport(3, 320)).toBe(3);
      expect(clampQuranScaleForViewport(3, 500)).toBe(3);
      expect(clampQuranScaleForViewport(8, 1024)).toBe(8);
    });
  });
});
