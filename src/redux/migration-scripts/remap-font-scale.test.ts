/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import { needsFontScaleRemap, remapFontScale } from './remap-font-scale';

import { QuranFont } from '@/types/QuranReader';

const GROUP1_FONTS = [
  QuranFont.QPCHafs,
  QuranFont.MadaniV1,
  QuranFont.MadaniV2,
  QuranFont.TajweedV4,
];

const ALL_QURAN_FONTS = [...GROUP1_FONTS, QuranFont.IndoPak];

describe('remap-font-scale', () => {
  describe('needsFontScaleRemap', () => {
    it.each(ALL_QURAN_FONTS.flatMap((font) => [6, 7, 8, 9].map((scale) => [font, scale])))(
      'returns true for Quran font %s at scale %d',
      (font, scale) => {
        expect(needsFontScaleRemap(font as QuranFont, scale as number)).toBe(true);
      },
    );

    it.each(GROUP1_FONTS.map((font) => [font, 4]))(
      'returns true for Group 1 font %s at legacy scale %d',
      (font, scale) => {
        expect(needsFontScaleRemap(font as QuranFont, scale as number)).toBe(true);
      },
    );

    it('returns true for IndoPak at legacy scale 5', () => {
      expect(needsFontScaleRemap(QuranFont.IndoPak, 5)).toBe(true);
    });

    it.each(GROUP1_FONTS.flatMap((font) => [1, 2, 3, 5, 10].map((scale) => [font, scale])))(
      'returns false for Group 1 font %s at scale %d',
      (font, scale) => {
        expect(needsFontScaleRemap(font as QuranFont, scale as number)).toBe(false);
      },
    );

    it.each([1, 2, 3, 4, 10].map((scale) => [QuranFont.IndoPak, scale]))(
      'returns false for IndoPak at scale %d',
      (_font, scale) => {
        expect(needsFontScaleRemap(QuranFont.IndoPak, scale as number)).toBe(false);
      },
    );

    it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
      'returns false for non-Quran font Uthmani at scale %d',
      (scale) => {
        expect(needsFontScaleRemap(QuranFont.Uthmani, scale)).toBe(false);
      },
    );
  });

  describe('remapFontScale', () => {
    it.each(GROUP1_FONTS.map((font) => [font]))(
      'remaps scales correctly for Group 1 font %s',
      (font) => {
        expect(remapFontScale(font as QuranFont, 4)).toBe(7);
        expect(remapFontScale(font as QuranFont, 6)).toBe(7);
        expect(remapFontScale(font as QuranFont, 7)).toBe(9);
        expect(remapFontScale(font as QuranFont, 8)).toBe(10);
        expect(remapFontScale(font as QuranFont, 9)).toBe(10);
        expect(remapFontScale(font as QuranFont, 10)).toBe(10);
      },
    );

    it('remaps scales correctly for IndoPak', () => {
      expect(remapFontScale(QuranFont.IndoPak, 5)).toBe(7);
      expect(remapFontScale(QuranFont.IndoPak, 6)).toBe(7);
      expect(remapFontScale(QuranFont.IndoPak, 7)).toBe(9);
      expect(remapFontScale(QuranFont.IndoPak, 8)).toBe(10);
      expect(remapFontScale(QuranFont.IndoPak, 9)).toBe(10);
      expect(remapFontScale(QuranFont.IndoPak, 10)).toBe(10);
    });

    it.each(GROUP1_FONTS.flatMap((font) => [1, 2, 3, 5].map((scale) => [font, scale])))(
      'returns scale unchanged for Group 1 font %s at scale %d',
      (font, scale) => {
        expect(remapFontScale(font as QuranFont, scale as number)).toBe(scale);
      },
    );

    it.each([1, 2, 3, 4].map((scale) => [QuranFont.IndoPak, scale]))(
      'returns scale unchanged for IndoPak at scale %d',
      (_font, scale) => {
        expect(remapFontScale(QuranFont.IndoPak, scale as number)).toBe(scale);
      },
    );

    it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
      'returns scale unchanged for non-Quran font Uthmani at scale %d',
      (scale) => {
        expect(remapFontScale(QuranFont.Uthmani, scale)).toBe(scale);
      },
    );
  });
});
